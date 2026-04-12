import { Stack, router } from 'expo-router';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '../context/AuthContext';

function RootLayoutNav() {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Redirige condicionalmente según el rol
      switch (user.role) {
        case 'OWNER':
          router.replace('/(owner)/dashboard');
          break;
        case 'STORE':
          router.replace('/(store)/dashboard');
          break;
        case 'ADMIN':
          router.replace('/(admin)/dashboard');
          break;
      }
    }
  }, [user]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(owner)" />
      <Stack.Screen name="(store)" />
      <Stack.Screen name="(admin)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
