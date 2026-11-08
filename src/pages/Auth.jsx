import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiLock, FiMail, FiUser } from 'react-icons/fi';
import { useAuth } from '../AuthContext';
import { toast } from '../lib';

// Defined outside Auth so it keeps the same identity between renders (otherwise inputs lose focus on every keystroke)
const Field = ({ Icon, ...p }) => (
  <div className="relative">
    <Icon className="absolute left-3 top-3.5 text-white/50" />
    <input className="input !pl-10" required {...p} />
  </div>
);

export default function Auth({ mode }) {
  const reg = mode === 'register';
  const { login, register } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ name: '', email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (reg) await register(f.name, f.email, f.password);
      else await login(f.email, f.password);
      toast('success', reg ? 'Account created!' : 'Welcome back!');
      nav('/rooms');
    } catch (err) {
      toast('error', err.message.replace('Firebase: ', ''));
    }
    setBusy(false);
  };

  return (
    <form onSubmit={submit} className="glass max-w-md mx-auto mt-16 p-8 space-y-4 animate-pop">
      <h2 className="font-display text-3xl font-extrabold text-center">{reg ? 'Create account' : 'Welcome back'}</h2>
      {reg && <Field Icon={FiUser} placeholder="Full name" value={f.name} onChange={set('name')} />}
      <Field Icon={FiMail} type="email" placeholder="Email" value={f.email} onChange={set('email')} />
      <Field Icon={FiLock} type="password" minLength={6} placeholder="Password (6+ chars)" value={f.password} onChange={set('password')} />
      <button className="btn w-full" disabled={busy}>{busy ? 'Please wait…' : reg ? 'Register' : 'Login'}</button>
      <p className="text-center text-sm text-white/70">
        {reg ? 'Already have an account?' : 'New here?'}{' '}
        <Link className="text-amber-300 underline" to={reg ? '/login' : '/register'}>{reg ? 'Login' : 'Register'}</Link>
      </p>
    </form>
  );
}