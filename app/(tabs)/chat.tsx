import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
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
    Dimensions,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { collection, addDoc, query, orderBy, onSnapshot, limit, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebaseConfig';

const { width, height } = Dimensions.get('window');

type Message = {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
};

/**
 * Local AI Response Generator - No server required!
 * Generates responses for Indonesian cultural tourism
 */
function generateAIResponse(message: string): string {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("gedung sate")) {
    return "🏛️ Gedung Sate adalah ikon Kota Bandung yang dibangun pada masa kolonial Belanda tahun 1920. Dinamakan Gedung Sate karena bentuk menara yang menyerupai tusuk sate. Bangunan ini merupakan kantor Gubernur Jawa Barat dan contoh arsitektur Art Deco yang indah. Apakah Anda ingin tahu lebih banyak tentang sejarah arsitektur kolonial Bandung?";
  }

  if (lowerMessage.includes("borobudur")) {
    return "🕌 Candi Buddha terbesar di dunia yang dibangun pada abad ke-8-9. Merupakan warisan dunia UNESCO dengan 2.672 panel relief dan 504 arca Buddha. Setiap tingkat Borobudur melambangkan tahapan pencerahan dalam agama Buddha. Tahukah Anda bahwa Borobudur ditemukan kembali oleh Sir Thomas Raffles pada tahun 1814?";
  }

  if (lowerMessage.includes("prambanan")) {
    return "🛕 Kompleks candi Hindu terbesar di Indonesia yang dibangun pada abad ke-9. Terdiri dari 240 candi dengan 3 candi utama untuk Trimurti (Brahma, Wisnu, Siwa). Candi Siwa yang tertinggi mencapai 47 meter! Relief di Prambanan menggambarkan kisah Ramayana yang sangat detail dan indah.";
  }

  if (lowerMessage.includes("batik")) {
    return "🎨 Batik adalah seni membuat kain dengan teknik resist wax yang telah diakui UNESCO sebagai Warisan Budaya Tak Benda Dunia. Setiap motif batik memiliki makna filosofis yang mendalam dan berbeda di setiap daerah. Batik Solo, Yogya, dan Pekalongan memiliki ciri khas masing-masing yang unik!";
  }

  if (lowerMessage.includes("wayang")) {
    return "🎭 Wayang kulit adalah seni pertunjukan tradisional Indonesia menggunakan boneka kulit yang dimainkan oleh dalang. Pertunjukan wayang bisa berlangsung semalam suntuk dengan cerita dari Mahabharata atau Ramayana. Dalang harus menguasai berbagai suara karakter dan memainkan gamelan!";
  }

  if (lowerMessage.includes("rute") || lowerMessage.includes("jalan") || lowerMessage.includes("ke ") || lowerMessage.includes("dari ")) {
    return "🗺️ Saya dapat membantu Anda menemukan rute ke tempat-tempat bersejarah! Saya memiliki informasi lengkap tentang Gedung Sate, Borobudur, Prambanan, dan tempat wisata budaya lainnya. Ke mana Anda ingin pergi? Saya juga bisa memberikan tips perjalanan terbaik!";
  }

  if (lowerMessage.includes("halo") || lowerMessage.includes("hai") || lowerMessage.includes("hello")) {
    return "🙏 Halo! Saya Garudie, pemandu wisata digital Indonesia yang didukung AI. Saya siap membantu Anda menjelajahi kekayaan budaya Nusantara! Saya bisa menceritakan tentang candi-candi bersejarah, seni tradisional, atau merencanakan rute perjalanan budaya. Ada yang ingin Anda ketahui?";
  }

  if (lowerMessage.includes("wisata") || lowerMessage.includes("tempat") || lowerMessage.includes("berkunjung")) {
    return "🌍 Indonesia memiliki begitu banyak tempat wisata budaya yang menakjubkan! Saya merekomendasikan Candi Borobudur dan Prambanan di Jawa Tengah, Gedung Sate di Bandung, atau Anda bisa belajar tentang seni batik dan wayang. Tempat mana yang menarik minat Anda?";
  }

  return `🌟 Terima kasih atas pertanyaan Anda: "${message}". Sebagai pemandu wisata digital, saya dapat membantu Anda dengan informasi tentang tempat bersejarah Indonesia seperti Gedung Sate, Borobudur, Prambanan, serta budaya tradisional seperti batik dan wayang. Saya juga bisa membantu merencanakan rute perjalanan budaya. Silakan tanyakan hal spesifik yang ingin Anda ketahui!`;
}

const ChatButton = ({ onPress, text }: { onPress: () => void; text: string }) => (
  <TouchableOpacity style={styles.chatButton} onPress={onPress}>
    <Text style={styles.chatButtonText}>{text}</Text>
  </TouchableOpacity>
);

