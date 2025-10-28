const API_URL = '/api';
let token = localStorage.getItem('token');
let role = localStorage.getItem('role');
let username = localStorage.getItem('username');

function register() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
    .then(res => res.json())
    .then(data => alert(data.message || 'Registrado correctamente'));
}

function login() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
    .then(res => res.json())
    .then(data => {
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        localStorage.setItem('username', username);
        location.reload();
      } else {
        alert('Error al iniciar sesión');
      }
    });
}

function logout() {
  localStorage.clear();
  location.reload();
}

function showApp() {
  document.getElementById('auth-section').style.display = 'none';
  document.getElementById('app-section').style.display = 'block';
  document.getElementById('user-name').innerText = username;
  document.getElementById('user-role').innerText = role;
}

function goChat() {
  location.href = '/chat.html';
}

function loadProducts() {
  fetch(`${API_URL}/products`)
    .then(res => res.json())
    .then(products => {
      const div = document.getElementById('products');
      div.innerHTML = '';
      products.forEach(p => {
        div.innerHTML += `<div><b>${p.name}</b> - ${p.price}€<br>${p.description || ''}</div><hr>`;
      });
    });
}

// Mostrar interfaz según estado
if (token) showApp();
