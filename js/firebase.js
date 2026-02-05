import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔥 TU CONFIG REAL
const firebaseConfig = {
  apiKey: "AIzaSyDerAViXEfvWCFuzDoL-wrhTMxvI-Lu0s0",
  authDomain: "admin-perfumes.firebaseapp.com",
  projectId: "admin-perfumes",
  storageBucket: "admin-perfumes.appspot.com",
  messagingSenderId: "690143324027",
  appId: "1:690143324027:web:f4df0b6bf8350ea4087fde"
};

// Init
const app = initializeApp(firebaseConfig);

// DB
const db = getFirestore(app);

// Export
export { db };
