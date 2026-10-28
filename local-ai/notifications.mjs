import {execFile} from 'node:child_process';
import {appendFile, mkdir, readFile} from 'node:fs/promises';
import {homedir} from 'node:os';
import {basename, dirname, join} from 'node:path';
import {pathToFileURL} from 'node:url';

export const CONFIG_PATH = join(homedir(), '.config/local-ai/notifications.json');
const LOG_PATH = join(homedir(), '.local/state/local-ai/notifications.log');
const KDECONNECT = '/usr/bin/kdeconnect-cli';
const TIMEOUT_MS = 5000;

export function runCommand(command, args, options) {
  return new Promise((resolve, reject) => {
    execFile(command, args, options, (error, stdout) => error ? reject(error) : resolve(stdout));
  });
}

async function logFailure(message) {
  try {
    await mkdir(dirname(LOG_PATH), {recursive: true});
    await appendFile(LOG_PATH, `${new Date().toISOString()} ${message}\n`, {mode: 0o600});
  } catch {
    // Logging must not turn a failed notification into a failed task.
  }
}

export function notificationMessage({app, kind, reason, workspace, sessionID}) {
  const clean = value => String(value ?? '').replace(/[\r\n\x00-\x1f\x7f]/g, ' ').trim();
  const status = kind === 'finished' ? 'task finished' : `needs attention — ${clean(reason) || 'input required'}`;
  const project = workspace ? ` — ${clean(basename(workspace)).slice(0, 80)}` : '';
  const session = sessionID ? ` [${clean(sessionID).slice(-8)}]` : '';
  return `${clean(app)} ${status}${project}${session}`;
}

export function createNotifier({configPath = CONFIG_PATH, run = runCommand, log = logFailure} = {}) {
  return async notification => {
    const result = {sent: 0, failed: 0, skipped: false};
    const report = async message => { try { await log(message); } catch {} };
    try {
      let config = {enabled: true};
      try {
        config = JSON.parse(await readFile(configPath, 'utf8'));
        if (typeof config.enabled !== 'boolean') throw new Error('enabled must be a boolean');
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
      }
      if (!config.enabled) return {...result, skipped: true};
      const options = {timeout: TIMEOUT_MS, killSignal: 'SIGKILL', maxBuffer: 64 * 1024, encoding: 'utf8'};
      const output = await run(KDECONNECT, ['--list-available', '--id-only'], options);
      const devices = [...new Set(String(output).split(/\s+/).filter(Boolean))];
      if (!devices.length) return {...result, skipped: true};
      const message = notificationMessage(notification);
      await Promise.all(devices.map(async id => {
        try {
          await run(KDECONNECT, ['-d', id, '--ping-msg', message], options);
          result.sent++;
        } catch (error) {
          result.failed++;
          await report(`${notification.app}: delivery to ${id} failed: ${error.message}`);
        }
      }));
    } catch (error) {
      result.failed++;
      await report(`${notification.app}: notification failed: ${error.message}`);
    }
    return result;
  };
}

export const notify = createNotifier();

// Bounded memory for duplicates; no disk queue and no stale alerts after restart.
export function remember(limit = 2048) {
  const keys = new Set();
  return key => {
    if (keys.has(key)) return false;
    keys.add(key);
    if (keys.size > limit) keys.delete(keys.values().next().value);
    return true;
  };
}

export function deliver(sender, notification) {
  // Observers never await desktop delivery or allow sender errors to escape.
  try { Promise.resolve(sender(notification)).catch(() => {}); } catch {}
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv[2] !== '--test') {
    console.error('Usage: node notifications.mjs --test [OpenCode|DSH|Pi]');
    process.exitCode = 2;
  } else {
    const result = await notify({app: process.argv[3] ?? 'OpenCode', kind: 'attention', reason: 'notification test'});
    console.log(JSON.stringify(result));
    process.exitCode = result.failed ? 1 : 0;
  }
}
