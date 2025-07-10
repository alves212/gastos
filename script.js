import { db, auth } from './firebase.js'
import {
  doc,
  getDoc,
  setDoc,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js'

// Carrega os dados do Firestore
async function loadData() {
  const user = auth.currentUser
  if (!user) return

  const userDoc = doc(db, 'financeData', user.uid)
  const snapshot = await getDoc(userDoc)
  const savedData = snapshot.exists() ? snapshot.data().items : []

  savedData.forEach(({ checked, sign, description, amount }) => {
    createRow(sign, description, amount, checked)
  })

  setTimeout(() => calculateTotals(), 50)
}

// Salva os dados no Firestore
async function saveData() {
  const user = auth.currentUser
  if (!user) return

  const rows = Array.from(document.querySelectorAll('#financeTable tbody tr'))
  const data = rows
    .map((row) => ({
      checked: row.querySelector('input[type="checkbox"]').checked,
      sign: row.cells[1].textContent,
      description: row.querySelector('input[type="text"]').value.trim(),
      amount: parseFloat(row.querySelector('input[type="number"]').value) || 0,
    }))
    .filter((item) => item.description !== '' || item.amount !== 0) // evita salvar linhas vazias

  const userDoc = doc(db, 'financeData', user.uid)
  await setDoc(userDoc, { items: data })
}

// Calcula os totais
function calculateTotals() {
  let totalIncome = 0
  let totalExpenses = 0

  document.querySelectorAll('#financeTable tbody tr').forEach((row) => {
    const sign = row.cells[1].textContent
    const value =
      parseFloat(row.querySelector('input[type="number"]').value) || 0
    if (sign === '+') totalIncome += value
    else totalExpenses += value
  })

  document.getElementById('totalIncome').textContent = totalIncome.toFixed(2)
  document.getElementById('totalExpenses').textContent =
    totalExpenses.toFixed(2)
  document.getElementById('balance').textContent = (
    totalIncome - totalExpenses
  ).toFixed(2)
}

// Cria linha na tabela
function createRow(sign, description = '', amount = 0, checked = false) {
  const tbody = document.querySelector('#financeTable tbody')
  const newRow = document.createElement('tr')

  newRow.innerHTML = `
    <td><input type="checkbox" ${checked ? 'checked' : ''} /></td>
    <td>${sign}</td>
    <td><input type="text" value="${description}" placeholder="Descrição" /></td>
    <td><input type="number" value="${amount}" /></td>
    <td>
      <button class="full-button" onclick="removeRow(this)">X</button>
    </td>
  `

  const checkbox = newRow.querySelector('input[type="checkbox"]')
  const amountInput = newRow.querySelector('input[type="number"]')
  const descriptionInput = newRow.querySelector('input[type="text"]')

  descriptionInput.focus()

  amountInput.addEventListener('input', () => {
    calculateTotals()
    saveData()
  })

  checkbox.addEventListener('change', () => {
    saveData()
  })

  tbody.appendChild(newRow)
}

// Remove linha
window.removeRow = function (button) {
  button.parentElement.parentElement.remove()
  calculateTotals()
  saveData()
}

// Adiciona linha
window.addRow = function (sign) {
  createRow(sign)
  saveData()
}

// Inicializa após login (chamada em auth.js)
loadData()
