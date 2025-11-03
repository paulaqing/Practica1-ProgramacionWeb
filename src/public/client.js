const API = '';

function register() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const role = document.getElementById('role')?.value || 'user';
  fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, role })
  }).then(res => res.json()).then(data => alert(data.message));
}

function login() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  }).then(res => res.json())
    .then(data => {
      if(data.token) {
        localStorage.setItem('token', data.token);
        showProducts();
      } else {
        alert('Error en login');
      }
    });
}

async function showProducts() {
  document.querySelector('#products-section').style.display = 'block';
  const token = localStorage.getItem('token');
  const res = await fetch(`${API}/products`, { headers: { 'Authorization': 'Bearer ' + token } });
  const products = await res.json();
  const list = document.getElementById('product-list');
  list.innerHTML = '';
  products.forEach(p => list.innerHTML += `<li>${p.name} - $${p.price}</li>`);
  const decoded = JSON.parse(atob(token.split('.')[1]));
  if(decoded.role === 'admin') document.getElementById('admin-controls').style.display = 'block';
}

function createProduct() {
  const token = localStorage.getItem('token');
  const name = document.getElementById('p-name').value;
  const description = document.getElementById('p-desc').value;
  const price = document.getElementById('p-price').value;
  const stock = document.getElementById('p-stock').value;
  fetch(`${API}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
    body: JSON.stringify({ name, description, price, stock })
  }).then(() => showProducts());
}

function goToChat() { window.location.href = '/chat'; }
function logout() { localStorage.removeItem('token'); window.location.reload(); }
