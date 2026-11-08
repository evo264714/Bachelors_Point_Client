import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { auth } from './firebase';
import { api } from './lib';
const Ctx = createContext();
export const useAuth = () => useContext(Ctx);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => onAuthStateChanged(auth, async (u) => {
    setUser(u);
    if (u) api('/users/sync', 'POST', { name: u.displayName }).catch(() => {});
    setLoading(false);
  }), []);
  const register = async (name, email, pass) => {
    const c = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(c.user, { displayName: name });
    await api('/users/sync', 'POST', { name });
  };
  const login = (email, pass) => signInWithEmailAndPassword(auth, email, pass);
  return <Ctx.Provider value={{ user, loading, register, login, logout: () => signOut(auth) }}>{children}</Ctx.Provider>;
}
