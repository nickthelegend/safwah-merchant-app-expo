import React from 'react';
import { Redirect } from 'expo-router';
import { useSession } from '../provider/SessionProvider';

// Gate the app: unauthenticated merchants see onboarding, authed go to the tabs.
export default function Index() {
  const { isAuthed } = useSession();
  return <Redirect href={isAuthed ? '/(tabs)' : '/onboarding'} />;
}
