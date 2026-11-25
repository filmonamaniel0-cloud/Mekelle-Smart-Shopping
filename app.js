const defaultProducts = [
  { name: 'Sugar (1kg)', cost: 85, price: 100, qty: 25 },
  { name: 'Cooking Oil (5L)', cost: 920, price: 1050, qty: 4 },
  { name: 'Pasta (Pack)', cost: 55, price: 70, qty: 40 },
  { name: 'Berbere (1kg)', cost: 260, price: 310, qty: 3 }
];

let products = JSON.parse(localStorage.getItem('suk_products')) || defaultProducts.map(p => ({ ...p }));
let sales = JSON.parse(localStorage.getItem('suk_sales')) || [];
let prodChart = null;
let payChart = null;
let currentLang = 'EN';

const translations = {
  EN: {
    title: 'Mekelle Smart-Suk',
    subtitle: 'Inventory, Credit (Asheba) & Sales Analytics',
    export: 'Export Excel (CSV)',
    demo: 'Load Sample Data',
    kpiRev: 'Total Revenue',
    kpiProf: 'Total Net Profit',
    kpiMargin: 'Profit Margin',
    kpiCred: 'Unpaid Credit (Asheba)',
    kpiStock: 'Low Stock Alerts (<5)',
    addProdTitle: '1. Add or Restock Product',
    saveProd: 'Save to Inventory',
    recSaleTitle: '2. Record Sale or Credit (Asheba)',
    recBtn: 'Complete Transaction',
    chartProd: 'Revenue by Product (ETB)',
    chartPay: 'Sales Split by Payment Type',
    invTable: 'Current Stock & Unit Profit Analysis',
    credTable: 'Active Customer Credit (Asheba) Ledger',
    salesTable: 'Transaction History'
  },
  TI: {
    title: 'መቐለ ስማርት-ሱቕ (Smart-Suk)',
    subtitle: 'ምሕደራ ንብረት፣ ኣሸባ (ዕዳ) እና ትንተና መሸጣ',
    export: 'ናብ Excel ኣውርድ (CSV)',
    demo: 'ናሙና ሓበሬታ ኣእቱ',
    kpiRev: 'ጠቕላላ እቶት (Revenue)',
    kpiProf: 'ዝተረፈ መኽሰብ (Profit)',
    kpiMargin: 'መጠን መኽሰብ (%)',
    kpiCred: 'ዘይተኸፈለ ኣሸባ (Credit)',
    kpiStock: 'ዝውዳእ ዘሎ ኣቕሓ (<5)',
    addProdTitle: '1. ሓዱሽ ኣቕሓ መዝግብ / ወስኽ',
    saveProd: 'ኣብ መኽዘን ኣቐምጥ',
    recSaleTitle: '2. መሸጣ ወይ ኣሸባ መዝግብ',
    recBtn: 'መሸጣ መዝግብ',
    chartProd: 'እቶት ብዓይነት ኣቕሓ (ETB)',
    chartPay: 'ኣከፋፍላ (Cash / Telebirr / ኣሸባ)',
    invTable: 'ዝርዝር ዘሎ ንብረትን መኽሰብን',
    credTable: 'ዝርዝር ኣሸባ ዘለዎም ዓማዊል',
    salesTable: 'ጠቕላላ ዝተመዝገበ መሸጣ'
  }
};

function toggleLanguage() {
  currentLang = currentLang === 'EN' ? 'TI' : 'EN';
  const t = translations[currentLang];
  document.getElementById('txt-title').innerText = t.title;
  document.getElementById('txt-subtitle').innerText = t.subtitle;
  document.getElementById('txt-export').innerText = t.export;
  document.getElementById('txt-demo').innerText = t.demo;
  document.getElementById('txt-kpi-rev').innerText = t.kpiRev;
  document.getElementById('txt-kpi-prof').innerText = t.kpiProf;
  document.getElementById('txt-kpi-margin').innerText = t.kpiMargin;
  document.getElementById('txt-kpi-cred').innerText = t.kpiCred;
  document.getElementById('txt-kpi-stock').innerText = t.kpiStock;
  document.getElementById('txt-add-prod-title').innerText = t.addProdTitle;
  document.getElementById('txt-save-prod').innerText = t.saveProd;
  document.getElementById('txt-rec-sale-title').innerText = t.recSaleTitle;
  document.getElementById('txt-rec-btn').innerText = t.recBtn;
  document.getElementById('txt-chart-prod').innerText = t.chartProd;
  document.getElementById('txt-chart-pay').innerText = t.chartPay;
  document.getElementById('txt-inv-table').innerText = t.invTable;
  document.getElementById('txt-cred-table').innerText = t.credTable;
  document.getElementById('txt-sales-table').innerText = t.salesTable;
}

function toggleCreditFields() {
  const type = document.getElementById('sale-type').value;
  const box = document.getElementById('credit-fields');
  if (type === 'Credit') {
    box.classList.remove('hidden');
  } else {
    box.classList.add('hidden');
  }
}

