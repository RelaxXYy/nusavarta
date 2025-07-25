// Quick script to add sample story places to Firestore
// Run: node add-sample-data.js

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyD4aIWP95PJDbAzWP6hnEH5_RjPQ_PRFLU",
  authDomain: "garudahacks-6.firebaseapp.com",
  projectId: "garudahacks-6",
  storageBucket: "garudahacks-6.firebasestorage.app",
  messagingSenderId: "736001500093",
  appId: "1:736001500093:web:5a47b9fdb4de39d3823b94",
  measurementId: "G-S8EY4SXCDJ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const sampleData = [
  {
    title: "Gedung Sate",
    location: "Bandung, Jawa Barat",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
    description: "Gedung Sate adalah ikon Kota Bandung yang dibangun pada masa kolonial Belanda tahun 1920. Dinamakan Gedung Sate karena bentuk menara yang menyerupai tusuk sate.",
    category: "landmark"
  },
  {
    title: "Candi Borobudur",
    location: "Magelang, Jawa Tengah",
    image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=400",
    description: "Candi Buddha terbesar di dunia yang dibangun pada abad ke-8-9. Merupakan warisan dunia UNESCO dengan 2.672 panel relief dan 504 arca Buddha.",
    category: "temple"
  },
  {
    title: "Batik Indonesia",
    location: "Jawa (Solo, Yogyakarta, Pekalongan)",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
    description: "Batik adalah seni membuat kain dengan teknik resist wax yang telah diakui UNESCO sebagai Warisan Budaya Tak Benda Dunia.",
    category: "culture"
  },
  {
    title: "Museum Nasional Indonesia",
    location: "Jakarta Pusat, DKI Jakarta",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
    description: "Museum Nasional Indonesia adalah museum arkeologi, sejarah, etnografi, dan geografi yang terletak di Jakarta Pusat.",
    category: "museum"
  },
  {
    title: "Candi Prambanan", 
    location: "Yogyakarta-Klaten, Jawa Tengah",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
    description: "Kompleks candi Hindu terbesar di Indonesia yang dibangun pada abad ke-9. Terdiri dari 240 candi dengan 3 candi utama untuk Trimurti.",
    category: "temple"
  },
  {
    title: "Wayang Kulit",
    location: "Jawa",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
    description: "Wayang kulit adalah seni pertunjukan tradisional Indonesia menggunakan boneka kulit yang dimainkan oleh dalang.",
    category: "culture"
  }
];

async function addSampleData() {
  try {
    console.log('Adding sample data to Firestore...');
    
    for (const place of sampleData) {
      await addDoc(collection(db, 'story_places'), place);
      console.log(`Added: ${place.title}`);
    }
    
    console.log(`Successfully added ${sampleData.length} story places!`);
    console.log('Categories:');
    console.log('- Landmarks:', sampleData.filter(p => p.category === 'landmark').length);
    console.log('- Cultures:', sampleData.filter(p => p.category === 'culture').length);
    console.log('- Museums:', sampleData.filter(p => p.category === 'museum').length);
    console.log('- Temples:', sampleData.filter(p => p.category === 'temple').length);
    
  } catch (error) {
    console.error('Error adding sample data:', error);
  }
}

addSampleData();
