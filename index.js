// (El script es el mismo que la versión anterior, se mantengo funcional)
import { supabase } from "./src/supabase.js";

    let currentUser = null;
    let bots = [];

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
    
    default:
        logConsole(`Comando desconocido: ${command}`);
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

async function register() {
    const username = document.getElementById("reg-user").value.trim();
    const email = document.getElementById("reg-email").value.trim();
    const pass = document.getElementById("reg-pass").value.trim();

    if (!username || !email || !pass) {
        return alert("Usuario, correo y contraseña son obligatorios.");
    }

    // Validar formato del correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        return alert("Ingresa un correo electrónico válido.");
    }

    // Verificar si el usuario o correo ya existen
    const { data: exists, error: checkError } = await supabase
        .from("user_data")
        .select("id")
        .or(`username.eq.${username},email.eq.${email}`);

    if (checkError) {
        console.error(checkError);
        return alert("Error al verificar los datos.");
    }

    if (exists?.length) {
        return alert("El usuario o el correo ya están registrados.");
    }

    // Registrar usuario
    const { error } = await supabase
        .from("user_data")
        .insert({
            username,
            email,
            pass
        });

    if (error) {
        console.error(error);
        return alert("Error al registrar: " + error.message);
    }

    alert("✅ Registro exitoso.");
    showLogin();
}

function resetUI() {
    currentUser = null;

    document.getElementById("dashboard").classList.add("hidden");
    document.getElementById("auth-screen").classList.remove("hidden");

    document.getElementById("nav-menu").classList.add("hidden");
    document.getElementById("user-info").classList.add("hidden");
    document.getElementById("btn-logout").classList.add("hidden");

    document.getElementById("login-user").value = "";
    document.getElementById("login-pass").value = "";

    document.getElementById("reg-user").value = "";
    document.getElementById("reg-email").value = "";
    document.getElementById("reg-pass").value = "";

    bots = [];
    renderBots();

    showLogin();
}

async function deleteAccount() {
    if (!currentUser) {
        return alert("No hay ninguna sesión iniciada.");
    }

    if (!confirm("¿Seguro que deseas eliminar tu cuenta? Esta acción no se puede deshacer.")) {
        return;
    }

    const { error } = await supabase
        .from("user_data")
        .delete()
        .eq("id", currentUser.id);

    if (error) {
        console.error(error);
        return alert("Error al eliminar la cuenta: " + error.message);
    }

    alert("✅ Cuenta eliminada correctamente.");
    resetUI();
}
    
async function login() {

    let login = document.getElementById("login-user").value.trim();
    const pass = document.getElementById("login-pass").value.trim();

    if (!login || !pass) {
        return alert("Ingresa tu usuario o correo y tu contraseña.");
    }

    // Si escribió un usuario, obtener su correo
    if (!login.includes("@")) {

        const { data: profile, error } = await supabase
            .from("user_data")
            .select("email")
            .eq("username", login)
            .single();

        if (error || !profile) {
            return alert("❌ Usuario no encontrado.");
        }

        login = profile.email;
    }

    // Login con Supabase Auth
    const { error: authError } =
        await supabase.auth.signInWithPassword({
            email: login,
            password: pass
        });

    if (authError) {
        console.error(authError);
        return alert("❌ Usuario o contraseña incorrectos.");
    }

    // Usuario autenticado
    const {
        data: { user }
    } = await supabase.auth.getUser();

    // Obtener información adicional
    const { data: profile, error: profileError } =
        await supabase
            .from("user_data")
            .select("username,email")
            .eq("id", user.id)
            .single();

    if (profileError) {
        console.error(profileError);
        return alert("No se pudo cargar el perfil.");
    }

    currentUser = {
        id: user.id,
        username: profile.username,
        email: profile.email
    };

    document.getElementById("nav-menu").classList.remove("hidden");

    document.getElementById("auth-screen").classList.add("hidden");
    document.getElementById("dashboard").classList.remove("hidden");

    document.getElementById("welcome-name").textContent = currentUser.username;
    document.getElementById("username-display").textContent = currentUser.username;

    document.getElementById("user-info").classList.remove("hidden");
    document.getElementById("btn-logout").classList.remove("hidden");

    await loadBots();

    showSection("bots");
}
    
function logout() {
    if (!confirm("¿Cerrar sesión?")) return;

    resetUI();
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

window.showLogin = showLogin;
window.showRegister = showRegister;
window.register = register;
window.login = login;
window.logout = logout;
window.showSection = showSection;
window.deployBot = deployBot;
window.toggleBot = toggleBot;
window.runCommand = runCommand;
window.deleteAccount = deleteAccount;