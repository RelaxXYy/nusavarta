import {
  GOOGLE_ANDROID_CLIENT_ID,
  GOOGLE_IOS_CLIENT_ID,
  GOOGLE_WEB_CLIENT_ID
} from '@env';
import { AuthRequest, AuthRequestPromptOptions, AuthSessionResult } from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { GoogleAuthProvider, signInWithCredential, UserCredential } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { Alert } from 'react-native';
import { auth, db } from '../firebaseConfig';

// Complete the auth session for web
WebBrowser.maybeCompleteAuthSession();

// Google config interface
interface GoogleConfig {
  webClientId?: string;
  iosClientId?: string;
  androidClientId?: string;
  isValid: boolean;
}

// Google Sign-In result interface
interface GoogleSignInResult {
  idToken: string;
  accessToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    photo?: string;
  };
}

// Google Sign-In configuration
const getGoogleConfig = () => {
  const googleConfig = {
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    webClientId: GOOGLE_WEB_CLIENT_ID,
  };

  // Validate that client IDs are proper OAuth client IDs (not Firebase App IDs)
  const isValidClientId = (clientId: string | undefined) => {
    return clientId && clientId.includes('.apps.googleusercontent.com');
  };

  return {
    ...googleConfig,
    isValid: isValidClientId(googleConfig.webClientId) || 
             isValidClientId(googleConfig.iosClientId) || 
             isValidClientId(googleConfig.androidClientId)
  };
};

// Hook for Google Auth (use this in components)
export function useGoogleAuth(): [
  AuthRequest | null,
  AuthSessionResult | null,
  (options?: AuthRequestPromptOptions) => Promise<AuthSessionResult>
] {
  const config = getGoogleConfig();
  
  const [request, response, promptAsync] = Google.useAuthRequest(
    {
      clientId: config.webClientId, // Use web client for cross-platform compatibility
      iosClientId: config.iosClientId,
      webClientId: config.webClientId,
      scopes: ['profile', 'email'],
    }
    // No redirectUri specified - let Expo determine the best one
  );

  // Return null for request if configuration is invalid
  if (!config.isValid) {
    console.warn('Google Sign-In configuration invalid. OAuth client IDs must end with .apps.googleusercontent.com');
    return [null, response, promptAsync];
  }
  
  // Return the values in the same format that components expect
  return [request, response, promptAsync];
}

// Helper function to create/update user profile after Google sign-in
async function createOrUpdateGoogleUserProfile(user: UserCredential['user']): Promise<void> {
  try {
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    // Only create if user document doesn't exist
    if (!userDoc.exists()) {
      const userData = {
        uid: user.uid,
        email: user.email || '',
        firstName: user.displayName?.split(' ')[0] || '',
        lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        provider: 'google',
        createdAt: serverTimestamp(),
        lastUpdatedAt: serverTimestamp(),
        isEmailVerified: user.emailVerified || false
      };
      
      // Filter out undefined values
      const cleanUserData = Object.fromEntries(
        Object.entries(userData).filter(([_, value]) => value !== undefined)
      );
      
      await setDoc(userDocRef, cleanUserData);
      console.log('Google user profile created successfully');
    } else {
      console.log('Google user profile already exists');
    }
  } catch (error) {
    console.error('Error creating/updating Google user profile:', error);
    // Don't throw error here as sign-in was successful
  }
}

// Service class for Google Sign-In functionality
export class GoogleSignInService {
  // Sign in with Google (for use outside React components)
  static async signInWithGoogle(): Promise<GoogleSignInResult | null> {
    try {
      const config = getGoogleConfig();
      
      // Check if configuration is available
      if (!config.webClientId && !config.iosClientId && !config.androidClientId) {
        Alert.alert(
          'Configuration Missing',
          'Google Sign-In client IDs are not configured. Please add them to your app.json extra configuration.'
        );
        return null;
      }

      // For now, show configuration instructions
      Alert.alert(
        'Google Sign-In Setup Required',
        'Google Sign-In needs to be integrated with your authentication flow. Please use the useGoogleAuth hook in your React components.'
      );
      
      return null;

    } catch (error) {
      console.error('Google Sign-In error:', error);
      Alert.alert(
        'Sign-In Error', 
        'Failed to sign in with Google. Please check your internet connection and try again.'
      );
      return null;
    }
  }

