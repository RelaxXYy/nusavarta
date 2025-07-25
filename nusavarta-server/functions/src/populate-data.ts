/**
 * Script untuk menambahkan sample data story_places ke Firestore
 * Jalankan sekali untuk populate database dengan data contoh
 */

import * as admin from "firebase-admin";

// Initialize Firebase Admin (gunakan service account key)
admin.initializeApp();
const db = admin.firestore();

const sampleStoryPlaces = [
  // Landmarks
  {
    title: "Gedung Sate",
    location: "Bandung, Jawa Barat",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
    description: "Gedung Sate adalah ikon Kota Bandung yang dibangun pada masa kolonial Belanda tahun 1920. Dinamakan Gedung Sate karena bentuk menara yang menyerupai tusuk sate. Bangunan ini merupakan kantor Gubernur Jawa Barat dan contoh arsitektur Art Deco yang indah.",
    category: "landmark"
  },
  {
    title: "Monumen Nasional (Monas)",
    location: "Jakarta Pusat, DKI Jakarta",
    image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=400",
    description: "Monumen Nasional adalah ikon Jakarta yang dibangun untuk memperingati perlawanan dan perjuangan rakyat Indonesia. Tingginya 132 meter dengan puncak berupa lidah api berlapis emas.",
    category: "landmark"
  },
  {
    title: "Jembatan Ampera",
    location: "Palembang, Sumatera Selatan",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
    description: "Jembatan Ampera adalah jembatan yang melintasi Sungai Musi di Palembang. Menjadi simbol kota Palembang dan salah satu landmark terkenal di Sumatera Selatan.",
    category: "landmark"
  },

  // Cultures
  {
    title: "Batik Indonesia",
    location: "Jawa (Solo, Yogyakarta, Pekalongan)",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
    description: "Batik adalah seni membuat kain dengan teknik resist wax yang telah diakui UNESCO sebagai Warisan Budaya Tak Benda Dunia. Setiap motif batik memiliki makna filosofis yang mendalam dan berbeda di setiap daerah.",
    category: "culture"
  },
  {
    title: "Wayang Kulit",
    location: "Jawa",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
    description: "Wayang kulit adalah seni pertunjukan tradisional Indonesia menggunakan boneka kulit yang dimainkan oleh dalang. Pertunjukan wayang bisa berlangsung semalam suntuk dengan cerita dari Mahabharata atau Ramayana.",
    category: "culture"
  },
  {
    title: "Tari Kecak",
    location: "Bali",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
    description: "Tari Kecak adalah tarian tradisional Bali yang unik karena tidak menggunakan alat musik, melainkan suara 'cak' dari puluhan penari pria yang duduk melingkar. Menggambarkan kisah Ramayana.",
    category: "culture"
  },

  // Museums
  {
    title: "Museum Nasional Indonesia",
    location: "Jakarta Pusat, DKI Jakarta",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
    description: "Museum Nasional Indonesia atau Museum Gajah adalah museum arkeologi, sejarah, etnografi, dan geografi yang terletak di Jakarta Pusat. Memiliki koleksi artefak Indonesia yang sangat lengkap.",
    category: "museum"
  },
  {
    title: "Museum Geologi",
    location: "Bandung, Jawa Barat",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
    description: "Museum Geologi Bandung adalah museum yang menampilkan koleksi geologi Indonesia, termasuk fosil dinosaurus, batuan, dan mineral. Bangunannya sendiri merupakan cagar budaya peninggalan Belanda.",
    category: "museum"
  },
  {
    title: "Museum Fatahillah",
    location: "Jakarta Barat, DKI Jakarta",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
    description: "Museum Fatahillah atau Museum Sejarah Jakarta terletak di area Kota Tua Jakarta. Bangunan bekas Balai Kota Batavia ini menyimpan berbagai koleksi sejarah Jakarta dari masa ke masa.",
    category: "museum"
  },

  // Temples
  {
    title: "Candi Borobudur",
    location: "Magelang, Jawa Tengah",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
    description: "Candi Buddha terbesar di dunia yang dibangun pada abad ke-8-9. Merupakan warisan dunia UNESCO dengan 2.672 panel relief dan 504 arca Buddha. Setiap tingkat Borobudur melambangkan tahapan pencerahan dalam agama Buddha.",
    category: "temple"
  },
  {
    title: "Candi Prambanan",
    location: "Yogyakarta-Klaten, Jawa Tengah",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
    description: "Kompleks candi Hindu terbesar di Indonesia yang dibangun pada abad ke-9. Terdiri dari 240 candi dengan 3 candi utama untuk Trimurti (Brahma, Wisnu, Siwa). Candi Siwa yang tertinggi mencapai 47 meter.",
    category: "temple"
  },
  {
    title: "Candi Mendut",
    location: "Magelang, Jawa Tengah",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
    description: "Candi Buddha yang dibangun pada masa Dinasti Syailendra. Terkenal dengan patung Buddha Sakyamuni yang sangat indah di dalam bilik utama. Sering dikunjungi dalam rangkaian ziarah ke Borobudur.",
    category: "temple"
  }
];

async function addSampleData() {
  try {
    console.log("Adding sample story places to Firestore...");
    
    const batch = db.batch();
    
    sampleStoryPlaces.forEach((place, index) => {
      const docRef = db.collection("story_places").doc();
      batch.set(docRef, place);
    });
    
    await batch.commit();
    
    console.log(`Successfully added ${sampleStoryPlaces.length} story places to Firestore!`);
    console.log("Categories added:");
    console.log("- Landmarks:", sampleStoryPlaces.filter(p => p.category === "landmark").length);
    console.log("- Cultures:", sampleStoryPlaces.filter(p => p.category === "culture").length);
    console.log("- Museums:", sampleStoryPlaces.filter(p => p.category === "museum").length);
    console.log("- Temples:", sampleStoryPlaces.filter(p => p.category === "temple").length);
    
    process.exit(0);
  } catch (error) {
    console.error("Error adding sample data:", error);
    process.exit(1);
  }
}

// Run the script
addSampleData();
