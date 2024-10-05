if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        console.log('Service Worker registrado com sucesso:', registration);
      })
      .catch((error) => {
        console.log('Falha ao registrar o Service Worker:', error);
      });
  });
}

// Verificação de suporte ao localStorage
function isLocalStorageSupported() {
  try {
    const testKey = 'test';
    localStorage.setItem(testKey, '1');
    localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
}

// Função para exibir uma mensagem de feedback
function showFeedbackMessage() {
  const message = document.createElement('div');
  message.id = 'feedbackMessage';
  message.textContent = 'Dados salvos!';
  document.body.appendChild(message);
  setTimeout(() => {
    message.remove();
  }, 2000); // Remove a mensagem após 2 segundos
}

// Função para salvar valores no localStorage
function saveValues() {
  const inputs = document.querySelectorAll('input');
  inputs.forEach((input) => {
    localStorage.setItem(input.id, input.value);
  });
  showFeedbackMessage(); // Exibe a mensagem após salvar os dados
}

// Função para carregar valores do localStorage
function loadValues() {
  const inputs = document.querySelectorAll('input');
  inputs.forEach((input) => {
    if (localStorage.getItem(input.id)) {
      input.value = localStorage.getItem(input.id);
    }
  });
}

// Função para validar se um valor é numérico válido
function isValidNumber(value) {
  return !isNaN(value) && value.trim() !== '';
}

// Função para calcular os totais de rendimentos, despesas e saldo
function calculateTotals() {
  // Obter todos os elementos de rendimento e despesas
  const incomeElements = document.querySelectorAll('.income');
  const expenseElements = document.querySelectorAll('.expense');

  let totalIncome = 0;
  let totalExpenses = 0;

  // Calcular o total de rendimentos
  incomeElements.forEach((input) => {
    const value = parseFloat(input.value) || 0;
    if (isValidNumber(input.value)) {
      totalIncome += value;
    }
  });

  // Calcular o total de despesas
  expenseElements.forEach((input) => {
    const value = parseFloat(input.value) || 0;
    if (isValidNumber(input.value)) {
      totalExpenses += value;
    }
  });

  // Calcular o saldo
  const balance = totalIncome - totalExpenses;

  // Atualizar a interface com os totais
  document.getElementById('totalIncome').textContent = totalIncome.toFixed(2);
  document.getElementById('totalExpenses').textContent =
    totalExpenses.toFixed(2);
  document.getElementById('balance').textContent = balance.toFixed(2);

  // Salvar os valores no localStorage
  saveValues();
}

// Função para aplicar debounce ao salvar valores
let timeout;
function debounceSaveValues() {
  clearTimeout(timeout);
  timeout = setTimeout(saveValues, 300); // Aguarda 300ms após a última entrada
}

// Adiciona o evento de input para aplicar debounce no salvamento dos valores
function addInputListeners() {
  const inputs = document.querySelectorAll('input');
  inputs.forEach((input) => {
    input.addEventListener('input', debounceSaveValues);
  });
}

// Executa ao carregar a página
window.onload = function () {
  if (isLocalStorageSupported()) {
    loadValues(); // Carrega os valores salvos
    calculateTotals(); // Calcula os totais ao carregar a página
    addInputListeners(); // Adiciona eventos de input para salvar dados automaticamente
  } else {
    console.warn('LocalStorage não é suportado neste navegador.');
  }
};
