import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Easing, FlatList, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, Vibration, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebaseConfig';

// Tipe data untuk story place
type StoryPlace = {
    id: string;
    title: string;
    location: string;
    image: string; // Sekarang kita harapkan URL string dari backend/Firestore
    description: string;
    category: string;
};

// Komponen-komponen UI (Modal, ItemCard, Section) tetap sama,
// hanya perlu penyesuaian kecil untuk menerima URL gambar.
const DetailModal = ({ visible, item, onClose }: {
    visible: boolean,
    item: StoryPlace | null,
    onClose: () => void
}) => {
    const [imageError, setImageError] = useState(false);
    
    if (!item) return null;

    console.log('DetailModal rendering for:', item.title, 'with image URL:', item.image);

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <TouchableOpacity
                    style={styles.modalBackdrop}
                    activeOpacity={1}
                    onPress={onClose}
                />
                <View style={styles.modalContainer}>
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Feather name="x" size={24} color="#000" />
                    </TouchableOpacity>

                    <View style={styles.modalImageContainer}>
                        {!imageError && item.image ? (
                            <Image 
                                source={{ uri: item.image }} 
                                style={styles.modalImage}
                                onError={(error) => {
                                    console.log('Modal image failed to load for', item.title, ':', error.nativeEvent?.error || 'Unknown error');
                                    setImageError(true);
                                }}
                                onLoad={() => {
                                    console.log('Modal image loaded successfully for:', item.title);
                                }}
                            />
                        ) : (
                            <Image 
                                source={require('@/assets/images/borobudur-bg.png')} 
                                style={styles.modalImage}
                            />
                        )}
                        <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.6)']}
                            style={styles.modalImageGradient}
                        />
                        <View style={styles.modalTitleContainer}>
                            <Text style={styles.modalTitle}>{item.title}</Text>
                        </View>
                    </View>

                    <View style={styles.modalContent}>
                        <Text style={styles.modalLocation}>{item.location}</Text>
                        <ScrollView style={styles.modalDescriptionContainer} showsVerticalScrollIndicator={false}>
                            <Text style={styles.modalDescription}>{item.description}</Text>
                        </ScrollView>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const ItemCard = ({ item, onPress }: {
    item: StoryPlace,
    onPress: () => void
}) => {
    const [imageError, setImageError] = useState(false);
    
    console.log('ItemCard rendering for:', item.title, 'with image URL:', item.image);
    
    return (
        <TouchableOpacity style={styles.cardContainer} onPress={onPress}>
            {!imageError && item.image ? (
                <Image 
                    source={{ uri: item.image }} 
                    style={styles.cardImage}
                    onError={(error) => {
                        console.log('Image failed to load for', item.title, ':', error.nativeEvent?.error || 'Unknown error');
                        setImageError(true);
                    }}
                    onLoad={() => {
                        console.log('Image loaded successfully for:', item.title);
                    }}
                />
            ) : (
                <Image 
                    source={require('@/assets/images/borobudur-bg.png')} 
                    style={styles.cardImage}
                />
            )}
            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.cardGradient} />
            <Text style={styles.cardTitle}>{item.title}</Text>
        </TouchableOpacity>
    );
};
const Section = ({ title, data, onItemPress }: {
    title: string,
    data: StoryPlace[],
    onItemPress: (item: StoryPlace) => void
}) => {
    if (!data || data.length === 0) {
        return null; // Jangan tampilkan section jika tidak ada data
    }
    return (
        <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <FlatList
                data={data}
                renderItem={({ item }) => <ItemCard item={item} onPress={() => onItemPress(item)} />}
                keyExtractor={item => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16 }}
            />
        </View>
    );
};


