const STORAGE_KEY = 'babu-garage-pos-v2';

const defaultSuperAdmin = {
  id: 'super-admin-default',
  username: 'superadmin',
  password: 'babu@super',
  role: 'super_admin',
  plan: 'lifetime',
  createdAt: new Date().toISOString(),
  expiresAt: null
};

const seed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') || {
  currentUserId: null,
  accounts: [defaultSuperAdmin],
  customers: [],
  vehicles: [],
  jobs: [],
  sales: []
};

if (!Array.isArray(seed.accounts) || !seed.accounts.length) {
  seed.accounts = [defaultSuperAdmin];
}
if (!seed.accounts.some((a) => a.role === 'super_admin')) {
  seed.accounts.unshift(defaultSuperAdmin);
}

const state = seed;

const els = {
  trialStatus: document.getElementById('trialStatus'),
  protectedApp: document.getElementById('protectedApp'),
  authOverlay: document.getElementById('authOverlay'),
  loginForm: document.getElementById('loginForm'),
  logoutBtn: document.getElementById('logoutBtn'),
  superAdminPanel: document.getElementById('superAdminPanel'),
  accountForm: document.getElementById('accountForm'),
  accountsTable: document.getElementById('accountsTable'),
  customerForm: document.getElementById('customerForm'),
  vehicleForm: document.getElementById('vehicleForm'),
  jobForm: document.getElementById('jobForm'),
  saleForm: document.getElementById('saleForm'),
  customerList: document.getElementById('customerList'),
  vehicleList: document.getElementById('vehicleList'),
  jobsTable: document.getElementById('jobsTable'),
  salesTable: document.getElementById('salesTable'),
  todaySales: document.getElementById('todaySales'),
  vehicleCustomer: document.getElementById('vehicleCustomer'),
  jobVehicle: document.getElementById('jobVehicle'),
  searchInput: document.getElementById('searchInput')
};

const planLabel = {
  '3h': 'Temporary 3 Hours',
  '6h': 'Temporary 6 Hours',
  '30d': 'Subscription 30 Days',
  lifetime: 'Lifetime'
};

const saveState = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

const money = (v) => `$${Number(v || 0).toFixed(2)}`;

const getCurrentUser = () => state.accounts.find((a) => a.id === state.currentUserId) || null;

const getExpiryMeta = (account) => {
  if (!account || !account.expiresAt) {
    return { expired: false, label: 'No expiry', msLeft: Infinity };
  }

  const msLeft = new Date(account.expiresAt).getTime() - Date.now();
  if (msLeft <= 0) {
    return { expired: true, label: 'Expired', msLeft: 0 };
  }

  const hours = Math.floor(msLeft / (1000 * 60 * 60));
  const minutes = Math.ceil((msLeft % (1000 * 60 * 60)) / (1000 * 60));

  if (hours >= 24) {
    const days = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
    return { expired: false, label: `${days} day(s) left`, msLeft };
  }

  return { expired: false, label: `${hours}h ${minutes}m left`, msLeft };
};

const applyPlanToExpiry = (plan) => {
  const end = new Date();
  if (plan === '3h') end.setHours(end.getHours() + 3);
  if (plan === '6h') end.setHours(end.getHours() + 6);
  if (plan === '30d') end.setDate(end.getDate() + 30);
  return end.toISOString();
};

const renderAccounts = () => {
  const rows = state.accounts
    .slice()
    .sort((a, b) => (a.role === 'super_admin' ? -1 : 1))
    .map((a) => {
      const meta = getExpiryMeta(a);
      const status = meta.expired ? 'Locked' : 'Active';
      return `<tr>
        <td>${a.username}</td>
        <td>${a.role}</td>
        <td>${planLabel[a.plan] || a.plan}</td>
        <td>${a.expiresAt ? new Date(a.expiresAt).toLocaleString() : 'Never'}</td>
        <td>${status}</td>
      </tr>`;
    })
    .join('');

  els.accountsTable.innerHTML = rows;
};

const renderAuthGate = () => {
  const user = getCurrentUser();
  const meta = getExpiryMeta(user);

  if (!user) {
    els.trialStatus.textContent = 'Please login to continue';
    els.protectedApp.hidden = true;
    els.authOverlay.hidden = false;
    els.superAdminPanel.hidden = true;
    return;
  }

  if (meta.expired) {
    state.currentUserId = null;
    saveState();
    els.trialStatus.textContent = 'Account expired. Contact super admin.';
    els.protectedApp.hidden = true;
    els.authOverlay.hidden = false;
    els.superAdminPanel.hidden = true;
    return;
  }

  els.trialStatus.textContent = `${user.username} • ${user.role} • ${meta.label}`;
  els.protectedApp.hidden = false;
  els.authOverlay.hidden = true;
  els.superAdminPanel.hidden = user.role !== 'super_admin';
};

const fillSelect = (el, rows, labelFn, valueKey = 'id') => {
  el.innerHTML = '';
  rows.forEach((row) => {
    const option = document.createElement('option');
    option.value = row[valueKey];
    option.textContent = labelFn(row);
    el.appendChild(option);
  });
  if (!rows.length) {
    const option = document.createElement('option');
    option.textContent = 'Add data first';
    option.disabled = true;
    option.selected = true;
    el.appendChild(option);
  }
};

