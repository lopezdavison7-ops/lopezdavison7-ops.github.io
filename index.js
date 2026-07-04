// (El script es el mismo que la versión anterior, se mantengo funcional)
import { supabase } from "./src/supabase.js";

    let currentUser = null;
    let bots = [];
    
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
        return alert("Completa todos los campos.");
    }

    // Crear usuario en Authentication
    const { data, error: authError } = await supabase.auth.signUp({
        email,
        password: pass
    });

    if (authError) {
        console.error(authError);
        return alert(authError.message);
    }

    const user = data.user;

    if (!user) {
        return alert("No se pudo crear la cuenta.");
    }

    // Guardar perfil
    const { error: profileError } = await supabase
        .from("user_data")
        .insert({
            id: user.id,
            username,
            email
        });

    if (profileError) {
        console.error(profileError);
        return alert(profileError.message);
    }

    alert("✅ Cuenta creada correctamente.");

    showLogin();
}

function resetUI() {
    currentUser = null;
    bots = [];

    renderBots();

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

    showLogin();
}

async function deleteAccount() {

    if (!currentUser) {
        return alert("No hay una sesión iniciada.");
    }

    if (!confirm("¿Seguro que deseas eliminar tu cuenta? Esta acción no se puede deshacer.")) {
        return;
    }

    // Eliminar bots
    const { error: botsError } = await supabase
        .from("bots")
        .delete()
        .eq("user_id", currentUser.id);

    if (botsError) {
        console.error(botsError);
        return alert("No se pudieron eliminar los bots.");
    }

    // Eliminar perfil
    const { error: profileError } = await supabase
        .from("user_data")
        .delete()
        .eq("id", currentUser.id);

    if (profileError) {
        console.error(profileError);
        return alert("No se pudo eliminar el perfil.");
    }

    // Cerrar sesión
    await supabase.auth.signOut();

    alert("✅ Cuenta eliminada.");

    resetUI();
}
    
async function login() {

    let login = document.getElementById("login-user").value.trim();
    const pass = document.getElementById("login-pass").value.trim();

    if (!login || !pass) {
        return alert("Ingresa tu usuario o correo.");
    }

    // Si escribió un usuario buscar su correo
    if (!login.includes("@")) {

        const { data: profile, error } = await supabase
            .from("user_data")
            .select("email")
            .eq("username", login)
            .single();

        if (error || !profile) {
            return alert("Usuario no encontrado.");
        }

        login = profile.email;
    }

    // Login Auth
    const { error: authError } =
        await supabase.auth.signInWithPassword({
            email: login,
            password: pass
        });

    if (authError) {
        console.error(authError);
        return alert(authError.message);
    }

    // Obtener usuario autenticado
    const {
        data: { user }
    } = await supabase.auth.getUser();

    // Obtener perfil
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
    
async function logout() {

    if (!confirm("¿Cerrar sesión?")) return;

    const { error } = await supabase.auth.signOut();

    if (error) {
        console.error(error);
        return alert("No se pudo cerrar la sesión.");
    }

    resetUI();
}

async function loadBots() {

    if (!currentUser) {
        bots = [];
        renderBots();
        return;
    }

    const { data, error } = await supabase
        .from("bots")
        .select("*")
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: true });

    if (error) {
        console.error(error);
        return alert("No se pudieron cargar los bots.");
    }

    bots = data ?? [];

    renderBots();
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
    
async function deployBot() {

    if (!currentUser) {
        return alert("Debes iniciar sesión.");
    }

    const name = document.getElementById("bot-name").value.trim() || "NuevoBot";
    const type = document.getElementById("bot-type").value;

    const { error } = await supabase
        .from("bots")
        .insert({
            user_id: currentUser.id,
            name,
            type,
            status: "✅ Online",
            logs: [
                `[${new Date().toLocaleTimeString()}] Bot ${name} desplegado`
            ]
        });

    if (error) {
        console.error(error);
        return alert("No se pudo crear el bot.");
    }

    await loadBots();

    alert(`🚀 Bot "${name}" desplegado correctamente.`);

    showSection("bots");
}
    
