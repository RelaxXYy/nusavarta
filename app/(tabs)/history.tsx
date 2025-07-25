import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Easing,
    Image,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

type Message = {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
};

// Komponen tombol opsi chat
const ChatButton = ({ onPress, text }: { onPress: () => void; text: string }) => (
  <TouchableOpacity style={styles.chatButton} onPress={onPress}>
    <Text style={styles.chatButtonText}>{text}</Text>
  </TouchableOpacity>
);

export default function ChatScreen() {
  const { message } = useLocalSearchParams(); // Mengambil parameter dari navigasi
  
  // State dan Refs untuk animasi dan fungsionalitas
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const typingAnim = useRef(new Animated.Value(0)).current;
  
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  // Animasi masuk saat halaman pertama kali dibuka
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  // Auto-scroll ke pesan terbaru
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  // Logika untuk menangani pesan pertama yang dikirim dari halaman home
  useEffect(() => {
    if (message && typeof message === 'string') {
      const newMessage: Message = {
        id: Date.now(),
        text: message,
        sender: 'user',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, newMessage]);
      
      // Menampilkan indikator "mengetik" dan simulasi respons AI
      simulateAIResponse();
    }
  }, [message]);
  
  // Fungsi untuk mengirim pesan
  const handleSend = () => {
    if (inputText.trim()) {
      const newMessage: Message = {
        id: Date.now(),
        text: inputText.trim(),
        sender: 'user',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, newMessage]);
      setInputText('');
      
      // Menampilkan indikator "mengetik" dan simulasi respons AI
      simulateAIResponse();
    }
  };

  const simulateAIResponse = () => {
    setIsTyping(true);
      
      Animated.loop(
        Animated.sequence([
          Animated.timing(typingAnim, { toValue: 1, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(typingAnim, { toValue: 0, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      ).start();
      
      setTimeout(() => {
        setIsTyping(false);
        typingAnim.stopAnimation();
        typingAnim.setValue(0);
        
        const aiResponse: Message = {
          id: Date.now() + 1,
          text: 'Tentu, saya akan bantu. Apakah Anda ingin rekomendasi tempat wisata di sekitar Bandung?',
          sender: 'ai',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiResponse]);
      }, 2000);
  }

  const handleOptionPress = (option: string) => {
    const newMessage: Message = {
      id: Date.now(),
      text: option,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
    simulateAIResponse(); // Simulasi respons setelah opsi dipilih
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <Animated.View style={[{ flex: 1 }, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <LinearGradient
          colors={['#E8F4F8', '#D4E7DD', '#C8DDD1']}
          style={styles.gradient}
        >
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Image source={require('@/assets/images/nusa-ai-logo.png')} style={styles.logo} />
            <Image source={require('@/assets/images/nusa-ai-text.png')} style={styles.textHeader} />
          </View>
        </View>

        <KeyboardAvoidingView
          style={styles.flex1}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
        >
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((msg, index) => (
              <View key={msg.id}>
                {msg.sender === 'user' ? (
                  <View style={styles.userMessageWrapper}>
                    <View style={styles.userMessageContainer}>
                      <View style={styles.userMessageHeader}>
                        <Text style={styles.senderName}>You</Text>
                        <Text style={styles.timestamp}>{formatTime(msg.timestamp)}</Text>
                      </View>
                      <View style={styles.userMessageBubble}>
                        <Text style={styles.userMessageText}>{msg.text}</Text>
                      </View>
                    </View>
                    <View style={styles.userAvatar}>
                      <Image source={require('@/assets/images/profile-icon.png')} style={styles.avatarIcon}/>
                    </View>
                  </View>
                ) : (
                  <View style={styles.aiMessageWrapper}>
                    <View style={styles.aiAvatar}>
                      <Image source={require('@/assets/images/nusa-ai-logo.png')} style={styles.avatarIcon}/>
                    </View>
                    <View style={styles.aiMessageContainer}>
                      <View style={styles.aiMessageHeader}>
                        <Text style={styles.senderName}>nusaAI</Text>
                        <Text style={styles.timestamp}>{formatTime(msg.timestamp)}</Text>
                      </View>
                      <View style={styles.aiMessageBubble}>
                        <Text style={styles.aiMessageText}>{msg.text}</Text>
                      </View>
                      
                      {index === messages.length - 1 && !isTyping && (
                        <View style={styles.actionButtons}>
                          <ChatButton onPress={() => handleOptionPress('Ya, tentu')} text="Ya, tentu" />
                          <ChatButton onPress={() => handleOptionPress('Tidak, terima kasih')} text="Tidak" />
                        </View>
                      )}
                    </View>
                  </View>
                )}
              </View>
            ))}
            
            {isTyping && (
              <View style={styles.typingContainer}>
                 <View style={styles.aiAvatar}>
                    <Image source={require('@/assets/images/nusa-ai-logo.png')} style={styles.avatarIcon}/>
                </View>
                <View style={styles.typingBubble}>
                  <Animated.View style={[ styles.typingDot, { opacity: typingAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }) }]}/>
                  <Animated.View style={[ styles.typingDot, { opacity: typingAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.3, 1, 0.3] }) }]}/>
                  <Animated.View style={[ styles.typingDot, { opacity: typingAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.3] }) }]}/>
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.inputContainer}>
            <View style={styles.inputRow}>
              <TouchableOpacity style={styles.attachButton}><Feather name="paperclip" size={20} color="#999" /></TouchableOpacity>
              <TextInput
                style={styles.textInput}
                placeholder="Message nusaAI..."
                placeholderTextColor="#999"
                value={inputText}
                onChangeText={setInputText}
                multiline
                textAlignVertical="center"
              />
              <TouchableOpacity style={styles.micButton}><Feather name="mic" size={20} color="#999" /></TouchableOpacity>
              <TouchableOpacity style={styles.sendButton} onPress={handleSend}><Ionicons name="arrow-up" size={20} color="white" /></TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, },
  gradient: { flex: 1, },
  flex1: { flex: 1, },
  header: { paddingHorizontal: 16, paddingVertical: 12, },
  headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', },
  logo: { width: 32, height: 32, marginRight: 8, },
  textHeader: { width: 160, height: 35, marginRight: 8, },
  messagesContainer: { flex: 1, },
  messagesContent: { padding: 16, paddingBottom: 20, },
  userMessageWrapper: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 16, alignItems: 'flex-start', },
  userMessageContainer: { flex: 1, alignItems: 'flex-end', marginRight: 8, },
  userMessageHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, },
  userAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#E3F2FD', justifyContent: 'center', alignItems: 'center', },
  userMessageBubble: { maxWidth: '80%', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#4F7444', borderRadius: 20, borderTopRightRadius: 8, },
  userMessageText: { fontSize: 14, lineHeight: 20, color: 'white', },
  aiMessageWrapper: { flexDirection: 'row', justifyContent: 'flex-start', marginBottom: 16, alignItems: 'flex-start', },
  aiMessageContainer: { flex: 1, alignItems: 'flex-start', marginLeft: 8, },
  aiMessageHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, },
  aiAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center', },
  avatarIcon: { width: 20, height: 20, },
  aiMessageBubble: { maxWidth: '80%', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: 'white', borderRadius: 20, borderTopLeftRadius: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1, }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2, },
  aiMessageText: { fontSize: 14, lineHeight: 20, color: '#2C3E4B', },
  senderName: { fontSize: 12, fontWeight: '600', marginRight: 8, color: '#2C3E4B', },
  timestamp: { fontSize: 10, color: '#999', },
  actionButtons: { flexDirection: 'row', marginTop: 8, gap: 8, },
  chatButton: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: 'white', borderRadius: 16, borderWidth: 1, borderColor: '#E0E0E0', shadowColor: '#000', shadowOffset: { width: 0, height: 1, }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2, },
  chatButtonText: { fontSize: 14, color: '#2C3E4B', fontWeight: '500', },
  inputContainer: { paddingHorizontal: 16, paddingVertical: 15, paddingBottom: 55, backgroundColor: 'transparent', },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, },
  attachButton: { padding: 8, paddingBottom: 13, },
  textInput: { flex: 1, minHeight: 40, maxHeight: 100, backgroundColor: 'white', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: '#2C3E4B', shadowColor: '#000', shadowOffset: { width: 0, height: 1, }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2, paddingTop: 10},
  micButton: { padding: 8, paddingBottom: 13, },
  sendButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#4F7444', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2, }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 3, marginBottom: 6, },
  typingContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, marginLeft: 8 },
  typingBubble: { backgroundColor: '#f0f0f0', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 8, },
  typingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#666', marginHorizontal: 2, },
});