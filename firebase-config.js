// ==================== CONFIGURAÇÃO FIREBASE ====================
// Chaves já preenchidas - Não precisa editar!

const firebaseConfig = {
  apiKey: "AIzaSyCB9phDTq1neGHW60aSh-wESxNZCVEoLmI",
  authDomain: "simplesfinanceiro-7af2a.firebaseapp.com",
  projectId: "simplesfinanceiro-7af2a",
  storageBucket: "simplesfinanceiro-7af2a.firebasestorage.app",
  messagingSenderId: "786190270495",
  appId: "1:786190270495:web:a9876e2a479d137cd6152a",
  measurementId: "G-BJR3Y4D256"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Referências do Firebase
const auth = firebase.auth();
const db = firebase.firestore();

console.log('✅ Firebase inicializado com sucesso!');
