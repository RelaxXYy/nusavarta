import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/HapticTab';
import { TabBarIcon } from '@/components/TabBarIcon';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: {
          position: 'absolute',
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
      }}>
      {/* PERUBAHAN DI SINI: name="index" menjadi name="home" */}
      <Tabs.Screen
        name="home" 
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              source={require('@/assets/images/home-icon.png')}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              source={require('@/assets/images/chat-icon.png')}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      {/* PERUBAHAN DI SINI: name="explore" menjadi name="history" */}
      <Tabs.Screen
        name="history" 
        options={{
          title: 'History',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              source={require('@/assets/images/history-icon.png')}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              source={require('@/assets/images/profile-icon.png')}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
}