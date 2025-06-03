import { exec } from 'child_process';

function execCommand(command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) reject(stderr || error.message);
      else resolve(stdout.trim());
    });
  });
}

/**
 * Checks Node, npm, and Vite.  
 * Installs Vite automatically if missing and autoInstallMissing is true.
 */
export async function checkTools(autoInstallMissing = false): Promise<string> {
  const results: string[] = [];
  const tools = ['node -v', 'npm -v', 'npx vite --version'];
  const missing: string[] = [];

  results.push('Checking system PATH...');
  results.push(`Current PATH: ${process.env.PATH || 'undefined'}`);

  for (const cmd of tools) {
    try {
      const version = await execCommand(cmd);
      results.push(`${cmd.split(' ')[0]} found: ${version}`);
    } catch (err) {
      results.push(`Error running ${cmd}: ${err}`);
      missing.push(cmd.split(' ')[0]);
    }
  }

  if (missing.length) {
    results.push(`Missing: ${missing.join(', ')}.`);

    if (missing.includes('vite')) {
      if (autoInstallMissing) {
        results.push('Attempting to install Vite globally...');
        try {
          await execCommand('npm install -g vite');
          results.push('Vite installed successfully.');
        } catch (installErr) {
          results.push(`Failed to install Vite: ${installErr}`);
          results.push('Please install Vite manually using: npm install -g vite');
        }
      } else {
        results.push('Vite is missing. Please install it globally by running: npm install -g vite');
      }
    }
  } else {
    results.push('All tools installed.');
  }

  return results.join('\n');
}
