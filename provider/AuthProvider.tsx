import React, { createContext, useState, useEffect } from 'react';
// import { supabase } from '../initSupabase';
// import { Session } from '@supabase/supabase-js';

type ContextProps = {
  user: null | boolean;
  session: any;
  hasCompletedOnboarding: boolean;
  signIn: () => void;
  signOut: () => void;
  completeOnboarding: () => void;
};

const AuthContext = createContext<Partial<ContextProps>>({});

interface Props {
  children: React.ReactNode;
}

const AuthProvider = (props: Props) => {
  // user null = loading
  const [user, setUser] = useState<null | boolean>(null);
  const [session, setSession] = useState<any>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(false);

  useEffect(() => {
    // Demo: land straight in the app. Swap for a real session check (wallet / Supabase) later.
    setTimeout(() => {
      setUser(true);
    }, 400);
  }, []);

  const signIn = () => {
    setUser(true);
    setSession({ user: { email: 'test@example.com' } });
  };

  const signOut = () => {
    setUser(false);
    setSession(null);
  };

  const completeOnboarding = () => {
    setHasCompletedOnboarding(true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        hasCompletedOnboarding,
        signIn,
        signOut,
        completeOnboarding,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };