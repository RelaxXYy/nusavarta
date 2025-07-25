import React, { useState } from 'react';
import { View, Pressable, Text as RNText, StyleSheet, Alert, TextInput, Image } from 'react-native';
import { Text as ThemedText, View as ThemedView } from '../components/Themed'; // <-- Path dan Nama Impor Diperbaiki
import { handleLogin, handleSignUp, handleGoogleSignIn } from '../lib/auth'; // Impor fungsi auth

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const onLoginPress = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Email dan password harus diisi.");
      return;
    }
    const { user, error } = await handleLogin(email, password);
    if (error) {
      Alert.alert("Login Gagal", error);
    }
    // Navigasi akan ditangani secara otomatis oleh AuthContext di _layout.tsx
  };

  const onSignUpPress = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Email dan password harus diisi.");
      return;
    }
    const { user, error } = await handleSignUp(email, password);
    if (error) {
      Alert.alert("Pendaftaran Gagal", error);
    } else {
      Alert.alert("Sukses", "Akun berhasil dibuat! Silakan login.");
      setIsRegistering(false); // Kembali ke mode login setelah berhasil daftar
    }
  };

  return (
    <ThemedView style={styles.container}>
        <Image 
          source={require('../assets/images/icon.png')} // Ganti dengan path logo Anda jika ada
          style={styles.logo}
        />
        <ThemedText style={styles.title}>Selamat Datang di Nusavarta!</ThemedText>
        <ThemedText style={styles.subtitle}>
          {isRegistering ? 'Buat akun untuk memulai' : 'Masuk untuk melanjutkan petualangan Anda'}
        </ThemedText>

        <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#888"
        />
        <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#888"
        />

        {isRegistering ? (
            <Pressable style={styles.button} onPress={onSignUpPress}>
            <RNText style={styles.buttonText}>Daftar</RNText>
            </Pressable>
        ) : (
            <Pressable style={styles.button} onPress={onLoginPress}>
            <RNText style={styles.buttonText}>Login</RNText>
            </Pressable>
        )}

        <Pressable onPress={() => setIsRegistering(!isRegistering)}>
            <RNText style={styles.switchText}>
            {isRegistering ? 'Sudah punya akun? Login' : 'Belum punya akun? Daftar'}
            </RNText>
        </Pressable>

        <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <RNText style={styles.dividerText}>atau</RNText>
            <View style={styles.divider} />
        </View>

        <Pressable style={[styles.button, styles.socialButton]} onPress={handleGoogleSignIn}>
            {/* Anda bisa menambahkan Ikon Google di sini */}
            <RNText style={styles.buttonText}>Lanjutkan dengan Google</RNText>
        </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    marginBottom: 30,
    textAlign: 'center',
    fontSize: 16,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    color: '#333' // Ganti warna teks sesuai tema Anda
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  switchText: {
    color: '#007AFF',
    textAlign: 'center',
    marginTop: 20,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#ccc',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#888',
  },
  socialButton: {
    backgroundColor: '#4285F4',
  },
});
