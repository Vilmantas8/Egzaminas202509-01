#!/usr/bin/env node
/**
 * Kill process using a specific port
 * Usage: node kill-port.js [port]
 */

const { exec } = require('child_process');
const port = process.argv[2] || 5003;

console.log(`🔍 Searching for process using port ${port}...`);

const command = process.platform === 'win32'
  ? `netstat -ano | findstr :${port}`
  : `lsof -ti :${port}`;

exec(command, (error, stdout) => {
  if (error || !stdout.trim()) {
    console.log(`✅ Port ${port} is available!`);
    return;
  }

  // Extract PID from output
  const lines = stdout.trim().split('\n');
  const pids = new Set();
  
  lines.forEach(line => {
    if (process.platform === 'win32') {
      // Windows: extract PID from last column
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && pid !== '0' && !isNaN(pid)) {
        pids.add(pid);
      }
    } else {
      // Unix: PID is the output
      pids.add(line.trim());
    }
  });

  if (pids.size === 0) {
    console.log(`✅ Port ${port} is available!`);
    return;
  }

  // Kill each process
  pids.forEach(pid => {
    const killCmd = process.platform === 'win32'
      ? `taskkill /F /PID ${pid}`
      : `kill -9 ${pid}`;

    console.log(`🔪 Killing process ${pid}...`);
    
    exec(killCmd, (killError) => {
      if (killError) {
        console.error(`❌ Failed to kill process ${pid}:`, killError.message);
      } else {
        console.log(`✅ Successfully killed process ${pid}`);
      }
    });
  });

  console.log(`\n✨ Port ${port} should now be available!`);
  console.log(`💡 You can now run: npm run dev`);
});
