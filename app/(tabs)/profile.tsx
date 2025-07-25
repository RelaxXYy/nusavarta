import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Feather } from '@expo/vector-icons';
import React from 'react';
import {
    Image,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { handleLogout } from '@/lib/auth';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];
  const { user } = useAuth();

  const profileOptions = [
    {
      id: 1,
      title: 'Edit Profile',
      icon: 'edit-3',
      onPress: () => console.log('Edit Profile'),
    },
    {
      id: 2,
      title: 'Preferences',
      icon: 'settings',
      onPress: () => console.log('Preferences'),
    },
    {
      id: 5,
      title: 'Help & Support',
      icon: 'help-circle',
      onPress: () => console.log('Help & Support'),
    },
    {
      id: 7,
      title: 'Sign Out',
      icon: 'log-out',
      onPress: handleLogout,
      textColor: '#FF6B6B',
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.profileHeader, { backgroundColor: themeColors.background }]}>
          <View style={styles.profileImageContainer}>
            <Image 
              source={user?.photoURL ? { uri: user.photoURL } : require('@/assets/images/profile-icon.png')}
              style={styles.profileImage}
            />
            <TouchableOpacity style={styles.editImageButton}>
              <Feather name="camera" size={16} color="white" />
            </TouchableOpacity>
          </View>
          
          <Text style={[styles.profileName, { color: themeColors.text }]}>
            {user?.displayName || user?.email?.split('@')[0] || 'User'}
          </Text>
          <Text style={[styles.profileEmail, { color: themeColors.icon }]}>
            {user?.email}
          </Text>
        </View>

        <View style={[styles.optionsContainer, { backgroundColor: themeColors.background }]}>
          {profileOptions.map((option, index) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionItem,
                { 
                  borderBottomColor: themeColors.border,
                  borderBottomWidth: index === profileOptions.length - 1 ? 0 : 1,
                }
              ]}
              onPress={option.onPress}
            >
              <View style={styles.optionLeft}>
                <Feather 
                  name={option.icon as any} 
                  size={20} 
                  color={option.textColor || themeColors.icon} 
                />
                <Text 
                  style={[
                    styles.optionTitle, 
                    { color: option.textColor || themeColors.text }
                  ]}
                >
                  {option.title}
                </Text>
              </View>
              <Feather name="chevron-right" size={16} color={themeColors.icon} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.versionContainer}>
          <Text style={[styles.versionText, { color: themeColors.icon }]}>
            NusaVarta v1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, },
  content: { flex: 1, },
  profileHeader: { alignItems: 'center', paddingVertical: 32, paddingHorizontal: 16, },
  profileImageContainer: { position: 'relative', marginBottom: 16, },
  profileImage: { width: 80, height: 80, borderRadius: 40, },
  editImageButton: { position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14, backgroundColor: '#4CAF50', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'white', },
  profileName: { fontSize: 24, fontWeight: '600', marginBottom: 4, },
  profileEmail: { fontSize: 14, },
  optionsContainer: { marginTop: 16, marginHorizontal: 16, borderRadius: 12, overflow: 'hidden', },
  optionItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, },
  optionLeft: { flexDirection: 'row', alignItems: 'center', },
  optionTitle: { fontSize: 16, marginLeft: 12, fontWeight: '500', },
  versionContainer: { alignItems: 'center', paddingVertical: 24, },
  versionText: { fontSize: 12, },
});