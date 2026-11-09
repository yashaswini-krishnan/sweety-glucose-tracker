import { createContext, useContext, useEffect, useState } from 'react';
import api, { clearToken, readToken, saveToken, setUnauthorizedHandler } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(readToken);
  const [user, setUser] = useState(null);
  // Wait for /auth/me before deciding the user is logged out.
  const [loading, setLoading] = useState(Boolean(readToken()));

  function logout() {
    clearToken();
    setToken(null);
    setUser(null);
  }

  useEffect(() => {
    setUnauthorizedHandler(logout);
  }, []);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    let ignore = false;

    api
      .get('/auth/me')
      .then((response) => {
        if (!ignore) {
          setUser(response.data.user);
        }
      })
      .catch(() => {
        if (!ignore) {
          logout();
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [token]);

  async function login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    saveToken(response.data.token);
    setToken(response.data.token);
    setUser(response.data.user);
  }

  async function register(name, email, password) {
    const response = await api.post('/auth/register', { name, email, password });
    saveToken(response.data.token);
    setToken(response.data.token);
    setUser(response.data.user);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
