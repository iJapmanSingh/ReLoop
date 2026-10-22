import { createContext, useContext, useEffect, useState } from 'react';
import { api, tokenStore } from './api';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);
export const homeFor = (role) => (role === 'COLLECTOR' ? '/collector' : role === 'ADMIN' ? '/admin' : '/citizen');

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!tokenStore.get());

  useEffect(() => {
    if (!tokenStore.get()) return;
    api.me().then(setUser).catch(() => tokenStore.clear()).finally(() => setLoading(false));
  }, []);

  const finish = ({ token, user }) => { tokenStore.set(token); setUser(user); return user; };
  const login = async (email, password) => finish(await api.login({ email, password }));
  const register = async (body) => finish(await api.register(body));
  const logout = () => { tokenStore.clear(); setUser(null); };
  const refresh = async () => { try { setUser(await api.me()); } catch { /* keep the current user */ } };

  return <Ctx.Provider value={{ user, loading, login, register, logout, refresh }}>{children}</Ctx.Provider>;
}
