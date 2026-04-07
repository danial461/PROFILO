import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role, SubscriptionTier } from '../lib/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, role?: Role) => void;
  logout: () => void;
  updateSubscription: (tier: SubscriptionTier) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('profilo_user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      const storedUsers = localStorage.getItem('profilo_users');
      if (storedUsers) {
        const users: User[] = JSON.parse(storedUsers);
        const latestUser = users.find(u => u.id === parsedUser.id);
        if (latestUser) {
          setUser(latestUser);
          localStorage.setItem('profilo_user', JSON.stringify(latestUser));
          return;
        }
      }
      setUser(parsedUser);
    }
  }, []);

  const login = (email: string, role: Role = 'student') => {
    // Mock login logic
    const storedUsers = localStorage.getItem('profilo_users');
    const users: User[] = storedUsers ? JSON.parse(storedUsers) : [];
    
    let existingUser = users.find(u => u.email === email);
    
    if (!existingUser) {
      existingUser = {
        id: `user_${Math.random().toString(36).substr(2, 9)}`,
        email,
        name: email.split('@')[0],
        role: email.includes('admin') ? 'admin' : role,
        subscriptionTier: 'free',
        enrolledCourses: [],
      };
      users.push(existingUser);
      localStorage.setItem('profilo_users', JSON.stringify(users));
    }
    
    setUser(existingUser);
    localStorage.setItem('profilo_user', JSON.stringify(existingUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('profilo_user');
  };

  const updateSubscription = (tier: SubscriptionTier) => {
    if (user) {
      const updatedUser = { ...user, subscriptionTier: tier };
      setUser(updatedUser);
      localStorage.setItem('profilo_user', JSON.stringify(updatedUser));
      
      const storedUsers = localStorage.getItem('profilo_users');
      if (storedUsers) {
        const users: User[] = JSON.parse(storedUsers);
        const index = users.findIndex(u => u.id === user.id);
        if (index >= 0) {
          users[index] = updatedUser;
          localStorage.setItem('profilo_users', JSON.stringify(users));
        }
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateSubscription }}>
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
