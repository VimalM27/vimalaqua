#!/usr/bin/env node
'use strict';
/* ONE-TIME owner account creation. Run ON YOUR OWN COMPUTER (never on the website):
     SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... ADMIN_SESSION_SECRET=anything32chars+  node scripts/init-owner.js
   It refuses to run if an owner already exists, and the database itself also forbids a second one. */
const readline = require('readline');
process.env.ADMIN_SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || 'x'.repeat(32);   // not used for hashing; satisfies config
const db = require('../server/db'); const C = require('../server/crypto');

function ask(q, hidden) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (hidden) { rl._writeToOutput = (s) => { if (s.includes(q)) process.stdout.write(s); else if (s === '\r\n' || s === '\n') process.stdout.write(s); }; }
    rl.question(q, (a) => { rl.close(); resolve(a); });
  });
}
(async () => {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) { console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY first.'); process.exit(1); }
  const existing = await db.select('vp_admin_account', { select: 'id', limit: 1 });
  if (existing.rows.length) { console.error('An owner account already exists. Use scripts/reset-owner-password.js to change the password.'); process.exit(1); }
  const username = (await ask('Owner username (3-40 chars): ')).trim(); const email = (await ask('Owner email: ')).trim().toLowerCase();
  if (username.length < 3 || username.length > 40 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { console.error('Invalid username or email.'); process.exit(1); }
  const pw = await ask('Password (min 12 chars, hidden): ', true); const pw2 = await ask('Repeat password: ', true);
  if (pw !== pw2) { console.error('Passwords do not match.'); process.exit(1); }
  const problem = C.passwordProblem(pw, { username, email }); if (problem) { console.error(problem); process.exit(1); }
  await db.insert('vp_admin_account', { username, email, password_hash: await C.hashPassword(pw) });
  await db.insert('vp_admin_audit_log', { action: 'owner_initialised', detail: { via: 'cli' } });
  console.log('\nOwner account created. Sign in at https://vimal27.in/admin/login');
})().catch(e => { console.error('Failed:', e.message); process.exit(1); });
