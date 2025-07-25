export interface CulturalInfo {
    id: string;
    name: string;
    type: 'Landmark' | 'Museum' | 'Kuliner';
    description: string;
    location: string;
    coordinates: {
        latitude: number;
        longitude: number;
    };
}

// Fokus pada data di Bandung sesuai permintaan Anda
export const database: CulturalInfo[] = [
    {
        id: 'gs',
        name: 'Gedung Sate',
        type: 'Landmark',
        description: 'Gedung Sate adalah ikon kota Bandung dengan ciri khas ornamen tusuk sate di menara utamanya, memadukan gaya arsitektur neoklasik dan elemen tradisional.',
        location: 'Bandung',
        coordinates: { latitude: -6.9022, longitude: 107.6186 }
    },
    {
        id: 'museum_geologi',
        name: 'Museum Geologi Bandung',
        type: 'Museum',
        description: 'Menyimpan koleksi materi geologi yang melimpah seperti fosil, batuan, dan mineral. Salah satu koleksi terkenalnya adalah replika fosil Tyrannosaurus Rex.',
        location: 'Bandung',
        coordinates: { latitude: -6.9000, longitude: 107.6215 }
    },
    {
        id: 'braga',
        name: 'Jalan Braga',
        type: 'Landmark',
        description: 'Sebuah jalan bersejarah di pusat kota Bandung yang terkenal dengan bangunan-bangunan art deco peninggalan Belanda yang fotogenik.',
        location: 'Bandung',
        coordinates: { latitude: -6.9173, longitude: 107.6098 }
    },
    {
        id: 'saungudjo',
        name: 'Saung Angklung Udjo',
        type: 'Landmark',
        description: 'Pusat pelestarian dan pertunjukan seni angklung di Bandung. Pengunjung bisa menikmati pertunjukan dan belajar memainkannya.',
        location: 'Bandung',
        coordinates: { latitude: -6.8917, longitude: 107.6534 }
    }
];