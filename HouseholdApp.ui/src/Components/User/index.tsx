import React, { useState, createContext, useCallback, ReactNode } from 'react';
import { baseUrl } from '../../helpers/config.json';

export interface UserContextValue {
  user: any[];
  householdUsers: any[];
  getUsersByUserHousehold: (id: string) => Promise<void>;
  getUserById: (id: string) => Promise<void>;
}

export const UserContext = createContext<UserContextValue | null>(null);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<any[]>([]);
  const [householdUsers, sethouseholdUsers] = useState<any[]>([]);

  const getUsersByUserHousehold = useCallback(async (id: string) => {
    const response = await fetch(`${baseUrl}/Users/${id}`);
    const data = await response.json();
    setUser(data);
  }, []);

  const getUserById = useCallback(async (id: string) => {
    const response = await fetch(`${baseUrl}/Users/UserHousehold/${id}`);
    const data = await response.json();
    sethouseholdUsers(data);
  }, []);

  return (
    <UserContext.Provider value={{
      user,
      householdUsers,
      getUsersByUserHousehold,
      getUserById,
    }}>
      {children}
    </UserContext.Provider>
  );
};
