import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { handleLogin as loginWithEmail, handleGoogleSignIn } from '../../lib/auth';
import { InputField } from './InputField';

export const LoginForm: React.FC = () => {
  const { isLoading } = useAuth(); // Hanya mengambil isLoading dari context
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load saved credentials on component mount (optional feature - can be implemented later)
  useEffect(() => {
    // Load saved credentials logic can be implemented later with AsyncStorage
    console.log('Component mounted');
  }, []);

  const handleLogin = async () => {
    if (isSubmitting || isLoading) return;

    // Basic validation
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    setIsSubmitting(true);

    try {
      const { user, error } = await loginWithEmail(email.trim(), password);

      if (error) {
        // Penanganan error yang lebih spesifik
        let errorMessage = "Terjadi kesalahan saat login.";
        
        if (error.includes("auth/user-not-found")) {
          errorMessage = "Email tidak terdaftar. Silakan daftar terlebih dahulu.";
        } else if (error.includes("auth/wrong-password")) {
          errorMessage = "Password yang Anda masukkan salah.";
        } else if (error.includes("auth/invalid-email")) {
          errorMessage = "Format email tidak valid.";
        } else if (error.includes("auth/user-disabled")) {
          errorMessage = "Akun Anda telah dinonaktifkan. Silakan hubungi administrator.";
        } else if (error.includes("auth/too-many-requests")) {
          errorMessage = "Terlalu banyak percobaan login. Silakan coba lagi nanti.";
        } else if (error.includes("auth/network-request-failed")) {
          errorMessage = "Koneksi internet bermasalah. Periksa koneksi Anda.";
        } else if (error.includes("auth/invalid-credential")) {
          errorMessage = "Email atau password tidak valid.";
        } else {
          errorMessage = error; // Tampilkan pesan error asli jika tidak ada yang cocok
        }
        
        Alert.alert("Login Gagal", errorMessage);
      }
      // Navigasi setelah login berhasil akan ditangani oleh RootLayout berdasarkan perubahan status user di AuthContext
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (isSubmitting || isLoading) return;

    setIsSubmitting(true);
    try {
      const { user, error } = await handleGoogleSignIn();
      
      if (error) {
        let errorMessage = "Terjadi kesalahan saat login dengan Google.";
        
        if (error.includes("Not implemented")) {
          errorMessage = "Google Sign-In belum tersedia.";
        } else if (error.includes("cancelled")) {
          errorMessage = "Login Google dibatalkan.";
        } else if (error.includes("network")) {
          errorMessage = "Koneksi internet bermasalah. Periksa koneksi Anda.";
        } else {
          errorMessage = error;
        }
        
        Alert.alert("Login Google Gagal", errorMessage);
      }
    } catch (error) {
      console.error('Google login error:', error);
      Alert.alert('Error', 'Failed to initiate Google login. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Email Required', 'Please enter your email address first');
      return;
    }

    // TODO: Implement password reset functionality
    Alert.alert('Coming Soon', 'Password reset feature will be implemented soon');
  };

  const handleSignUp = () => {
    // Handle sign up navigation logic here
    console.log('Sign up pressed');
    router.push('/register');
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image 
          source={require('@/assets/images/logo-nusavarta-kecil.png')}
          style={styles.logoImage}
        />
      </View>

      {/* Title and subtitle */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Log in</Text>
        <Text style={styles.subtitle}>Enter your email and password to log in</Text>
      </View>

      {/* Input fields */}
      <View style={styles.fieldContainer}>
        <InputField
          value={email}
          onChangeText={setEmail}
          placeholder="yourname@email.com"
          style={styles.inputField}
        />
        <InputField
          value={password}
          onChangeText={setPassword}
          placeholder="•••••••"
          secureTextEntry={true}
          showPasswordToggle={true}
          style={styles.inputField}
        />
      </View>

      {/* Remember me and forgot password */}
      <View style={styles.optionsContainer}>
        <TouchableOpacity 
          style={styles.rememberMeContainer}
          onPress={() => setRememberMe(!rememberMe)}
        >
          <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
            {rememberMe && (
              <Ionicons name="checkmark" size={9} color="#FFFFFF" />
            )}
          </View>
          <Text style={styles.rememberMeText}>Remember me</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={handleForgotPassword}>
          <Text style={styles.forgotPasswordText}>Forgot Password ?</Text>
        </TouchableOpacity>
      </View>

      {/* Login button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          onPress={handleLogin} 
          style={[
            styles.loginButtonContainer,
            (isSubmitting || isLoading) && styles.buttonDisabled
          ]}
          disabled={isSubmitting || isLoading}
        >
          <LinearGradient
            colors={['rgba(79, 116, 68, 0.40)', 'rgba(79, 116, 68, 0.40)']}
            style={styles.loginButton}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.loginButtonText}>Log In</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Or login with divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>Or login with</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Google login button */}
        <TouchableOpacity 
          onPress={handleGoogleLogin} 
          style={[
            styles.googleButton,
            (isSubmitting || isLoading) && styles.buttonDisabled
          ]}
          disabled={isSubmitting || isLoading}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#4285F4" />
          ) : (
            <Ionicons name="logo-google" size={18} color="#4285F4" />
          )}
        </TouchableOpacity>
      </View>

      {/* Sign up link */}
      <View style={styles.signUpContainer}>
        <Text style={styles.signUpText}>Don&apos;t have an account?</Text>
        <TouchableOpacity onPress={handleSignUp}>
          <Text style={styles.signUpLink}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 343,
    height: 576,
    padding: 24,
    alignItems: 'center',
    gap: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    backgroundColor: 'rgba(255, 255, 255, 0.60)',
    position: 'relative',
  },
  logoContainer: {
    width: 59,
    height: 64.581,
    position: 'relative',
  },
  logoImage: {
    width: 59,
    height: 65,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  logoOverlay: {
    width: 58,
    height: 65,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  titleContainer: {
    alignItems: 'center',
    gap: 12,
    alignSelf: 'stretch',
  },
  title: {
    color: '#111827',
    fontFamily: 'Agency',
    fontSize: 32,
    fontWeight: '400',
    lineHeight: 41.6,
    letterSpacing: -0.64,
  },
  subtitle: {
    color: '#6C7278',
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16.8,
    letterSpacing: -0.12,
    textAlign: 'center',
  },
  fieldContainer: {
    alignItems: 'flex-end',
    gap: 6,
    alignSelf: 'stretch',
  },
  inputField: {
    alignSelf: 'stretch',
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  checkbox: {
    width: 11,
    height: 11,
    borderRadius: 2,
    borderWidth: 1.5,
    borderColor: '#6C7278',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    backgroundColor: '#6C7278',
  },
  rememberMeText: {
    color: '#6C7278',
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 18,
    letterSpacing: -0.12,
  },
  forgotPasswordText: {
    color: 'rgba(47, 93, 140, 1)',
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16.8,
    letterSpacing: -0.12,
  },
  buttonContainer: {
    alignItems: 'flex-start',
    gap: 24,
    alignSelf: 'stretch',
  },
  loginButtonContainer: {
    height: 48,
    alignSelf: 'stretch',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    shadowColor: 'rgba(37, 62, 167, 0.48)',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 2,
  },
  loginButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: 'rgba(79, 116, 68, 0.40)',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 19.6,
    letterSpacing: -0.14,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    alignSelf: 'stretch',
  },
  dividerLine: {
    width: 96,
    height: 1,
    backgroundColor: '#FFFFFF',
  },
  dividerText: {
    color: '#6C7278',
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 18,
    letterSpacing: -0.12,
  },
  googleButton: {
    height: 48,
    paddingHorizontal: 24,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EFF0F6',
    backgroundColor: '#FFFFFF',
    shadowColor: 'rgba(244, 245, 250, 0.60)',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'stretch',
  },
  signUpText: {
    color: '#6C7278',
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16.8,
    letterSpacing: -0.12,
  },
  signUpLink: {
    color: 'rgba(47, 93, 140, 1)',
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16.8,
    letterSpacing: -0.12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
