    import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
    import { useFonts } from 'expo-font';
    import { Stack, useRouter, useSegments } from 'expo-router';
    import * as SplashScreen from 'expo-splash-screen';
    import { useEffect } from 'react';
    import 'react-native-reanimated';

    import { useColorScheme } from '@/hooks/useColorScheme';
    import { AuthProvider, useAuth } from '../context/AuthContext'; // Impor dari context yang baru dibuat

    // Mencegah splash screen hilang secara otomatis
    SplashScreen.preventAutoHideAsync();

    function RootLayoutNav() {
      const { user, isLoading } = useAuth(); // Dapatkan status user dari context
      const router = useRouter();
      const segments = useSegments();

      useEffect(() => {
        // Jika loading pengecekan auth sudah selesai
        if (!isLoading) {
          const inTabsGroup = segments[0] === '(tabs)';

          if (user && !inTabsGroup) {
            // Jika user sudah login dan TIDAK berada di halaman utama,
            // paksa arahkan ke halaman utama.
            router.replace('/(tabs)');
          } else if (!user) {
            // Jika user belum login, paksa arahkan ke halaman login.
            router.replace('/login');
          }
          
          // Sembunyikan splash screen setelah logika navigasi selesai
          SplashScreen.hideAsync();
        }
      }, [user, isLoading, segments]);

      // Selama loading, jangan tampilkan apa-apa (splash screen masih terlihat)
      if (isLoading) {
        return null;
      }

      return (
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ headerShown: false, presentation: 'modal' }} />
            <Stack.Screen name="+not-found" />
          </Stack>
      );
    }

    export default function RootLayout() {
      const colorScheme = useColorScheme();
      const [loaded] = useFonts({
        SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
      });

      useEffect(() => {
        if (loaded) {
          // Jangan sembunyikan splash screen di sini lagi
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
    