function saveData() {
  localStorage.setItem('suk_products', JSON.stringify(products));
  localStorage.setItem('suk_sales', JSON.stringify(sales));
  renderAll();
}

function resetDemoData() {
  products = defaultProducts.map(p => ({ ...p }));
  sales = [
    { id: 1, date: '2026-11-23', product: 'Sugar (1kg)', qty: 6, revenue: 600, profit: 90, type: 'Cash', customer: 'Walk-in', phone: '-', paidAmount: 600 },
    { id: 2, date: '2026-11-24', product: 'Cooking Oil (5L)', qty: 2, revenue: 2100, profit: 260, type: 'Telebirr', customer: 'Selamawit', phone: '0911223344', paidAmount: 2100 },
    { id: 3, date: '2026-11-24', product: 'Pasta (Pack)', qty: 10, revenue: 700, profit: 150, type: 'Cash', customer: 'Walk-in', phone: '-', paidAmount: 700 },
    { id: 4, date: '2026-11-25', product: 'Berbere (1kg)', qty: 3, revenue: 930, profit: 150, type: 'Credit', customer: 'Dawit Gebre', phone: '0914556677', paidAmount: 400 }
  ];
  saveData();
}

function addProduct() {
  const name = document.getElementById('prod-name').value.trim();
  const cost = parseFloat(document.getElementById('prod-cost').value);
  const price = parseFloat(document.getElementById('prod-price').value);
  const qty = parseInt(document.getElementById('prod-qty').value, 10);

  if (!name || isNaN(cost) || isNaN(price) || isNaN(qty) || qty <= 0) {
    return alert('Please enter valid product details.');
  }

  const existing = products.find(p => p.name.toLowerCase() === name.toLowerCase());
  if (existing) {
    existing.qty += qty;
    existing.cost = cost;
    existing.price = price;
  } else {
    products.push({ name, cost, price, qty });
  }

  document.getElementById('prod-name').value = '';
  document.getElementById('prod-cost').value = '';
  document.getElementById('prod-price').value = '';
  document.getElementById('prod-qty').value = '';
  saveData();
}

function quickRestock(index) {
  products[index].qty += 5;
  saveData();
}

function recordSale() {
  const idx = document.getElementById('sale-prod').value;
  const qty = parseInt(document.getElementById('sale-qty').value, 10);
  const type = document.getElementById('sale-type').value;
  const prod = products[idx];

  if (!prod || isNaN(qty) || qty <= 0) return alert('Enter a valid quantity.');
  if (prod.qty < qty) return alert(`Insufficient stock! Only ${prod.qty} left.`);

  const revenue = prod.price * qty;
  const profit = (prod.price - prod.cost) * qty;
  let customer = 'Walk-in';
  let phone = '-';
  let paidAmount = revenue;

  if (type === 'Credit') {
    customer = document.getElementById('customer-name').value.trim();
    phone = document.getElementById('customer-phone').value.trim() || '-';
    paidAmount = parseFloat(document.getElementById('initial-paid').value) || 0;

    if (!customer) return alert('Customer name is required for Credit sales.');
    if (paidAmount < 0 || paidAmount > revenue) {
      return alert('Initial deposit must be between 0 and total sale price.');
    }
  }

  prod.qty -= qty;
  sales.unshift({
    id: Date.now(),
    date: new Date().toISOString().split('T')[0],
    product: prod.name,
    qty,
    revenue,
    profit,
    type,
    customer,
    phone,
    paidAmount
  });

  document.getElementById('sale-qty').value = '';
  document.getElementById('customer-name').value = '';
  document.getElementById('customer-phone').value = '';
  document.getElementById('initial-paid').value = '0';
  saveData();
}

function applyCreditPayment(id) {
  const input = document.getElementById(`pay-input-${id}`);
  const amount = parseFloat(input.value);
  const sale = sales.find(s => s.id === id);

  if (!sale || isNaN(amount) || amount <= 0) return alert('Enter a valid payment amount.');
  const balance = sale.revenue - sale.paidAmount;
  if (amount > balance) return alert(`Amount exceeds remaining balance (${balance} ETB).`);

  sale.paidAmount += amount;
  saveData();
}

