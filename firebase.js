import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js'
import {
  getFirestore,
  enableIndexedDbPersistence,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js'
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js'

// Configuração do Firebase
const firebaseConfig = {
  apiKey: 'AIzaSyAaHfiw710-Ch3OVQ8XOl2plypYdSF02Kc',
  authDomain: 'controle-financeiro212390.firebaseapp.com',
  projectId: 'controle-financeiro212390',
  storageBucket: 'controle-financeiro212390.appspot.com',
  messagingSenderId: '173484115061',
  appId: '1:173484115061:web:0888e0865b2ca8b67ca43c',
}

// Inicialização
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)

// Habilita cache offline do Firestore
enableIndexedDbPersistence(db).catch((err) => {
  switch (err.code) {
    case 'failed-precondition':
      console.warn('Persistência offline falhou: múltiplas abas abertas.')
      break
    case 'unimplemented':
      console.warn('Persistência offline não suportada neste navegador.')
      break
    default:
      console.error('Erro ao ativar persistência offline:', err)
  }
})

export { db, auth }
