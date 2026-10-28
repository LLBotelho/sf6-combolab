/** Create four private accounts from a trusted local terminal only. Never commit passwords or admin keys. */
import { createClient } from '@supabase/supabase-js';
import { stdin, stdout, exit } from 'node:process';

const usernames = ['lucas', 'luiz', 'guilherme', 'julio'];
const url = 'https://bwvzxcivxguuyyznpttp.supabase.co';
const emailFor = (name) => `${name}.combolab@example.com`;

function prompt(label, { secret = false } = {}) {
  if (!stdin.isTTY) throw new Error('Rode este script diretamente em um terminal interativo.');
  stdout.write(label);
  return new Promise((resolve, reject) => {
    let input = '';
    stdin.setRawMode(true);
    stdin.resume();
    function read(buffer) {
      const s = buffer.toString('utf8');
      if (s === '\u0003') { cleanup(); reject(new Error('Cancelado pelo usuário.')); exit(130); }
      if (s === '\r' || s === '\n') { cleanup(); stdout.write('\n'); resolve(input); return; }
      if (s === '\u007f') { if (input.length) { input = input.slice(0, -1); if (!secret) stdout.write('\b \b'); } return; }
      if (/^[^\x00-\x1f]+$/.test(s)) { input += s; if (!secret) stdout.write(s); }
    }
    function cleanup() { stdin.off('data', read); stdin.setRawMode(false); stdin.pause(); }
    stdin.on('data', read);
  });
}

console.log('ComboLab — criação privada das quatro contas. As senhas e a chave nunca são gravadas em arquivos.');
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || await prompt('Chave secreta service_role do Supabase: ', { secret: true });
if (!key) throw new Error('Chave obrigatória.');
const admin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
for (const username of usernames) {
  const email = emailFor(username);
  const password = await prompt(`Senha NOVA de ${username} (mínimo 8 caracteres): `, { secret: true });
  if (password.length < 8) { console.error(`${username}: senha curta, não criado.`); continue; }
  // Create exactly one Auth user. Do not blindly reset a pre-existing password.
  const { data: created, error } = await admin.auth.admin.createUser({
    email, password, email_confirm: true, app_metadata: { combolab_username: username },
  });
  let id = created.user?.id;
  if (error) {
    console.error(`${username}: não criado (${error.message}). Se já existir, gerencie a conta no painel Auth.`);
    continue;
  }
  const approved = await admin.from('allowed_players').upsert({ user_id: id }, { onConflict: 'user_id' });
  if (approved.error) { console.error(`${username}: criado, mas autorização falhou: ${approved.error.message}`); continue; }
  console.log(`${username}: conta criada e autorizada.`);
}
console.log('Concluído. Configure no painel Authentication > Providers: desativar novos cadastros.');
