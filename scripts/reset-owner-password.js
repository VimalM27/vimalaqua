#!/usr/bin/env node
'use strict';
/* OWNER-CONTROLLED PASSWORD RECOVERY. Only someone holding your Supabase service-role key (i.e. you) can run it.
   Sets a new password and signs out every session. There is deliberately NO "forgot password" email link on the website. */
process.env.ADMIN_SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || 'x'.repeat(32);
const readline = require('readline'); const db = require('../server/db'); const C = require('../server/crypto');
function ask(q) { return new Promise(r => { const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true }); rl._writeToOutput = (s) => { if (s.includes(q) || s === '\r\n' || s === '\n') process.stdout.write(s); }; rl.question(q, a => { rl.close(); r(a); }); }); }
(async () => {
  const acct = (await db.select('vp_admin_account', { select: '*', limit: 1 })).rows[0];
  if (!acct) { console.error('No owner exists yet. Run scripts/init-owner.js first.'); process.exit(1); }
  const pw = await ask('New password (hidden): '), pw2 = await ask('Repeat: ');
  if (pw !== pw2) { console.error('Passwords do not match.'); process.exit(1); }
  const problem = C.passwordProblem(pw, acct); if (problem) { console.error(problem); process.exit(1); }
  await db.update('vp_admin_account', { id: 'eq.1' }, { password_hash: await C.hashPassword(pw), password_changed_at: new Date().toISOString() });
  await db.update('vp_admin_sessions', { revoked_at: 'is.null' }, { revoked_at: new Date().toISOString() });
  await db.insert('vp_admin_audit_log', { action: 'password_reset_cli', detail: {} });
  console.log('Password updated and all sessions revoked.');
})().catch(e => { console.error('Failed:', e.message); process.exit(1); });
