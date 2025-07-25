import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth } from '../firebaseConfig'; // Impor dari file konfigurasi kita
// import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Helper function to check for Firebase-like errors
const isFirebaseError = (error: unknown): error is { code: string; message: string } => {
  return typeof error === 'object' && error !== null && 'code' in error && 'message' in error;
};


// --- FUNGSI LOGIN DENGAN EMAIL & PASSWORD ---
export const handleLogin = async (email :string, password :string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('User logged in:', userCredential.user.uid);
    return { user: userCredential.user, error: null };
  } catch (error) {
        if (isFirebaseError(error)) {
      console.error('Login Firebase error:', error.message);
      return { user: null, error: error.message };
    }
    console.error('An unexpected login error occurred:', error);
    return { user: null, error: 'An unexpected error occurred. Please try again.' };
  }
};

// --- FUNGSI DAFTAR DENGAN EMAIL & PASSWORD ---
export const handleSignUp = async (email :string, password :string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('User signed up:', userCredential.user.uid);
    return { user: userCredential.user, error: null };
  } catch (error) {
    if (isFirebaseError(error)) {
      console.error('Sign up Firebase error:', error.message);
      return { user: null, error: error.message };
    }
    console.error('An unexpected sign up error occurred:', error);
    return { user: null, error: 'An unexpected error occurred. Please try again.' };
  }
};

// --- FUNGSI LOGOUT ---
export const handleLogout = async () => {
  try {
    await signOut(auth);
    console.log('User logged out');
  } catch (error) {
    if (isFirebaseError(error)) {
      console.error('Logout Firebase error:', error.message);
    } else {
      console.error('An unexpected logout error occurred:', error);
    }
  }
};

// --- FUNGSI LOGIN DENGAN GOOGLE ---
export const handleGoogleSignIn = async () => {
  try {
    // Logika untuk Google Sign-In di mobile akan ditambahkan di sini.
    console.log("Google Sign-In to be implemented");
    alert("Google Sign-In belum diimplementasikan.");
    return { user: null, error: "Not implemented yet" };
  } catch (error) {
        if (error instanceof Error) {
      console.error('Google Sign-In error:', error.message);
      return { user: null, error: error.message };
    }
    console.error('An unexpected Google Sign-In error occurred:', error);
    return { user: null, error: 'An unexpected error occurred. Please try again.' };
  }
};
