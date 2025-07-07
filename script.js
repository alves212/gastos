const STORAGE_KEY = 'financeData'

// Carrega os dados do localStorage ao iniciar
function loadData() {
  const savedData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []

  savedData.forEach(({ checked, sign, description, amount }) => {
    createRow(sign, description, amount, checked)
  })

  setTimeout(() => {
    calculateTotals()
  }, 50)
}

// Salva os dados no localStorage
function saveData() {
  const rows = Array.from(document.querySelectorAll('#financeTable tbody tr'))

  const data = rows.map((row) => {
    const checked = row.querySelector('input[type="checkbox"]').checked
    const sign = row.cells[1].textContent
    const description = row.querySelector('input[type="text"]').value
    const amount =
      parseFloat(row.querySelector('input[type="number"]').value) || 0
    return { checked, sign, description, amount }
  })

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

// Calcula os totais de ganhos, despesas e saldo
function calculateTotals() {
  let totalIncome = 0
  let totalExpenses = 0

  document.querySelectorAll('#financeTable tbody tr').forEach((row) => {
    const sign = row.cells[1].textContent
    const value =
      parseFloat(row.querySelector('input[type="number"]').value) || 0

    if (sign === '+') {
      totalIncome += value
    } else {
      totalExpenses += value
    }
  })

  document.getElementById('totalIncome').textContent = totalIncome.toFixed(2)
  document.getElementById('totalExpenses').textContent =
    totalExpenses.toFixed(2)
  document.getElementById('balance').textContent = (
    totalIncome - totalExpenses
  ).toFixed(2)
}

// Adiciona uma nova linha na tabela
function addRow(sign) {
  createRow(sign)
  saveData()
}

// Cria uma nova linha com dados opcionais
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

  // Define foco automático no campo de descrição
  descriptionInput.focus()

  // Recalcula os totais ao alterar valores
  amountInput.addEventListener('input', () => {
    calculateTotals()
    saveData()
  })

  checkbox.addEventListener('change', () => {
    saveData()
  })

  tbody.appendChild(newRow)
}

// Alterna entre modo de edição e visualização
function editRow(button) {
  const row = button.parentElement.parentElement
  const inputs = row.querySelectorAll('input')

  inputs.forEach((input) => (input.disabled = !input.disabled))
  button.textContent = button.textContent === 'Editar' ? 'Salvar' : 'Editar'
  saveData()
}

// Remove uma linha e recalcula os totais
function removeRow(button) {
  button.parentElement.parentElement.remove()
  calculateTotals()
  saveData()
}

// Carrega os dados ao iniciar
loadData()

// Register the Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js').catch((error) => {
      console.log('Service Worker registration failed:', error)
    })
  })
}
