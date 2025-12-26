import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
    id: number;
    email: string;
    firstname: string;
    lastname: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check local storage on load and verify token with API
        const verifyAuth = async () => {
            const storedToken = localStorage.getItem('mint_admin_token');
            const storedUser = localStorage.getItem('mint_admin_user');

            if (!storedToken || !storedUser) {
                setLoading(false);
                return;
            }

            try {
                // Verify token is still valid with API
                const API_URL = import.meta.env.VITE_API_URL || 'https://mintprints-api.ronny.works';
                const res = await fetch(`${API_URL}/api/admin/verify`, {
                    headers: { 'Authorization': `Bearer ${storedToken}` }
                });

                if (res.ok) {
                    setToken(storedToken);
                    setUser(JSON.parse(storedUser));
                } else {
                    // Token invalid, clear storage
                    localStorage.removeItem('mint_admin_token');
                    localStorage.removeItem('mint_admin_user');
                }
            } catch (e) {
                console.error('Failed to verify auth:', e);
                // On network error, still try to use stored credentials
                try {
                    setToken(storedToken);
                    setUser(JSON.parse(storedUser));
                } catch {
                    localStorage.removeItem('mint_admin_token');
                    localStorage.removeItem('mint_admin_user');
                }
            }
            setLoading(false);
        };

        verifyAuth();
    }, []);

    const login = (newToken: string, newUser: User) => {
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('mint_admin_token', newToken);
        localStorage.setItem('mint_admin_user', JSON.stringify(newUser));
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('mint_admin_token');
        localStorage.removeItem('mint_admin_user');
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            login,
            logout,
            isAuthenticated: !!token,
            loading
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
