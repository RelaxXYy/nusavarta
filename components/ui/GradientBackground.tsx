import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native';

interface GradientBackgroundProps {
  children: React.ReactNode;
  style?: any;
}

export const GradientBackground: React.FC<GradientBackgroundProps> = ({ children, style }) => {
  return (
    <LinearGradient
      colors={[
        'rgba(164, 68, 46, 0.4)',    // Retro-Red with 40% opacity
        'rgba(79, 116, 68, 0.4)',    // Retro-Green with 40% opacity  
        'rgba(47, 93, 140, 0.4)'     // Retro-Blue with 40% opacity
      ]}
      locations={[0, 0.5, 1]}
      start={{ x: 0, y: 0 }}         // Top-left
      end={{ x: 1, y: 1 }}           // Bottom-right (diagonal)
      style={[styles.gradient, style]}
    >
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
});