function renderAll() {
  // Dropdown
  const select = document.getElementById('sale-prod');
  select.innerHTML = products.map((p, i) =>
    `<option value="${i}">${p.name} (Stock: ${p.qty} | ${p.price} ETB)</option>`
  ).join('');

  // KPIs
  const totalRev = sales.reduce((sum, s) => sum + s.revenue, 0);
  const totalProf = sales.reduce((sum, s) => sum + s.profit, 0);
  const margin = totalRev > 0 ? ((totalProf / totalRev) * 100).toFixed(1) : 0;
  const remainingCredit = sales.reduce((sum, s) => sum + Math.max(0, s.revenue - s.paidAmount), 0);
  const lowStock = products.filter(p => p.qty < 5).length;

  document.getElementById('kpi-revenue').innerText = `${totalRev.toLocaleString()} ETB`;
  document.getElementById('kpi-profit').innerText = `${totalProf.toLocaleString()} ETB`;
  document.getElementById('kpi-margin').innerText = `${margin}%`;
  document.getElementById('kpi-credit').innerText = `${remainingCredit.toLocaleString()} ETB`;
  document.getElementById('kpi-lowstock').innerText = `${lowStock} Items`;

  // Inventory Table
  document.getElementById('inventory-table').innerHTML = products.map((p, i) => {
    const unitProfit = p.price - p.cost;
    const stockVal = p.cost * p.qty;
    const lowBadge = p.qty < 5 ? `<span class="badge badge-credit">${p.qty} (Low)</span>` : `<strong>${p.qty}</strong>`;
    return `
      <tr>
        <td><strong>${p.name}</strong></td>
        <td>${p.cost} ETB</td>
        <td>${p.price} ETB</td>
        <td>+${unitProfit} ETB</td>
        <td>${lowBadge}</td>
        <td>${stockVal.toLocaleString()} ETB</td>
        <td><button class="btn btn-accent btn-sm" onclick="quickRestock(${i})">+5 Stock</button></td>
      </tr>
    `;
  }).join('');

  // Credit Table
  const activeCredits = sales.filter(s => s.revenue > s.paidAmount);
  document.getElementById('credit-table').innerHTML = activeCredits.map(s => {
    const bal = s.revenue - s.paidAmount;
    return `
      <tr>
        <td>${s.date}</td>
        <td><strong>${s.customer}</strong></td>
        <td>${s.phone}</td>
        <td>${s.product} (${s.qty})</td>
        <td>${s.revenue} ETB</td>
        <td>${s.paidAmount} ETB</td>
        <td><strong class="text-danger">${bal} ETB</strong></td>
        <td>
          <input type="number" id="pay-input-${s.id}" class="inline-pay" placeholder="${bal}" max="${bal}" />
          <button class="btn btn-primary btn-sm" onclick="applyCreditPayment(${s.id})">Pay</button>
        </td>
      </tr>
    `;
  }).join('') || '<tr><td colspan="8">No active customer credit (Asheba).</td></tr>';

  renderSalesLog();
  updateCharts();
}

function renderSalesLog() {
  const filter = document.getElementById('filter-type').value;
  const filtered = filter === 'ALL' ? sales : sales.filter(s => s.type === filter);

  document.getElementById('sales-table').innerHTML = filtered.map(s => {
    const settled = s.paidAmount >= s.revenue;
    return `
      <tr>
        <td>${s.date}</td>
        <td>${s.product}</td>
        <td>${s.qty}</td>
        <td>${s.revenue} ETB</td>
        <td>${s.profit} ETB</td>
        <td>${s.type}</td>
        <td>${s.customer}</td>
        <td><span class="badge ${settled ? 'badge-paid' : 'badge-credit'}">${settled ? 'Settled' : 'Balance Due'}</span></td>
      </tr>
    `;
  }).join('') || '<tr><td colspan="8">No transactions found.</td></tr>';
}

function updateCharts() {
  const prodTotals = {};
  sales.forEach(s => {
    prodTotals[s.product] = (prodTotals[s.product] || 0) + s.revenue;
  });

  const methodTotals = { Cash: 0, Telebirr: 0, Credit: 0 };
  sales.forEach(s => {
    methodTotals[s.type] = (methodTotals[s.type] || 0) + s.revenue;
  });

  if (prodChart) prodChart.destroy();
  prodChart = new Chart(document.getElementById('productChart'), {
    type: 'bar',
    data: {
      labels: Object.keys(prodTotals),
      datasets: [{
        label: 'Revenue (ETB)',
        data: Object.values(prodTotals),
        backgroundColor: '#2d6a4f',
        borderRadius: 4
      }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });

  if (payChart) payChart.destroy();
  payChart = new Chart(document.getElementById('paymentChart'), {
    type: 'doughnut',
    data: {
      labels: Object.keys(methodTotals),
      datasets: [{
        data: Object.values(methodTotals),
        backgroundColor: ['#1b4332', '#40916c', '#c1121f']
      }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });
}

function exportCSV() {
  let csv = 'Date,Product,Quantity,Revenue_ETB,Profit_ETB,Payment_Method,Customer,Phone,Paid_ETB,Balance_ETB\n';
  sales.forEach(s => {
    const bal = Math.max(0, s.revenue - s.paidAmount);
    csv += `${s.date},"${s.product}",${s.qty},${s.revenue},${s.profit},${s.type},"${s.customer}","${s.phone}",${s.paidAmount},${bal}\n`;
  });
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'mekelle_smart_suk_report.csv';
  a.click();
}

renderAll();