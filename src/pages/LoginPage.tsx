import { useState, type FormEvent } from 'react';
import { LockKeyhole, LogIn, ShieldCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function LoginPage() {
  const { signIn, authError } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage(null);
    try { await signIn(username, password); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Erro ao entrar.'); }
    finally { setPending(false); }
  }
  return <main className="login-page">
    <div className="login-card">
      <div className="login-brand"><img src={`${import.meta.env.BASE_URL}assets/sf6-logo.svg`} alt=""/><strong>COMBO<span>LAB</span></strong></div>
      <p className="eyebrow">PLAYER ACCESS / CLOUD SAVE</p>
      <h1>ENTRE NA <span>ARENA.</span></h1>
      <p className="login-description">Entre na sua conta para encontrar seus personagens favoritos e combos em qualquer dispositivo.</p>
      <form onSubmit={(event) => void submit(event)}>
        <label htmlFor="login-username">USUÁRIO</label>
        <input id="login-username" autoComplete="username" type="text" maxLength={20} required value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Ex.: lucas"/>
        <label htmlFor="login-password">SENHA</label>
        <input id="login-password" autoComplete="current-password" type="password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Sua senha"/>
        {(message || authError) && <p className="login-error" role="alert">{message || authError}</p>}
        <button type="submit" className="primary-button" disabled={pending}><LogIn size={18}/>{pending ? 'CONECTANDO...' : 'ENTRAR NA MINHA CONTA'}</button>
      </form>
      <p className="login-note"><LockKeyhole size={15}/> Acesso reservado a jogadores convidados.</p>
      <p className="login-note"><ShieldCheck size={15}/> Cada conta tem sua coleção privada.</p>
    </div>
  </main>;
}
