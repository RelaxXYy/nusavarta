import React, { useState } from 'react';
import { View, Pressable, Text as RNText, StyleSheet, Alert, TextInput, Image } from 'react-native';
import { Text as ThemedText, View as ThemedView } from '../components/Themed';
import { handleSignUp } from '../lib/auth';
import { useRouter } from 'expo-router';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const onSignUpPress = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Email dan password harus diisi.");
      return;
    }
    const { user, error } = await handleSignUp(email, password);
    if (error) {
      Alert.alert("Pendaftaran Gagal", error);
    } else {
      Alert.alert(
        "Sukses", 
        "Akun berhasil dibuat! Anda akan diarahkan ke halaman login.",
        [{ text: "OK", onPress: () => router.replace('/login') }]
      );
    }
  };

  return (
    <ThemedView style={styles.container}>
        <Image 
          source={require('../assets/images/icon.png')}
          style={styles.logo}
        />
        <ThemedText style={styles.title}>Buat Akun Baru</ThemedText>
        <ThemedText style={styles.subtitle}>
          Satu langkah lagi menuju petualangan Anda
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

        <Pressable style={styles.button} onPress={onSignUpPress}>
          <RNText style={styles.buttonText}>Daftar</RNText>
        </Pressable>

        <Pressable onPress={() => router.replace('/login')}>
            <RNText style={styles.switchText}>
              Sudah punya akun? Login
            </RNText>
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
    color: '#333'
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
}); 