import React from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { GradientBackground } from '../components/ui/GradientBackground';
import { LoginForm } from '../components/ui/LoginForm';

export default function LoginScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <GradientBackground style={styles.background}>
        <View style={styles.content}>
          <LoginForm />
        </View>
      </GradientBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
});
