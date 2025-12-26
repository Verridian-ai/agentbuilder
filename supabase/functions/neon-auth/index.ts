// Neon Auth Handler - User registration and login without email confirmation
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
    const NEON_DB_URL = Deno.env.get('NEON_DB_CONNECTION_STRING') || 
      'postgresql://neondb_owner:npg_rQvf5D0HGxBw@ep-aged-sky-a7p3va5h-pooler.ap-southeast-2.aws.neon.tech/neondb?sslmode=require';
    
    const { action, email, password, name } = await req.json();

    // Simple JWT generation using Web Crypto
    const generateToken = async (payload: Record<string, unknown>) => {
      const header = { alg: 'HS256', typ: 'JWT' };
      const secret = new TextEncoder().encode('agent-builder-secret-key-2024');
      
      const base64Header = btoa(JSON.stringify(header));
      const base64Payload = btoa(JSON.stringify({ ...payload, exp: Date.now() + 86400000 }));
      const data = `${base64Header}.${base64Payload}`;
      
      const key = await crypto.subtle.importKey(
        'raw', secret, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
      );
      const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
      const base64Signature = btoa(String.fromCharCode(...new Uint8Array(signature)));
      
      return `${data}.${base64Signature}`;
    };

    // Hash password
    const hashPassword = async (pwd: string) => {
      const encoder = new TextEncoder();
      const data = encoder.encode(pwd + 'agent-builder-salt');
      const hash = await crypto.subtle.digest('SHA-256', data);
      return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
    };

    if (action === 'register') {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      const passwordHash = await hashPassword(password);
      const userId = crypto.randomUUID();
      
      // For demo purposes, store user in memory/return success
      // In production, this would insert into Neon DB
      const token = await generateToken({ userId, email, name: name || email.split('@')[0] });

      return new Response(JSON.stringify({
        success: true,
        data: {
          user: { id: userId, email, name: name || email.split('@')[0] },
          token,
          message: 'Registration successful - no email confirmation required'
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'login') {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      const passwordHash = await hashPassword(password);
      const userId = crypto.randomUUID();
      const token = await generateToken({ userId, email });

      return new Response(JSON.stringify({
        success: true,
        data: {
          user: { id: userId, email, name: email.split('@')[0] },
          token,
          message: 'Login successful'
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'verify') {
      const authHeader = req.headers.get('authorization');
      if (!authHeader) {
        throw new Error('No authorization token');
      }
      
      // Basic token verification
      const token = authHeader.replace('Bearer ', '');
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }

      const payload = JSON.parse(atob(parts[1]));
      if (payload.exp < Date.now()) {
        throw new Error('Token expired');
      }

      return new Response(JSON.stringify({
        success: true,
        data: { user: payload, valid: true }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    throw new Error('Invalid action');

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: { code: 'AUTH_ERROR', message: error.message }
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
