// State management
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let pieChart = null;
let barChart = null;

// DOM Elements
const expenseForm = document.getElementById('expenseForm');
const expenseItems = document.getElementById('expenseItems');
const totalSpentEl = document.getElementById('totalSpent');
const totalCategoriesEl = document.getElementById('totalCategories');
const totalTransactionsEl = document.getElementById('totalTransactions');

// Colors for charts
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

// Initialize the application
function init() {
  renderExpenses();
  updateStats();
  initializeCharts();
}

// Add new expense
expenseForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const expense = {
    id: crypto.randomUUID(),
    description: e.target.description.value,
    amount: parseFloat(e.target.amount.value),
    category: e.target.category.value,
    date: new Date().toISOString()
  };

  expenses = [expense, ...expenses];
  localStorage.setItem('expenses', JSON.stringify(expenses));
  
  e.target.reset();
  renderExpenses();
  updateStats();
  updateCharts();
});

// Render expense list
function renderExpenses() {
  expenseItems.innerHTML = expenses.length ? expenses.map(expense => `
    <div class="expense-item">
      <div class="expense-details">
        <span class="expense-description">${expense.description}</span>
        <span class="expense-category">${expense.category}</span>
        <span class="expense-date">${new Date(expense.date).toLocaleDateString()}</span>
      </div>
      <div class="expense-amount-section">
        <span class="expense-amount">₹${expense.amount.toFixed(2)}</span>
        <button class="delete-btn" onclick="deleteExpense('${expense.id}')">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
          </svg>
        </button>
      </div>
    </div>
  `).join('') : '<p class="empty-message">No expenses yet</p>';
}

// Delete expense
function deleteExpense(id) {
  expenses = expenses.filter(expense => expense.id !== id);
  localStorage.setItem('expenses', JSON.stringify(expenses));
  renderExpenses();
  updateStats();
  updateCharts();
}

// Update statistics
function updateStats() {
  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const categories = new Set(expenses.map(expense => expense.category));
  
  totalSpentEl.textContent = `₹${totalSpent.toFixed(2)}`;
  totalCategoriesEl.textContent = categories.size;
  totalTransactionsEl.textContent = expenses.length;
}

// Initialize charts
function initializeCharts() {
  // Pie Chart
  const pieCtx = document.getElementById('pieChart').getContext('2d');
  pieChart = new Chart(pieCtx, {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [],
        backgroundColor: COLORS
      }],
      labels: []
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: '#FFFFFF'
          }
        }
      }
    }
  });

  // Bar Chart
  const barCtx = document.getElementById('barChart').getContext('2d');
  barChart = new Chart(barCtx, {
    type: 'bar',
    data: {
      datasets: [{
        data: [],
        backgroundColor: COLORS[0]
      }],
      labels: []
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: '#FFFFFF'
          },
          grid: {
            color: '#374151'
          }
        },
        x: {
          ticks: {
            color: '#FFFFFF'
          },
          grid: {
            display: false
          }
        }
      },
      plugins: {
        legend: {
          display: false
        }
      }
    }
  });

  updateCharts();
}

// Update charts
function updateCharts() {
  // Update Pie Chart
  const categoryTotals = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});

  pieChart.data.labels = Object.keys(categoryTotals);
  pieChart.data.datasets[0].data = Object.values(categoryTotals);
  pieChart.update();

  // Update Bar Chart
  const monthlyTotals = expenses.reduce((acc, expense) => {
    const month = new Date(expense.date).toLocaleString('default', { month: 'short' });
    acc[month] = (acc[month] || 0) + expense.amount;
    return acc;
  }, {});

  barChart.data.labels = Object.keys(monthlyTotals);
  barChart.data.datasets[0].data = Object.values(monthlyTotals);
  barChart.update();
}

// Initialize the app
init();