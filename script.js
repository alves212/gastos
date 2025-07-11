import { db, auth } from './firebase.js'
import {
  doc,
  getDoc,
  setDoc,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js'

let sortMode = 'original'
let filterState = 0 // 0: todos, 1: apenas marcados, 2: apenas desmarcados
let originalData = []

async function loadData() {
  const user = auth.currentUser
  if (!user) return

  const userDoc = doc(db, 'financeData', user.uid)
  const snapshot = await getDoc(userDoc)
  const savedData = snapshot.exists() ? snapshot.data().items : []
  originalData = [...savedData] // guarda ordem original

  savedData.forEach(({ checked, sign, description, amount }) => {
    createRow(sign, description, amount, checked)
  })

  setTimeout(() => calculateTotals(), 50)
}

async function saveData() {
  const user = auth.currentUser
  if (!user) return

  const rows = getAllRows()
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

function getAllRows() {
  return Array.from(document.querySelectorAll('#financeTable tbody tr'))
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

  getAllRows().forEach((row) => {
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

  tbody.appendChild(newRow)
  newRow.classList.add(sign === '+' ? 'gain-row' : 'expense-row')

  const checkbox = newRow.querySelector('input[type="checkbox"]')
  const amountInput = newRow.querySelector('input[type="number"]')
  const descriptionInput = newRow.querySelector('input[type="text"]')
  const signCell = newRow.cells[1]

  descriptionInput.focus()

  amountInput.addEventListener('input', () => {
    calculateTotals()
    saveData()
  })

  checkbox.addEventListener('change', () => {
    saveData()
  })

  if (signCell) {
    signCell.style.cursor = 'pointer'
    signCell.addEventListener('click', () => {
      const isSelected = newRow.classList.contains('selected')
      getAllRows().forEach((tr) => tr.classList.remove('selected'))
      if (!isSelected) newRow.classList.add('selected')
    })
  }
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

window.moveRowUp = function () {
  const row = document.querySelector('#financeTable tbody tr.selected')
  if (row && row.previousElementSibling) {
    row.parentNode.insertBefore(row, row.previousElementSibling)
    saveData()
  }
}

window.moveRowDown = function () {
  const row = document.querySelector('#financeTable tbody tr.selected')
  const next = row?.nextElementSibling
  if (row && next) {
    row.parentNode.insertBefore(next, row)
    saveData()
  }
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
  const sortedRows = [...getAllRows()]

  sortedRows.sort((a, b) => {
    const aVal = parseFloat(a.querySelector('input[type="number"]').value) || 0
    const bVal = parseFloat(b.querySelector('input[type="number"]').value) || 0
    return mode === 'asc' ? aVal - bVal : bVal - aVal
  })

  tbody.innerHTML = ''
  sortedRows.forEach((row) => tbody.appendChild(row))
}

function restoreOriginalOrder() {
  const tbody = document.querySelector('#financeTable tbody')
  tbody.innerHTML = ''
  originalData.forEach(({ checked, sign, description, amount }) => {
    createRow(sign, description, amount, checked)
  })
  calculateTotals()
  saveData()
}

window.filterUnchecked = function () {
  const rows = getAllRows()
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

loadData()
