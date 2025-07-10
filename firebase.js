import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js'
import {
  getFirestore,
  enableIndexedDbPersistence,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js'
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js'

const firebaseConfig = {
  apiKey: 'AIzaSyAaHfiw710-Ch3OVQ8XOl2plypYdSF02Kc',
  authDomain: 'controle-financeiro212390.firebaseapp.com',
  projectId: 'controle-financeiro212390',
  storageBucket: 'controle-financeiro212390.firebasestorage.app',
  messagingSenderId: '173484115061',
  appId: '1:173484115061:web:0888e0865b2ca8b67ca43c',
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)

// Habilita cache offline
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Offline persistence falhou: múltiplas abas abertas.')
  } else if (err.code === 'unimplemented') {
    console.warn('Offline persistence não suportado neste navegador.')
  } else {
    console.warn('Erro ao ativar persistência offline:', err)
  }
})

export { db, auth }
