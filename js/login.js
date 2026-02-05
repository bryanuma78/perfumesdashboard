import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDerAViXEfvWCFuzDoL-wrhTMxvI-Lu0s0",
  authDomain: "admin-perfumes.firebaseapp.com",
  projectId: "admin-perfumes",
  storageBucket: "admin-perfumes.appspot.com",
  messagingSenderId: "690143324027",
  appId: "1:690143324027:web:f4df0b6bf8350ea4087fde"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Si ya está logueado
onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = "index.html";
  }
});

window.login = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const msg = document.getElementById("msg");

  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "index.html";
  } catch (error) {
    msg.textContent = "Credenciales incorrectas";
  }
};
