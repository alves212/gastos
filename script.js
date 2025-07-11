import { db, auth } from './firebase.js'
import {
  doc,
  getDoc,
  setDoc,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js'

let sortMode = 'original'
let filterState = 0 // 0: todos, 1: apenas marcados, 2: apenas desmarcados

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
    .filter((item) => item.description !== '' || item.amount !== 0)

  const userDoc = doc(db, 'financeData', user.uid)
  await setDoc(userDoc, { items: data })
}

function highlightUpdate(element) {
  element.style.transition = 'background-color 0.3s ease'
  element.style.backgroundColor = '#444'
  setTimeout(() => {
    element.style.backgroundColor = 'transparent'
  }, 300)
}

function calculateTotals() {
  let totalIncome = 0
  let totalExpenses = 0

  const incomeEl = document.getElementById('totalIncome')
  const expenseEl = document.getElementById('totalExpenses')
  const balanceEl = document.getElementById('balance')

  document.querySelectorAll('#financeTable tbody tr').forEach((row) => {
    const sign = row.cells[1].textContent
    const value =
      parseFloat(row.querySelector('input[type="number"]').value) || 0
    if (sign === '+') totalIncome += value
    else totalExpenses += value
  })

  incomeEl.textContent = totalIncome.toFixed(2)
  expenseEl.textContent = totalExpenses.toFixed(2)
  balanceEl.textContent = (totalIncome - totalExpenses).toFixed(2)

  highlightUpdate(incomeEl)
  highlightUpdate(expenseEl)
  highlightUpdate(balanceEl)
}

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
  newRow.classList.add(sign === '+' ? 'gain-row' : 'expense-row')
}

window.removeRow = function (button) {
  button.parentElement.parentElement.remove()
  calculateTotals()
  saveData()
}

window.addRow = function (sign) {
  createRow(sign)
  saveData()
}

window.showChart = function () {
  alert('Função de gráfico em breve!')
}

window.handleSortToggle = function () {
  const button = document.getElementById('sort-button')

  if (sortMode === 'original') {
    sortMode = 'asc'
    sortAndRenderRows('asc')
    button.textContent = '⬆️'
  } else if (sortMode === 'asc') {
    sortMode = 'desc'
    sortAndRenderRows('desc')
    button.textContent = '⬇️'
  } else {
    sortMode = 'original'
    restoreOriginalOrder()
    button.textContent = '🔄'
  }
}

function sortAndRenderRows(mode) {
  const tbody = document.querySelector('#financeTable tbody')
  const rows = Array.from(tbody.querySelectorAll('tr'))
  const sortedRows = [...rows]

  if (mode === 'asc') {
    sortedRows.sort((a, b) => {
      const aVal =
        parseFloat(a.querySelector('input[type="number"]').value) || 0
      const bVal =
        parseFloat(b.querySelector('input[type="number"]').value) || 0
      return aVal - bVal
    })
  } else if (mode === 'desc') {
    sortedRows.sort((a, b) => {
      const aVal =
        parseFloat(a.querySelector('input[type="number"]').value) || 0
      const bVal =
        parseFloat(b.querySelector('input[type="number"]').value) || 0
      return bVal - aVal
    })
  }

  tbody.innerHTML = ''
  sortedRows.forEach((row) => tbody.appendChild(row))
}

function restoreOriginalOrder() {
  location.reload()
}

window.filterUnchecked = function () {
  const rows = document.querySelectorAll('#financeTable tbody tr')
  const button = document.getElementById('filterButton')

  if (filterState === 0) {
    rows.forEach((row) => {
      const checkbox = row.querySelector('input[type="checkbox"]')
      row.style.display = checkbox.checked ? '' : 'none'
    })
    button.textContent = '🟦'
    filterState = 1
  } else if (filterState === 1) {
    rows.forEach((row) => {
      const checkbox = row.querySelector('input[type="checkbox"]')
      row.style.display = !checkbox.checked ? '' : 'none'
    })
    button.textContent = '⬜'
    filterState = 2
  } else {
    rows.forEach((row) => (row.style.display = ''))
    button.textContent = '📋'
    filterState = 0
  }
}

window.exportData = function () {
  alert('Exportação em desenvolvimento.')
}

loadData()
