import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider, useAuth } from '../context/AuthContext';

// Mencegah splash screen hilang secara otomatis
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // Jika loading pengecekan auth sudah selesai
    if (!isLoading) {
      const inAuthGroup = segments[0] === '(tabs)';

      if (user && !inAuthGroup) {
        // Jika user sudah login dan TIDAK berada di halaman utama,
        // paksa arahkan ke halaman utama.
        router.replace('/home');
      } else if (!user) {
        // Jika user belum login, paksa arahkan ke halaman login.
        // Ini akan berjalan bahkan jika pengguna mencoba membuka halaman lain.
        router.replace('/login');
      }
      
      // Sembunyikan splash screen setelah logika navigasi selesai
      SplashScreen.hideAsync();
    }
  }, [user, isLoading]);

  // Selama loading, jangan tampilkan apa-apa (splash screen masih terlihat)
  if (isLoading) {
    return null;
  }

  return (
      <Stack>
        {/* Halaman utama aplikasi (dengan tab) */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen 
          name="screens/RouteScreen" 
          options={{ 
            headerShown: true, // Tampilkan header
            title: 'Rute Wisata Budaya', // Judul di header
            headerBackTitle: 'Kembali', // Teks tombol kembali di iOS
          }} 
        />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    Agency: require('../assets/fonts/agency.otf'),
  });

  useEffect(() => {
    if (loaded) {
      // Jangan sembunyikan splash screen di sini
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    // Bungkus seluruh aplikasi dengan AuthProvider
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <RootLayoutNav />
      </ThemeProvider>
    </AuthProvider>
  );
}
