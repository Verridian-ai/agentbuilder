// Terminal Service - Real command execution simulation for Cloud IDE
// Simulates code-server terminal with realistic output

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

    const cmd = command.trim();
    const result = executeCommand(cmd, workingDir);

    // Log to Neon DB (in production)
    // await logTerminalCommand(sessionId, cmd, result.output, result.exitCode);

    return new Response(JSON.stringify({
      success: true,
      data: {
        command: cmd,
        output: result.output,
        exitCode: result.exitCode,
        workingDir: result.workingDir || workingDir,
        timestamp: new Date().toISOString(),
        executionTime: result.executionTime || 0
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

interface CommandResult {
  output: string;
  exitCode: number;
  workingDir?: string;
  executionTime?: number;
}

function executeCommand(cmd: string, workingDir: string): CommandResult {
  const startTime = Date.now();
  let output = '';
  let exitCode = 0;

  // Parse command and arguments
  const parts = cmd.split(/\s+/);
  const baseCmd = parts[0];
  const args = parts.slice(1);

  switch (baseCmd) {
    case 'help':
    case '--help':
      output = `Agent Builder Cloud Terminal v1.0.0
Available commands:
  File System:
    ls, ll, dir     List directory contents
    cd              Change directory
    pwd             Print working directory
    cat             Display file contents
    mkdir           Create directory
    touch           Create empty file
    rm              Remove file
    cp              Copy file
    mv              Move/rename file

  Development:
    npm             Node package manager
    node            Node.js runtime
    python          Python interpreter
    git             Version control
    
  Cloud:
    gcloud          Google Cloud CLI
    gsutil          Cloud Storage utility
    
  System:
    echo            Display message
    clear           Clear terminal
    date            Show current date/time
    whoami          Show current user
    env             Show environment variables
    history         Command history`;
      break;

    case 'pwd':
      output = workingDir;
      break;

    case 'ls':
    case 'll':
    case 'dir':
      if (args.includes('-la') || args.includes('-l') || baseCmd === 'll') {
        output = `total 32
drwxr-xr-x  5 cloud-user cloud-user 4096 Dec 26 20:00 .
drwxr-xr-x  3 cloud-user cloud-user 4096 Dec 26 19:00 ..
-rw-r--r--  1 cloud-user cloud-user  256 Dec 26 20:00 .env
drwxr-xr-x  2 cloud-user cloud-user 4096 Dec 26 20:00 src
-rw-r--r--  1 cloud-user cloud-user  512 Dec 26 20:00 package.json
-rw-r--r--  1 cloud-user cloud-user  384 Dec 26 20:00 tsconfig.json
-rw-r--r--  1 cloud-user cloud-user 1024 Dec 26 20:00 CLAUDE.md`;
      } else if (args[0] === 'src') {
        output = 'main.ts  App.tsx  utils.ts  index.css';
      } else {
        output = 'src  package.json  tsconfig.json  CLAUDE.md  .env';
      }
      break;

    case 'cat':
      if (!args[0]) {
        output = 'cat: missing operand';
        exitCode = 1;
      } else if (args[0] === 'package.json') {
        output = `{
  "name": "agent-builder-platform",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "deploy": "gcloud run deploy"
  }
}`;
      } else if (args[0] === 'CLAUDE.md') {
        output = `# Agent Builder Platform

## IDENTITY
Cloud-hosted agent development platform.

## WORKFLOW
1. Create agents visually
2. Configure tools and MCP servers
3. Generate setup scripts
4. Deploy to production`;
      } else {
        output = `cat: ${args[0]}: No such file or directory`;
        exitCode = 1;
      }
      break;

    case 'echo':
      output = args.join(' ');
      break;

    case 'date':
      output = new Date().toString();
      break;

    case 'whoami':
      output = 'cloud-user';
      break;

    case 'hostname':
      output = 'agent-builder-platform.run.app';
      break;

    case 'env':
      output = `NODE_ENV=production
GOOGLE_CLOUD_PROJECT=agent-builder-482410
CLOUD_REGION=australia-southeast1
NEON_DB=connected
STORAGE_BUCKET=agent-builder-ide-files
OPENROUTER_API=configured`;
      break;

    case 'node':
      if (args[0] === '--version' || args[0] === '-v') {
        output = 'v20.10.0';
      } else {
        output = 'Welcome to Node.js v20.10.0.\nType ".help" for more information.';
      }
      break;

    case 'npm':
      if (args[0] === '--version' || args[0] === '-v') {
        output = '10.2.5';
      } else if (args[0] === 'install' || args[0] === 'i') {
        output = `added 156 packages, and audited 157 packages in 2.8s

28 packages are looking for funding
  run \`npm fund\` for details

found 0 vulnerabilities`;
      } else if (args[0] === 'run') {
        if (args[1] === 'dev') {
          output = `> agent-builder-platform@1.0.0 dev
> vite

  VITE v5.4.2  ready in 312 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://10.0.0.5:5173/
  ➜  press h + enter to show help`;
        } else if (args[1] === 'build') {
          output = `> agent-builder-platform@1.0.0 build
> tsc && vite build

vite v5.4.2 building for production...
✓ 847 modules transformed.
dist/index.html                   0.46 kB │ gzip:  0.30 kB
dist/assets/index-Ck2bQnlz.css   42.15 kB │ gzip:  8.12 kB
dist/assets/index-BqL7rVkz.js   312.48 kB │ gzip: 98.56 kB
✓ built in 3.24s`;
        } else {
          output = `npm run ${args[1] || ''}: script not found`;
          exitCode = 1;
        }
      } else if (args[0] === 'list' || args[0] === 'ls') {
        output = `agent-builder-platform@1.0.0 /workspace
├── react@18.3.1
├── react-dom@18.3.1
├── zustand@4.5.2
├── lucide-react@0.364.0
└── @neondatabase/serverless@0.9.0`;
      } else {
        output = `Usage: npm <command>
Commands: install, run, list, update, test`;
      }
      break;

    case 'git':
      if (args[0] === 'status') {
        output = `On branch main
Your branch is up to date with 'origin/main'.

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)

        modified:   src/App.tsx
        modified:   src/utils.ts

no changes added to commit`;
      } else if (args[0] === 'branch') {
        output = `* main
  develop
  feature/cloud-ide
  feature/neon-auth`;
      } else if (args[0] === 'log') {
        output = `commit a1b2c3d4e5f6 (HEAD -> main, origin/main)
Author: cloud-user <user@example.com>
Date:   Thu Dec 26 20:00:00 2024 +0000

    feat: Add Neon DB integration

commit b2c3d4e5f6a7
Author: cloud-user <user@example.com>
Date:   Thu Dec 26 19:30:00 2024 +0000

    feat: Implement Cloud IDE interface`;
      } else if (args[0] === 'remote') {
        output = `origin  https://github.com/verridian-ai/agent-builder.git (fetch)
origin  https://github.com/verridian-ai/agent-builder.git (push)`;
      } else {
        output = `git ${args.join(' ')}: executed successfully`;
      }
      break;

    case 'gcloud':
      if (args[0] === 'info') {
        output = `Google Cloud SDK 458.0.1
Project: agent-builder-482410
Region: australia-southeast1
Account: cloud-user@agent-builder-482410.iam.gserviceaccount.com

Current Properties:
  [core]
    project: agent-builder-482410
    account: cloud-user@agent-builder-482410.iam.gserviceaccount.com
  [compute]
    region: australia-southeast1`;
      } else if (args[0] === 'run' && args[1] === 'services' && args[2] === 'list') {
        output = `SERVICE                     REGION               URL
agent-builder-platform      australia-southeast1  https://agent-builder-platform.run.app
code-server                 australia-southeast1  https://code-server.run.app`;
      } else {
        output = `Executed: gcloud ${args.join(' ')}`;
      }
      break;

    case 'gsutil':
      if (args[0] === 'ls') {
        output = `gs://agent-builder-ide-files/
gs://agent-builder-user-profiles/
gs://agent-builder-generated-scripts/
gs://agent-builder-project-files/`;
      } else {
        output = `Executed: gsutil ${args.join(' ')}`;
      }
      break;

    case 'python':
    case 'python3':
      if (args[0] === '--version' || args[0] === '-V') {
        output = 'Python 3.11.6';
      } else {
        output = `Python 3.11.6 (main, Oct 23 2024, 00:00:00) [GCC 12.2.0] on linux
Type "help", "copyright", "credits" or "license" for more information.`;
      }
      break;

    case 'clear':
      output = '\x1b[2J\x1b[H';
      break;

    case 'cd':
      return {
        output: '',
        exitCode: 0,
        workingDir: args[0] === '..' ? '/workspace' : `${workingDir}/${args[0] || ''}`.replace('//', '/'),
        executionTime: Date.now() - startTime
      };

    case 'mkdir':
      output = args[0] ? '' : 'mkdir: missing operand';
      exitCode = args[0] ? 0 : 1;
      break;

    case 'touch':
      output = args[0] ? '' : 'touch: missing file operand';
      exitCode = args[0] ? 0 : 1;
      break;

    case 'uptime':
      output = ' 20:00:00 up 7 days, 14:23,  1 user,  load average: 0.08, 0.12, 0.10';
      break;

    case 'df':
      output = `Filesystem     1K-blocks    Used Available Use% Mounted on
/dev/sda1       41943040 8234567  33708473  20% /
tmpfs            4096000       0   4096000   0% /dev/shm`;
      break;

    case 'free':
      output = `              total        used        free      shared  buff/cache   available
Mem:        8388608     2097152     4194304      131072     2097152     6291456
Swap:       2097152           0     2097152`;
      break;

    default:
      output = `${baseCmd}: command executed`;
  }

  return {
    output,
    exitCode,
    executionTime: Date.now() - startTime
  };
}
