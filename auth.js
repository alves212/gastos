// auth.js
import { auth } from './firebase.js'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js'

const loginForm = document.getElementById('login-form')
const emailInput = document.getElementById('email')
const passwordInput = document.getElementById('password')
const appContent = document.querySelector('.container')
const loginButton = loginForm.querySelector('button')

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  const email = emailInput.value
  const password = passwordInput.value

  loginButton.disabled = true
  loginButton.textContent = 'Entrando...'

  try {
    // Tenta login
    await signInWithEmailAndPassword(auth, email, password)
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      // Se usuário não existe, cria conta
      try {
        await createUserWithEmailAndPassword(auth, email, password)
      } catch (err) {
        alert('Erro ao criar conta: ' + err.message)
      }
    } else if (error.code === 'auth/wrong-password') {
      alert('Senha incorreta.')
    } else {
      alert('Erro de login: ' + error.message)
    }
  } finally {
    loginButton.disabled = false
    loginButton.textContent = 'Entrar'
  }
})

// Aguarda autenticação para mostrar o app
onAuthStateChanged(auth, (user) => {
  if (user) {
    loginForm.style.display = 'none'
    appContent.style.display = 'block'

    // Carrega o script principal do app (depois do login)
    import('./script.js')
  } else {
    loginForm.style.display = 'block'
    appContent.style.display = 'none'
  }
})
