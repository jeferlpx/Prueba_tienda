const firebaseConfig = {
    apiKey: "AIzaSyCTRQ-NQqMbk5BgTgQ5luXOpe-VBhG4-6w",
    authDomain: "test-shop-785c8.firebaseapp.com",
    projectId: "test-shop-785c8",
    storageBucket: "test-shop-785c8.firebasestorage.app",
    messagingSenderId: "554647185649",
    appId: "1:554647185649:web:acd30c074b16693803a150",
    measurementId: "G-KFX86MHDVJ"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Referencias a los servicios
const auth = firebase.auth();
const db = firebase.firestore();

console.log("🔥 Firebase inicializado correctamente en el cliente.");
