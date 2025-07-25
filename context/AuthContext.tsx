import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../firebaseConfig'; // Impor dari file konfigurasi kita

// Tipe data untuk user dan status loading
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
}

// Membuat Context dengan nilai awal
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
});

// Komponen Provider yang akan membungkus aplikasi
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged adalah pendengar real-time dari Firebase.
    // Ia akan otomatis terpanggil setiap kali status login berubah.
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user); // Set state user dengan data dari Firebase
      setIsLoading(false); // Selesai loading
    });

    // Membersihkan listener saat komponen tidak lagi digunakan
    return () => unsubscribe();
  }, []);

  const value = {
    user,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook untuk mempermudah penggunaan context
export const useAuth = () => {
  return useContext(AuthContext);
};