export default function ChatScreen() {
  const { message } = useLocalSearchParams();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const typingAnim = useRef(new Animated.Value(0)).current;
  
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: -7.7956,  // Default ke Indonesia (Yogyakarta)
    longitude: 110.3695,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const scrollViewRef = useRef<ScrollView>(null);
  const chatPanelHeight = useRef(new Animated.Value(height * 0.4)).current; // Start with 40% height

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  // Request location permission and get current location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Izin Lokasi', 'Aplikasi memerlukan izin lokasi untuk menampilkan peta yang akurat.');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const currentLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setUserLocation(currentLocation);
      setMapRegion({
        ...currentLocation,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    })();
  }, []);

  useEffect(() => {
    if (message && typeof message === 'string' && messages.length === 0) {
      const newMessage: Message = { id: Date.now(), text: message, sender: 'user', timestamp: new Date() };
      setMessages(prev => [...prev, newMessage]);
      
      // Save user message to Firestore
      addDoc(collection(db, 'messages'), {
        text: message,
        sender: 'user',
        timestamp: serverTimestamp(),
        userId: 'current-user'
      }).catch(console.error);
      
      fetchAIResponse(message);
    }
  }, [message]);
  
  const handleSend = () => {
    if (inputText.trim()) {
      const newMessage: Message = { id: Date.now(), text: inputText.trim(), sender: 'user', timestamp: new Date() };
      setMessages(prev => [...prev, newMessage]);
      
      // Save user message to Firestore
      addDoc(collection(db, 'messages'), {
        text: inputText.trim(),
        sender: 'user',
        timestamp: serverTimestamp(),
        userId: 'current-user'
      }).catch(console.error);
      
      fetchAIResponse(inputText.trim());
      setInputText('');
    }
  };

  // **FUNGSI UTAMA**: Mengambil respons dari backend Nusavarta
  const fetchAIResponse = async (userMessage: string) => {
    setIsTyping(true);
    startTypingAnimation();

    try {
      // Generate AI response locally (no server required!)
      const aiReplyText = generateAIResponse(userMessage);

      // Save to Firestore for persistence
      await addDoc(collection(db, 'messages'), {
        text: aiReplyText,
        sender: 'ai',
        timestamp: serverTimestamp(),
        userId: 'current-user' // You can implement proper user ID later
      });

      const aiResponse: Message = {
        id: Date.now() + 1,
        text: aiReplyText,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);

      // Show map after meaningful conversation (3+ messages)
      if (messages.length >= 2 && !showMap) {
        setTimeout(() => {
          setShowMap(true);
          // Animate chat panel to bottom
          Animated.timing(chatPanelHeight, {
            toValue: height * 0.3, // Shrink to 30% height
            duration: 800,
            useNativeDriver: false,
          }).start();
        }, 1500);
      }

    } catch (error) {
      console.error('Error generating AI response:', error);
      
      // Fallback response if there's any error
      const errorResponse: Message = {
        id: Date.now() + 1,
        text: '🙏 Maaf, saya mengalami gangguan sementara. Namun saya tetap bisa membantu Anda! Coba tanyakan tentang Gedung Sate, Borobudur, Prambanan, atau budaya Indonesia lainnya.',
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
      typingAnim.stopAnimation();
      typingAnim.setValue(0);
    }
  };

  const startTypingAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(typingAnim, { toValue: 1, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(typingAnim, { toValue: 0, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }

  const handleOptionPress = (option: string) => {
    const newMessage: Message = { id: Date.now(), text: option, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, newMessage]);
    
    // Save user message to Firestore
    addDoc(collection(db, 'messages'), {
      text: option,
      sender: 'user',
      timestamp: serverTimestamp(),
      userId: 'current-user'
    }).catch(console.error);
    
    fetchAIResponse(option);
  };

  const formatTime = (date: Date) => date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <Animated.View style={[{ flex: 1 }, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        {/* Map Container - Shows after conversation starts */}
        {showMap && (
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              region={mapRegion}
              provider={PROVIDER_GOOGLE}
              showsUserLocation={true}
              showsMyLocationButton={true}
              onRegionChangeComplete={setMapRegion}
            >
              {userLocation && (
                <Marker
                  coordinate={userLocation}
                  title="Lokasi Anda"
                  description="Posisi saat ini"
                />
              )}
              {/* TODO: Add markers for story places */}
            </MapView>
          </View>
        )}
        
        {/* Chat Panel - Animated height */}
        <Animated.View style={[
          styles.chatPanel,
          { height: showMap ? chatPanelHeight : height }
        ]}>
          <LinearGradient
            colors={['#E8F4F8', '#D4E7DD', '#C8DDD1']}
            style={styles.gradient}
          >
            {/* Header - Show only when map is not visible */}
            {!showMap && (
              <View style={styles.header}>
                <View style={styles.headerContent}>
                  <Image source={require('@/assets/images/nusa-ai-logo.png')} style={styles.logo} />
                  <Image source={require('@/assets/images/nusa-ai-text.png')} style={styles.textHeader} />
                </View>
              </View>
            )}

            {/* Chat drag handle when map is shown */}
            {showMap && (
              <View style={styles.dragHandle}>
                <View style={styles.dragBar} />
                <Text style={styles.chatTitle}>Chat Nusavarta</Text>
              </View>
            )}

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
                      
                      {index === messages.length - 1 && !isTyping && msg.text.includes('?') && (
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
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, },
    gradient: { flex: 1, },
    flex1: { flex: 1, },
    
    // Map styles
    mapContainer: { 
      flex: 1,
      position: 'relative',
    },
    map: { 
      width: '100%', 
      height: '100%',
    },
    
    // Chat panel styles
    chatPanel: {
      backgroundColor: 'white',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 5,
    },
    dragHandle: {
      alignItems: 'center',
      paddingVertical: 12,
      backgroundColor: 'transparent',
    },
    dragBar: {
      width: 40,
      height: 4,
      backgroundColor: '#D0D0D0',
      borderRadius: 2,
      marginBottom: 8,
    },
    chatTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: '#2C3E4B',
    },
    
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