async function toggleBot(id) {

    const bot = bots.find(b => b.id === id);

    if (!bot) return;

    const newStatus =
        bot.status === "✅ Online"
            ? "⏸️ Pausado"
            : "✅ Online";

    const logs = [
        ...(bot.logs || []),
        `[${new Date().toLocaleTimeString()}] Estado cambiado a ${newStatus}`
    ];

    const { error } = await supabase
        .from("bots")
        .update({
            status: newStatus,
            logs
        })
        .eq("id", id)
        .eq("user_id", currentUser.id);

    if (error) {
        console.error(error);
        return alert("No se pudo actualizar el bot.");
    }

    await loadBots();
}
    
function showSection(section) {
  document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
  document.getElementById(`section-${section}`).classList.remove('hidden');
}

function openConsole(id) {

    showSection("console");

    const bot = bots.find(b => b.id === id);

    if (!bot) return;

    consoleBox.innerHTML = "";

    logConsole(`Bot: ${bot.name}`);
    logConsole(`Estado: ${bot.status}`);
    logConsole("");

    (bot.logs || []).forEach(log => logConsole(log));
}

function sendCommand() {
    const input = document.getElementById("console-input");

    runCommand(input.value);

    input.value = "";
    input.focus();
}

const consoleBox = document.getElementById("console-output");
const consoleInput = document.getElementById("console-input");

function logConsole(msg) {
  const line = document.createElement("div");
  line.textContent = msg;
  consoleBox.appendChild(line);
  consoleBox.scrollTop = consoleBox.scrollHeight;
}

consoleInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    const command = consoleInput.value.trim();
    runCommand(command);
    consoleInput.value = "";
  }
});

function runCommand(cmd = "") {
  cmd = cmd.trim();
  if (!cmd) return;

  const parts = cmd.split(/\s+/);
  const command = parts[0].toLowerCase();
  const args = parts.slice(1);

  switch (command) {

    case "clear":
    case "cls":
      consoleBox.innerHTML = "";
      logConsole("BotHost Console v1.0");
      logConsole("Escribe 'help' para ver los comandos.");
      logConsole("/>");
      break;

    case "help":
        logConsole(`/> '${command}'

Comandos disponibles:

help        - Muestra esta ayuda
bots        - Bots activos
clear, cls  - Limpia la consola
date        - Fecha y hora
time        - Hora actual`);
        logConsole("/>");
        break;

    case "bots":
        logConsole(`/> '${command}'
            
Bots activos: ${bots.length}`);
        logConsole("/>");
        break;

    case "date":
        logConsole(`/> '${command}'
            
Fecha y hora actual:`);
        logConsole(new Date().toLocaleString());
        logConsole("/>");
        break;

    case "time":
        logConsole(`/> '${command}'

Hora actual:`);
        logConsole(new Date().toLocaleTimeString());
        logConsole("/>");
        break;

    // otros comandos aquí...
    
    default:
        logConsole(`'${command}' no es un comando válido.`);
        logConsole("Escribe 'help' para ver la lista.");
        logConsole("/>");
  }
}

window.showLogin = showLogin;
window.showRegister = showRegister;
window.register = register;
window.login = login;
window.logout = logout;
window.showSection = showSection;
window.deployBot = deployBot;
window.toggleBot = toggleBot;
window.openConsole = openConsole;
window.sendCommand = sendCommand;
window.runCommand = runCommand;
window.deleteAccount = deleteAccount;

window.onload = async () => {
    const {
        data: { session }
    } = await supabase.auth.getSession();

    if (!session) {
        resetUI();
        return;
    }

    const user = session.user;

    const { data: profile } = await supabase
        .from("user_data")
        .select("username,email")
        .eq("id", user.id)
        .single();

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

    logConsole("BotHost Console v1.0");
    logConsole("Escribe 'help' para ver los comandos.");
    logConsole("/>");
};