export default function HomeScreen() {
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];
    const router = useRouter();

    // State untuk data dinamis dari backend
    const [landmarks, setLandmarks] = useState<StoryPlace[]>([]);
    const [cultures, setCultures] = useState<StoryPlace[]>([]);
    const [museums, setMuseums] = useState<StoryPlace[]>([]);
    const [temples, setTemples] = useState<StoryPlace[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [modalVisible, setModalVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState<StoryPlace | null>(null);

    const [searchText, setSearchText] = useState('');
    
    const contentFadeAnim = useRef(new Animated.Value(0)).current;

    // **FUNGSI BARU**: Mengambil data langsung dari Firestore
    useEffect(() => {
        const fetchStoryPlaces = async () => {
            try {
                console.log('Fetching story places from Firestore...');
                
                // Fetch all story places from Firestore
                const querySnapshot = await getDocs(collection(db, 'story_places'));
                const allPlaces: StoryPlace[] = [];
                
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    const place = {
                        id: doc.id,
                        title: data.title || '',
                        location: data.location || '',
                        image: data.image || '',
                        description: data.description || '',
                        category: data.category || 'landmark'
                    };
                    console.log('Loaded place from Firestore:', place.title, 'Image URL:', place.image);
                    allPlaces.push(place);
                });
                
                console.log('Total places loaded from Firestore:', allPlaces.length);
                
                if (allPlaces.length > 0) {
                    // Group by category
                    const landmarks = allPlaces.filter(place => place.category === 'landmark');
                    const cultures = allPlaces.filter(place => place.category === 'culture');
                    const museums = allPlaces.filter(place => place.category === 'museum');
                    const temples = allPlaces.filter(place => place.category === 'temple');
                    
                    setLandmarks(landmarks);
                    setCultures(cultures);
                    setMuseums(museums);
                    setTemples(temples);
                    
                    console.log('Data loaded from Firestore:', {
                        landmarks: landmarks.length,
                        cultures: cultures.length,
                        museums: museums.length,
                        temples: temples.length,
                        total: allPlaces.length
                    });
                } else {
                    throw new Error('No data found in Firestore');
                }
                
            } catch (error) {
                console.error("Error fetching story places from Firestore:", error);
                
                // Fallback data untuk development/testing
                const fallbackData = {
                    landmarks: [
                        {
                            id: "1",
                            title: "Gedung Sate",
                            location: "Bandung, Jawa Barat",
                            image: "https://picsum.photos/400/300?random=1",
                            description: "Gedung Sate adalah ikon Kota Bandung yang dibangun pada masa kolonial Belanda tahun 1920. Dinamakan Gedung Sate karena bentuk menara yang menyerupai tusuk sate.",
                            category: "landmark" as const
                        }
                    ],
                    cultures: [
                        {
                            id: "2",
                            title: "Batik Indonesia",
                            location: "Jawa (Solo, Yogyakarta, Pekalongan)",
                            image: "https://picsum.photos/400/300?random=2",
                            description: "Batik adalah seni membuat kain dengan teknik resist wax yang telah diakui UNESCO sebagai Warisan Budaya Tak Benda Dunia.",
                            category: "culture" as const
                        }
                    ],
                    museums: [
                        {
                            id: "3",
                            title: "Museum Nasional Indonesia",
                            location: "Jakarta Pusat, DKI Jakarta",
                            image: "https://picsum.photos/400/300?random=3",
                            description: "Museum Nasional Indonesia adalah museum arkeologi, sejarah, etnografi, dan geografi yang terletak di Jakarta Pusat.",
                            category: "museum" as const
                        }
                    ],
                    temples: [
                        {
                            id: "4",
                            title: "Candi Borobudur",
                            location: "Magelang, Jawa Tengah",
                            image: "https://picsum.photos/400/300?random=4",
                            description: "Candi Buddha terbesar di dunia yang dibangun pada abad ke-8-9. Merupakan warisan dunia UNESCO.",
                            category: "temple" as const
                        }
                    ]
                };
                
                console.log("Using fallback data for development");
                setLandmarks(fallbackData.landmarks);
                setCultures(fallbackData.cultures);
                setMuseums(fallbackData.museums);
                setTemples(fallbackData.temples);
                
                console.log('Fallback data set:', {
                    landmarks: fallbackData.landmarks.length,
                    cultures: fallbackData.cultures.length,
                    museums: fallbackData.museums.length,
                    temples: fallbackData.temples.length
                });
            } finally {
                setIsLoading(false);
                // Animasikan konten masuk setelah loading selesai
                Animated.timing(contentFadeAnim, {
                    toValue: 1,
                    duration: 800,
                    easing: Easing.out(Easing.quad),
                    useNativeDriver: true,
                }).start();
            }
        };

        fetchStoryPlaces();
    }, [contentFadeAnim]);

    const handleSearchSubmit = () => {
        if (searchText.trim()) {
            Vibration.vibrate(50);
            router.push({
                pathname: '/(tabs)/chat',
                params: { message: searchText.trim() }
            });
            setSearchText('');
        }
    };

    const handleItemPress = (item: StoryPlace) => {
        setSelectedItem(item);
        setModalVisible(true);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
        setSelectedItem(null);
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: themeColors.background }]} edges={['top', 'right', 'left']}>
            <ScrollView
                style={styles.flexOne}
                showsVerticalScrollIndicator={false}
                contentInsetAdjustmentBehavior="never"
            >
                {/* Header (tetap sama) */}
                <View style={styles.headerContainer}>
                    <Image
                        source={require('@/assets/images/borobudur-bg.png')}
                        style={styles.headerImage}
                    />
                    <View style={styles.headerContent}>
                        <TouchableOpacity style={styles.locationButton}>
                            <BlurView
                                intensity={25}
                                tint="light"
                                style={StyleSheet.absoluteFill}
                            />
                            <Feather name="map-pin" size={16} color="white" />
                            <Text style={styles.locationText}>Bandung</Text>
                        </TouchableOpacity>
                        <Text style={styles.greetingText}>Hai, Pengguna!</Text>
                        <Text style={styles.subGreetingText}>Where are you going today?</Text>
                    </View>
                </View>

                {/* Content */}
                <View style={[styles.contentContainer, { backgroundColor: themeColors.background }]}>
                    <View style={styles.searchBoxContainer}>
                        <Feather name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
                        <TextInput
                            placeholder="Ask nusaAI ..."
                            placeholderTextColor="#8E8E93"
                            style={styles.searchInput}
                            value={searchText}
                            onChangeText={setSearchText}
                            onSubmitEditing={handleSearchSubmit}
                            returnKeyType="search"
                        />
                    </View>

                    {isLoading ? (
                        <ActivityIndicator size="large" color={themeColors.tint} style={{ marginTop: 50 }} />
                    ) : (
                        <Animated.View
                            style={[
                                { opacity: contentFadeAnim },
                                {
                                    transform: [{
                                        translateY: contentFadeAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [30, 0],
                                        })
                                    }]
                                }
                            ]}
                        >
                            {/* Menggunakan state dinamis */}
                            <Section title="Surrounding Landmarks" data={landmarks} onItemPress={handleItemPress} />
                            <Section title="Surrounding Cultures" data={cultures} onItemPress={handleItemPress} />
                            <Section title="Surrounding Museums" data={museums} onItemPress={handleItemPress} />
                            <Section title="Sacred Temples" data={temples} onItemPress={handleItemPress} />
                        </Animated.View>
                    )}
                </View>
            </ScrollView>

            <DetailModal
                visible={modalVisible}
                item={selectedItem}
                onClose={handleCloseModal}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, },
    flexOne: { flex: 1, },
    headerContainer: { height: 300, width: '100%', },
    headerImage: { width: '100%', height: '100%', position: 'absolute', },
    headerContent: { flex: 1, paddingHorizontal: 20, paddingTop: 60, },
    locationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        alignSelf: 'flex-start',
        overflow: 'hidden',
    },
    locationText: { color: 'white', marginLeft: 8, fontWeight: '600', },
    greetingText: { fontSize: 28, fontWeight: 'bold', color: 'white', marginTop: 85, },
    subGreetingText: { fontSize: 24, color: 'white', },
    contentContainer: { borderTopLeftRadius: 20, borderTopRightRadius: 20, marginTop: -20, paddingTop: 20, paddingBottom: 100, },
    searchBoxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 30,
        marginHorizontal: 16,
        paddingHorizontal: 15,
        height: 50,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        transform: [{ translateY: -45 }],
        marginBottom: -25,
        borderWidth: 1.5,
        borderColor: 'transparent',
    },
    searchIcon: { marginRight: 10, },
    searchInput: { flex: 1, fontSize: 16, color: '#000', },
    sectionContainer: { marginTop: 20, },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 12, paddingHorizontal: 16, },
    cardContainer: { width: 150, height: 200, borderRadius: 16, marginRight: 12, overflow: 'hidden', },
    cardImage: { width: '100%', height: '100%', },
    cardGradient: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '50%', },
    cardTitle: { position: 'absolute', bottom: 12, left: 12, right: 12, color: 'white', fontSize: 16, fontWeight: 'bold', },
    
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBackdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    modalContainer: {
        width: 320,
        backgroundColor: 'white',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 100,
        elevation: 10,
        maxHeight: '80%',
    },
    closeButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    modalImageContainer: {
        width: '100%',
        height: 208,
        position: 'relative',
        overflow: 'hidden',
    },
    modalImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    modalImageGradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: '30%',
    },
    modalTitleContainer: {
        position: 'absolute',
        bottom: 12,
        left: 16,
    },
    modalTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
    modalContent: {
        padding: 16,
    },
    modalLocation: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    modalDescriptionContainer: {
        maxHeight: 200, 
    },
    modalDescription: {
        fontSize: 14,
        color: '#555',
        lineHeight: 20,
    },
});