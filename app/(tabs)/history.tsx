import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Feather } from '@expo/vector-icons';
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type ChatHistory = {
  id: number;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messageCount: number;
};

// Data dummy untuk riwayat perjalanan
const chatHistory: ChatHistory[] = [
    {
      id: 1,
      title: 'Museum di Jakarta',
      lastMessage: 'Terima kasih atas rekomendasinya!',
      timestamp: new Date('2024-01-01T10:30:00'),
      messageCount: 12,
    },
    {
      id: 2,
      title: 'Wisata Budaya Yogyakarta',
      lastMessage: 'Saya akan pergi ke Borobudur besok',
      timestamp: new Date('2024-01-01T09:15:00'),
      messageCount: 8,
    },
    {
      id: 3,
      title: 'Destinasi di Bali',
      lastMessage: 'Apakah ada rekomendasi tempat makan?',
      timestamp: new Date('2023-12-31T16:45:00'),
      messageCount: 15,
    },
];


export default function HistoryScreen() {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];


  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'short' 
    });
  };

  const handleChatPress = (chatId: number) => {
    // Di Fase 3, ini akan membuka detail rute di peta
    console.log('Open chat:', chatId);
  };

  const handleDeleteChat = (chatId: number) => {
    // Di Fase 3, ini akan menghapus riwayat dari Firestore
    console.log('Delete chat:', chatId);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      
      <View style={[styles.header, { backgroundColor: themeColors.background, borderBottomColor: themeColors.border }]}>
        <Text style={[styles.headerTitle, { color: themeColors.text }]}>Chat History</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Feather name="search" size={20} color={themeColors.icon} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {chatHistory.map((chat) => (
          <TouchableOpacity
            key={chat.id}
            style={[styles.chatItem, { 
              backgroundColor: themeColors.background,
              borderBottomColor: themeColors.border 
            }]}
            onPress={() => handleChatPress(chat.id)}
          >
            <View style={styles.chatInfo}>
              <View style={styles.chatHeader}>
                <Text style={[styles.chatTitle, { color: themeColors.text }]} numberOfLines={1}>
                  {chat.title}
                </Text>
                <Text style={[styles.chatTime, { color: themeColors.icon }]}>
                  {formatDate(chat.timestamp)}
                </Text>
              </View>
              
              <View style={styles.chatDetails}>
                <Text style={[styles.lastMessage, { color: themeColors.icon }]} numberOfLines={1}>
                  {chat.lastMessage}
                </Text>
                <View style={styles.messageCount}>
                  <Text style={styles.messageCountText}>{chat.messageCount}</Text>
                </View>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => handleDeleteChat(chat.id)}
            >
              <Feather name="trash-2" size={16} color="#FF6B6B" />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
        
        {chatHistory.length === 0 && (
          <View style={styles.emptyState}>
            <Feather name="message-circle" size={48} color={themeColors.icon} />
            <Text style={[styles.emptyTitle, { color: themeColors.text }]}>
              No chat history yet
            </Text>
            <Text style={[styles.emptySubtitle, { color: themeColors.icon }]}>
              Start a conversation with nusaAI to see your chat history here
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, },
  headerTitle: { fontSize: 18, fontWeight: '600', },
  headerButton: { padding: 8, },
  content: { flex: 1, },
  chatItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, },
  chatInfo: { flex: 1, },
  chatHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, },
  chatTitle: { fontSize: 16, fontWeight: '600', flex: 1, marginRight: 8, },
  chatTime: { fontSize: 12, },
  chatDetails: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', },
  lastMessage: { fontSize: 14, flex: 1, marginRight: 8, },
  messageCount: { backgroundColor: '#4CAF50', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2, minWidth: 20, alignItems: 'center', },
  messageCountText: { color: 'white', fontSize: 12, fontWeight: '600', },
  deleteButton: { padding: 8, marginLeft: 8, },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32, paddingVertical: 48, },
  emptyTitle: { fontSize: 18, fontWeight: '600', marginTop: 16, marginBottom: 8, },
  emptySubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20, },
});