  // Process Google auth result (helper function)
  static async processGoogleAuthResult(authentication: any): Promise<GoogleSignInResult | null> {
    try {
      if (!authentication?.idToken || !authentication?.accessToken) {
        Alert.alert('Error', 'Failed to get authentication tokens');
        return null;
      }

      // Get user info from Google API
      const userInfoResponse = await fetch(
        `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${authentication.accessToken}`,
        {
          headers: { 
            Authorization: `Bearer ${authentication.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!userInfoResponse.ok) {
        throw new Error('Failed to fetch user information');
      }

      const userInfo = await userInfoResponse.json();

      return {
        idToken: authentication.idToken,
        accessToken: authentication.accessToken,
        user: {
          id: userInfo.id,
          name: userInfo.name || `${userInfo.given_name || ''} ${userInfo.family_name || ''}`.trim(),
          email: userInfo.email,
          photo: userInfo.picture,
        },
      };

    } catch (error) {
      console.error('Error processing Google auth result:', error);
      Alert.alert('Error', 'Failed to process Google authentication');
      return null;
    }
  }

  // Check if Google Sign-In is properly configured
  static isConfigured(): boolean {
    const config = getGoogleConfig();
    return !!(config.webClientId || config.iosClientId || config.androidClientId);
  }

  // Get current configuration status
  static getConfigurationStatus(): {
    configured: boolean;
    hasWebClient: boolean;
    hasIosClient: boolean;
    hasAndroidClient: boolean;
  } {
    const config = getGoogleConfig();
    
    return {
      configured: this.isConfigured(),
      hasWebClient: !!config.webClientId,
      hasIosClient: !!config.iosClientId,
      hasAndroidClient: !!config.androidClientId,
    };
  }
}

// Export interface for external use
export type { GoogleSignInResult };

/*
Setup Instructions for Google Sign-In:

1. Configure your app.json with Google OAuth client IDs:
   {
     "expo": {
       "extra": {
         "googleWebClientId": "your-web-client-id.googleusercontent.com",
         "googleIosClientId": "your-ios-client-id.googleusercontent.com", 
         "googleAndroidClientId": "your-android-client-id.googleusercontent.com"
       }
     }
   }

2. Add OAuth client IDs to Firebase Authentication:
   - Go to Firebase Console > Authentication > Sign-in method
   - Enable Google sign-in
   - Add your OAuth client IDs

3. Usage in React components:
   import { useGoogleAuth, GoogleSignInService } from './services/googleSignInService';
   
   function LoginScreen() {
     const [request, response, promptAsync] = useGoogleAuth();
     
     const handleGoogleLogin = async () => {
       const result = await promptAsync();
       if (result.type === 'success') {
         const googleResult = await GoogleSignInService.processGoogleAuthResult(result.authentication);
         // Use googleResult.idToken with your Firebase auth
       }
     };
   }
*/

// Complete Google Sign-In function that creates Firebase user
export async function signInWithGoogle(): Promise<{ success: boolean; user?: UserCredential['user']; error?: string }> {
  try {
    const config = getGoogleConfig();
    
    if (!config.isValid) {
      return {
        success: false,
        error: 'Google Sign-In is not properly configured. Please check your OAuth client IDs in app.json'
      };
    }

    // This would need to be called from a component that has the response
    // For now, this is a placeholder that shows the structure
    return {
      success: false,
      error: 'Please use the useGoogleAuth hook in your components for Google Sign-In'
    };

  } catch (error) {
    console.error('Google Sign-In error:', error);
    return {
      success: false,
      error: 'Failed to sign in with Google'
    };
  }
}

// Process the Google authentication response and sign in to Firebase
export async function processGoogleSignIn(response: any): Promise<{ success: boolean; user?: UserCredential['user']; error?: string }> {
  try {
    if (response?.type !== 'success' || !response.authentication) {
      return {
        success: false,
        error: 'Google Sign-In was cancelled or failed'
      };
    }

    const { idToken, accessToken } = response.authentication;
    
    if (!idToken) {
      return {
        success: false,
        error: 'Failed to get Google ID token'
      };
    }

    // Create Firebase credential
    const credential = GoogleAuthProvider.credential(idToken, accessToken);
    
    // Sign in to Firebase
    const userCredential = await signInWithCredential(auth, credential);
    
    // Create/update user profile
    await createOrUpdateGoogleUserProfile(userCredential.user);
    
    return {
      success: true,
      user: userCredential.user
    };

  } catch (error) {
    console.error('Error processing Google Sign-In:', error);
    return {
      success: false,
      error: 'Failed to complete Google Sign-In'
    };
  }
}
