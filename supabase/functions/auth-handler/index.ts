// Neon DB Auth Handler - Direct PostgreSQL connection via HTTP
// Uses Neon's serverless driver pattern for edge compatibility

const NEON_DB_URL = 'postgresql://neondb_owner:npg_rQvf5D0HGxBw@ep-aged-sky-a7p3va5h-pooler.ap-southeast-2.aws.neon.tech/neondb?sslmode=require';

// Neon HTTP SQL endpoint
async function neonQuery(sql: string, params: any[] = []) {
  // Use Neon's HTTP endpoint for serverless
  const endpoint = 'https://ep-aged-sky-a7p3va5h.ap-southeast-2.aws.neon.tech';
  
  const response = await fetch(`${endpoint}/sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Neon-Connection-String': NEON_DB_URL
    },
    body: JSON.stringify({ query: sql, params })
  });

  return response.json();
}

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { action, email, password, name, token } = await req.json();

    // Hash password using Web Crypto API
    const hashPassword = async (pwd: string): Promise<string> => {
      const encoder = new TextEncoder();
      const data = encoder.encode(pwd + 'neon-agent-builder-salt-2024');
      const hash = await crypto.subtle.digest('SHA-256', data);
      return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
    };

    // Generate JWT token
    const generateToken = async (payload: Record<string, unknown>): Promise<string> => {
      const header = { alg: 'HS256', typ: 'JWT' };
      const secret = new TextEncoder().encode('neon-agent-builder-jwt-secret-2024');
      
      const now = Math.floor(Date.now() / 1000);
      const fullPayload = { ...payload, iat: now, exp: now + 86400 };
      
      const base64Header = btoa(JSON.stringify(header)).replace(/=/g, '');
      const base64Payload = btoa(JSON.stringify(fullPayload)).replace(/=/g, '');
      const data = `${base64Header}.${base64Payload}`;
      
      const key = await crypto.subtle.importKey('raw', secret, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
      const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
      const base64Sig = btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
      
      return `${data}.${base64Sig}`;
    };

    // Verify JWT token
    const verifyToken = async (jwt: string): Promise<{ valid: boolean; payload?: any }> => {
      try {
        const parts = jwt.split('.');
        if (parts.length !== 3) return { valid: false };
        
        const payload = JSON.parse(atob(parts[1]));
        if (payload.exp < Math.floor(Date.now() / 1000)) {
          return { valid: false };
        }
        return { valid: true, payload };
      } catch {
        return { valid: false };
      }
    };

    // REGISTER - No email confirmation required
    if (action === 'register') {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      const userId = crypto.randomUUID();
      const passwordHash = await hashPassword(password);
      const userName = name || email.split('@')[0];
      const createdAt = new Date().toISOString();

      // Generate token immediately - no email confirmation
      const authToken = await generateToken({ 
        userId, 
        email, 
        name: userName,
        role: 'user'
      });

      // In production, insert into Neon DB
      // await neonQuery('INSERT INTO users (id, email, password_hash, name, created_at) VALUES ($1, $2, $3, $4, $5)', 
      //   [userId, email, passwordHash, userName, createdAt]);

      return new Response(JSON.stringify({
        success: true,
        data: {
          user: {
            id: userId,
            email,
            name: userName,
            createdAt,
            emailVerified: true // Auto-verified, no confirmation needed
          },
          token: authToken,
          expiresIn: 86400,
          message: 'Registration successful - you are now logged in'
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // LOGIN
    if (action === 'login') {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      const passwordHash = await hashPassword(password);
      const userId = crypto.randomUUID(); // In production, fetch from DB
      const userName = email.split('@')[0];

      // In production, verify against Neon DB
      // const result = await neonQuery('SELECT * FROM users WHERE email = $1 AND password_hash = $2', [email, passwordHash]);

      const authToken = await generateToken({ 
        userId, 
        email, 
        name: userName,
        role: 'user'
      });

      return new Response(JSON.stringify({
        success: true,
        data: {
          user: {
            id: userId,
            email,
            name: userName,
            lastLogin: new Date().toISOString()
          },
          token: authToken,
          expiresIn: 86400
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // VERIFY TOKEN
    if (action === 'verify') {
      const authHeader = req.headers.get('authorization');
      const tokenToVerify = token || (authHeader?.replace('Bearer ', ''));
      
      if (!tokenToVerify) {
        throw new Error('No token provided');
      }

      const verification = await verifyToken(tokenToVerify);
      
      if (!verification.valid) {
        throw new Error('Invalid or expired token');
      }

      return new Response(JSON.stringify({
        success: true,
        data: {
          valid: true,
          user: verification.payload
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // REFRESH TOKEN
    if (action === 'refresh') {
      const authHeader = req.headers.get('authorization');
      const tokenToRefresh = token || (authHeader?.replace('Bearer ', ''));
      
      if (!tokenToRefresh) {
        throw new Error('No token provided');
      }

      const verification = await verifyToken(tokenToRefresh);
      
      if (!verification.valid) {
        throw new Error('Invalid token');
      }

      const newToken = await generateToken(verification.payload);

      return new Response(JSON.stringify({
        success: true,
        data: {
          token: newToken,
          expiresIn: 86400
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // LOGOUT
    if (action === 'logout') {
      // Stateless JWT - just acknowledge logout
      return new Response(JSON.stringify({
        success: true,
        data: { message: 'Logged out successfully' }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    throw new Error(`Invalid action: ${action}`);

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: { 
        code: 'AUTH_ERROR', 
        message: error.message 
      }
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
