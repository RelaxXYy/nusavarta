import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, Stack } from 'expo-router';

export default function RouteScreen() {
  // Kita bisa menggunakan ini nanti untuk menerima data rute
  const params = useLocalSearchParams();

  return (
    <SafeAreaView style={styles.container}>
      {/* Menambahkan judul pada header halaman */}
      <Stack.Screen options={{ title: 'Detail Rute' }} />

      <View style={styles.content}>
        <Text style={styles.title}>Halaman Rute Perjalanan</Text>
        <Text style={styles.subtitle}>
          Peta dan detail rute akan ditampilkan di sini.
        </Text>
        {/* Kita bisa menampilkan parameter untuk debugging */}
        <Text style={styles.params}>
          Data diterima: {JSON.stringify(params)}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  params: {
    fontSize: 12,
    color: '#888',
  }
});