const renderRegistry = () => {
  const query = els.searchInput.value.trim().toLowerCase();

  const filteredCustomers = state.customers.filter((c) =>
    [c.name, c.phone, c.email].join(' ').toLowerCase().includes(query)
  );
  const filteredVehicles = state.vehicles.filter((v) => {
    const owner = state.customers.find((c) => c.id === v.customerId);
    return [v.plate, v.model, owner?.name].join(' ').toLowerCase().includes(query);
  });

  els.customerList.innerHTML = filteredCustomers
    .map((c) => `<li><b>${c.name}</b><br/>📞 ${c.phone}${c.email ? ` • ✉️ ${c.email}` : ''}</li>`)
    .join('');
  els.vehicleList.innerHTML = filteredVehicles
    .map((v) => {
      const owner = state.customers.find((c) => c.id === v.customerId);
      return `<li><b>${v.plate}</b> • ${v.model} ${v.year || ''}<br/>Owner: ${owner?.name || 'N/A'}</li>`;
    })
    .join('');

  fillSelect(els.vehicleCustomer, state.customers, (c) => `${c.name} (${c.phone})`);
  fillSelect(els.jobVehicle, state.vehicles, (v) => `${v.plate} • ${v.model}`);
};

const renderJobs = () => {
  els.jobsTable.innerHTML = state.jobs
    .slice()
    .reverse()
    .map((job) => {
      const vehicle = state.vehicles.find((v) => v.id === job.vehicleId);
      const estimate = Number(job.labor || 0) + Number(job.parts || 0);
      return `<tr>
          <td>${vehicle ? `${vehicle.plate} (${vehicle.model})` : 'Unknown'}</td>
          <td>${job.service}</td>
          <td>${job.status}</td>
          <td>${money(estimate)}</td>
        </tr>`;
    })
    .join('');
};

const renderSales = () => {
  const today = new Date().toDateString();
  const todayTotal = state.sales
    .filter((s) => new Date(s.createdAt).toDateString() === today)
    .reduce((acc, s) => acc + s.total, 0);

  els.todaySales.textContent = money(todayTotal);
  els.salesTable.innerHTML = state.sales
    .slice()
    .reverse()
    .map((sale) => `<tr>
      <td>${new Date(sale.createdAt).toLocaleDateString()}</td>
      <td>${sale.item}</td>
      <td>${sale.qty}</td>
      <td>${money(sale.total)}</td>
    </tr>`)
    .join('');
};

const renderAll = () => {
  renderAuthGate();
  renderAccounts();
  renderRegistry();
  renderJobs();
  renderSales();
};

els.loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const username = String(formData.get('username') || '').trim();
  const password = String(formData.get('password') || '');

  const account = state.accounts.find((a) => a.username === username && a.password === password);
  if (!account) {
    alert('Invalid credentials.');
    return;
  }

  const meta = getExpiryMeta(account);
  if (meta.expired) {
    alert('This account has expired. Contact super admin.');
    return;
  }

  state.currentUserId = account.id;
  saveState();
  e.target.reset();
  renderAll();
});

els.logoutBtn.addEventListener('click', () => {
  state.currentUserId = null;
  saveState();
  renderAll();
});

els.accountForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const user = getCurrentUser();
  if (!user || user.role !== 'super_admin') {
    alert('Only super admin can create accounts.');
    return;
  }

  const formData = new FormData(e.target);
  const username = String(formData.get('username') || '').trim();
  const password = String(formData.get('password') || '').trim();
  const plan = String(formData.get('plan') || '3h');

  if (!username || !password) {
    alert('Username and password are required.');
    return;
  }

  if (state.accounts.some((a) => a.username.toLowerCase() === username.toLowerCase())) {
    alert('Username already exists. Choose another one.');
    return;
  }

  state.accounts.push({
    id: crypto.randomUUID(),
    username,
    password,
    role: 'admin',
    plan,
    createdAt: new Date().toISOString(),
    expiresAt: applyPlanToExpiry(plan)
  });

  saveState();
  e.target.reset();
  renderAccounts();
});

els.customerForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  state.customers.push({
    id: crypto.randomUUID(),
    name: formData.get('name'),
    phone: formData.get('phone'),
    email: formData.get('email')
  });
  saveState();
  e.target.reset();
  renderRegistry();
});

els.vehicleForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  state.vehicles.push({
    id: crypto.randomUUID(),
    plate: formData.get('plate'),
    model: formData.get('model'),
    year: formData.get('year'),
    customerId: formData.get('customerId')
  });
  saveState();
  e.target.reset();
  renderRegistry();
  renderJobs();
});

els.jobForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  state.jobs.push({
    id: crypto.randomUUID(),
    vehicleId: formData.get('vehicleId'),
    service: formData.get('service'),
    labor: Number(formData.get('labor') || 0),
    parts: Number(formData.get('parts') || 0),
    status: formData.get('status'),
    createdAt: new Date().toISOString()
  });
  saveState();
  e.target.reset();
  renderJobs();
});

els.saleForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const qty = Number(formData.get('qty') || 0);
  const price = Number(formData.get('price') || 0);
  state.sales.push({
    id: crypto.randomUUID(),
    item: formData.get('item'),
    qty,
    price,
    total: qty * price,
    createdAt: new Date().toISOString()
  });
  saveState();
  e.target.reset();
  renderSales();
});

els.searchInput.addEventListener('input', renderRegistry);

renderAll();
setInterval(renderAll, 30000);
