// (El script es el mismo que la versión anterior, lo mantengo funcional)

import { supabase } from "./src/supabase.js";

    let currentUser = null;
    let bots = [];

const { data, error } = await supabase
    .from("user_data")
    .select("*");

const consoleBox = document.getElementById("console");
const consoleInput = document.getElementById("consoleInput");

function logConsole(msg) {
  consoleBox.innerHTML += `<div>${msg}</div>`;
  consoleBox.scrollTop = consoleBox.scrollHeight;
}

consoleInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    const command = consoleInput.value.trim();
    runCommand(command);
    consoleInput.value = "";
  }
});

function runCommand(cmd) {
  const parts = cmd.split(" ");
  const command = parts[0].toLowerCase();
  const args = parts.slice(1);

  switch (command) {

    case "clear":
    case "cls":
      consoleBox.innerHTML = "";
      break;

    case "help":
        logConsole(`Comandos disponibles:

help        - Muestra esta ayuda
bots        - Bots activos
clear, cls  - Limpia la consola
date        - Fecha y hora
time        - Hora actual`);
        break;

    case "bots":
        logConsole(`Bots activos: ${bots.length}`);
        break;

    case "date":
        logConsole(new Date().toLocaleString());
        break;

    case "time":
        logConsole(new Date().toLocaleTimeString());
        break;

    // otros comandos aquí...
  }
}
    
function showLogin() {
  document.getElementById('login-form').classList.remove('hidden');
  document.getElementById('register-form').classList.add('hidden');
}

function showRegister() {
  document.getElementById('login-form').classList.add('hidden');
  document.getElementById('register-form').classList.remove('hidden');
}

function register() {
  const user = document.getElementById('reg-user').value.trim();
  const pass = document.getElementById('reg-pass').value.trim();
  if (!user || !pass) return alert("Usuario y contraseña son obligatorios");
      
  localStorage.setItem('botHost_user', JSON.stringify({ user, pass }));
  alert("✅ Registro exitoso! Ahora puedes iniciar sesión.");
  showLogin();
}
    
function login() {
  const user = document.getElementById('login-user').value.trim();
  const pass = document.getElementById('login-pass').value.trim();
      
  const saved = JSON.parse(localStorage.getItem('botHost_user'));

  document.getElementById("nav-menu").classList.remove("hidden");

  if (
    saved &&
    user === saved.user &&
    pass === saved.pass
  ) {
    currentUser = user;
    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    document.getElementById('welcome-name').textContent = user;
    document.getElementById("username-display").textContent = user;
    document.getElementById('user-info').classList.remove('hidden');
    document.getElementById('btn-logout').classList.remove('hidden');
    loadBots();
    showSection('bots');
  } else {
    alert("❌ Usuario o contraseña incorrectos");
  }
}
    
function logout() {
  document.getElementById("nav-menu").classList.add("hidden");
  if (confirm("¿Cerrar sesión?")) {
    currentUser = null;
    document.getElementById('dashboard').classList.add('hidden');
    document.getElementById('auth-screen').classList.remove('hidden');
    document.getElementById('user-info').classList.add('hidden');
    document.getElementById('btn-logout').classList.add('hidden');
  }    
}

// Si no hay datos o el JSON es inválido, usa los valores por defecto.
function loadBots() {
  try {
    const saved = localStorage.getItem('botHost_bots');
    bots = saved ? JSON.parse(saved) : [
      {
        id: 1,
        name: "MiPrimerBot",
        type: "Telegram",
        status: "✅ Online",
        logs: []
      }
    ];
  } catch (err) {
    bots = [
      {
        id: 1,
        name: "MiPrimerBot",
        type: "Telegram",
        status: "✅ Online",
        logs: []
      }
    ];
  }
  renderBots();
}
    
function saveBots() {
  localStorage.setItem('botHost_bots', JSON.stringify(bots));
}
    
function renderBots() {
  const container = document.getElementById('bots-list');
  container.innerHTML = bots.map(bot => `
    <div class="bg-gray-900 border border-gray-700 hover:border-blue-500 rounded-3xl p-6 transition">
      <div class="flex justify-between items-start">
        <div>
          <h3 class="font-bold text-xl">${bot.name}</h3>
          <p class="text-gray-400">${bot.type}</p>
        </div>
        <span class="text-sm ${ bot.status.includes('Online') ? 'text-green-400' : 'text-yellow-400' }"> ${bot.status} </span>
      </div>
      <div class="mt-6 flex gap-3">
        <button onclick="toggleBot(${bot.id})" class="flex-1 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700">Toggle</button>
        <button onclick="openConsole(${bot.id})" class="flex-1 py-3 rounded-2xl bg-gray-700 hover:bg-gray-600">Consola</button>
      </div>
    </div>
  `).join('');
}
    
function deployBot() {
  const name = document.getElementById('bot-name').value || "NuevoBot";
  const type = document.getElementById('bot-type').value;
      
  const newBot = {
    id: Date.now(),
    name: name,
    type: type,
    status: "✅ Online",
    logs: [`[${new Date().toLocaleTimeString()}] Bot ${name} desplegado`]
  };
      
  bots.push(newBot);
  saveBots();
  renderBots();
  alert(`🚀 Bot "${name}" desplegado correctamente!`);
  showSection('bots');
}
    
function toggleBot(id) {
  const bot = bots.find(b => b.id === id);
  if (bot) {
    bot.status = bot.status.includes('Online') ? "⏸️ Pausado" : "✅ Online";
    saveBots();
    renderBots();
  }
}
    
function showSection(section) {
  document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
  document.getElementById(`section-${section}`).classList.remove('hidden');
}

window.onload = () => {
  const savedUser = localStorage.getItem('botHost_user');
  if (savedUser) {
    // Puedes auto-login si quieres
  }
};

window.showLogin = showLogin;
window.showRegister = showRegister;
window.register = register;
window.login = login;
window.logout = logout;
window.showSection = showSection;
window.deployBot = deployBot;
window.toggleBot = toggleBot;
window.runCommand = runCommand;