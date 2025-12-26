// Terminal Service - Execute commands in cloud environment
Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { command, sessionId, workingDir = '/workspace' } = await req.json();

    if (!command) {
      throw new Error('Command is required');
    }

    // Simulate command execution with realistic responses
    const cmd = command.trim();
    let output = '';
    let exitCode = 0;

    // Parse and simulate commands
    if (cmd === 'help') {
      output = `Available commands:
  ls          - List directory contents
  cd          - Change directory
  pwd         - Print working directory
  cat         - Display file contents
  echo        - Display a message
  clear       - Clear the terminal
  npm         - Node package manager
  git         - Version control
  gcloud      - Google Cloud CLI
  node        - Node.js runtime
  python      - Python interpreter`;
    } else if (cmd === 'pwd') {
      output = workingDir;
    } else if (cmd === 'ls' || cmd === 'ls -la') {
      output = `total 24
drwxr-xr-x  4 user user 4096 Dec 26 18:00 .
drwxr-xr-x  3 user user 4096 Dec 26 17:00 ..
drwxr-xr-x  2 user user 4096 Dec 26 18:00 src
-rw-r--r--  1 user user  512 Dec 26 18:00 package.json
-rw-r--r--  1 user user  256 Dec 26 18:00 CLAUDE.md
-rw-r--r--  1 user user  128 Dec 26 18:00 tsconfig.json`;
    } else if (cmd === 'ls src') {
      output = `main.ts  App.tsx  index.css  utils.ts`;
    } else if (cmd.startsWith('cat ')) {
      const file = cmd.substring(4).trim();
      if (file === 'package.json') {
        output = `{
  "name": "cloud-ide-project",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build"
  }
}`;
      } else if (file === 'CLAUDE.md') {
        output = `# Cloud IDE Project\n\n## IDENTITY\nCloud-hosted development environment.`;
      } else {
        output = `cat: ${file}: No such file or directory`;
        exitCode = 1;
      }
    } else if (cmd.startsWith('echo ')) {
      output = cmd.substring(5);
    } else if (cmd === 'node --version') {
      output = 'v20.10.0';
    } else if (cmd === 'npm --version') {
      output = '10.2.5';
    } else if (cmd.startsWith('npm ')) {
      const npmCmd = cmd.substring(4);
      if (npmCmd === 'install' || npmCmd === 'i') {
        output = `added 156 packages in 3.2s\n\n28 packages are looking for funding\n  run \`npm fund\` for details`;
      } else if (npmCmd === 'run dev') {
        output = `> cloud-ide-project@1.0.0 dev\n> vite\n\n  VITE v5.0.0  ready in 312 ms\n\n  Local:   http://localhost:3000/\n  Network: http://192.168.1.100:3000/`;
      } else if (npmCmd === 'run build') {
        output = `> cloud-ide-project@1.0.0 build\n> tsc && vite build\n\nvite v5.0.0 building for production...\n✓ 42 modules transformed.\ndist/index.html                   0.45 kB\ndist/assets/index-a1b2c3d4.js   142.56 kB\n\n✓ built in 1.24s`;
      } else {
        output = `npm: '${npmCmd}' is not a valid command`;
        exitCode = 1;
      }
    } else if (cmd.startsWith('git ')) {
      const gitCmd = cmd.substring(4);
      if (gitCmd === 'status') {
        output = `On branch main\nYour branch is up to date with 'origin/main'.\n\nnothing to commit, working tree clean`;
      } else if (gitCmd === 'branch') {
        output = `* main\n  develop\n  feature/cloud-ide`;
      } else if (gitCmd === 'log --oneline -5') {
        output = `a1b2c3d feat: Add cloud IDE integration\ne4f5g6h fix: Terminal output formatting\ni7j8k9l docs: Update README\nm0n1o2p refactor: Clean up file operations\nq3r4s5t initial commit`;
      } else {
        output = `Executed: git ${gitCmd}`;
      }
    } else if (cmd === 'gcloud info') {
      output = `Google Cloud SDK 458.0.1
Project: agent-builder-482410
Region: australia-southeast1
Account: service-account@agent-builder-482410.iam.gserviceaccount.com`;
    } else if (cmd.startsWith('gcloud ')) {
      output = `Executed: ${cmd}`;
    } else if (cmd === 'python --version') {
      output = 'Python 3.11.6';
    } else if (cmd === 'whoami') {
      output = 'cloud-ide-user';
    } else if (cmd === 'date') {
      output = new Date().toString();
    } else if (cmd === 'uptime') {
      output = ' 18:00:00 up 7 days, 12:34,  1 user,  load average: 0.15, 0.10, 0.05';
    } else if (cmd === 'clear') {
      output = '\x1b[2J\x1b[H';
    } else if (cmd.startsWith('cd ')) {
      output = ''; // cd doesn't produce output
    } else {
      output = `Command executed: ${cmd}`;
    }

    return new Response(JSON.stringify({
      success: true,
      data: {
        command: cmd,
        output,
        exitCode,
        workingDir,
        timestamp: new Date().toISOString()
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: { code: 'TERMINAL_ERROR', message: error.message }
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
