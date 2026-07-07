// (El script es el mismo que la versión anterior, se mantengo funcional)

import { supabase } from "./src/supabase.js";
import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";

let currentUser = null;
let currentRepository = null;
let bots = [];

const repositories = {

    Telegram: [],

    WhatsApp: [
        {
            id: 1,
            github: "https://github.com/matterssmith-net/Base-Bot/"
        },
        {
            id: 2,
            github: "https://github.com/Andresv27728/SENKU-BOT"
        },
        {
            id: 3,
            github: "https://github.com/Andresv27728/GawrGura"
        },
        {
            id: 4,
            github: "https://github.com/Neykoor/kamijs"
        },
        {
            id: 5,
            github: "https://github.com/Axelix09/zenbot-base"
        },
        {
            id: 6,
            github : "https://github.com/DevYerZx/fsociety-bot"
        },
        {
            id: 7,
            github : "https://github.com/eliac-d/kirito-Bot-MD-v3"
        }
    ],

    Discord: [],

    Custom: []

};

function parseGitHubUrl(url) {
    if (!url) {
        throw new Error("La URL del repositorio está vacía.");
    }

    const parts = new URL(url)
        .pathname
        .replace(/\.git$/, "")
        .split("/")
        .filter(Boolean);

    if (parts.length < 2) {
        throw new Error("URL de GitHub inválida.");
    }

    return {
        owner: parts[0],
        repo: parts[1]
    };
}

async function getRepositoryData(githubUrl) {
    const { owner, repo } = parseGitHubUrl(githubUrl);
    console.log(owner, repo);
    const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}`
    );

    const data = await response.json();
    console.log(data);

    if (!response.ok) {
        throw new Error(data.message);
    }

    return data;
}

async function loadRepositories() {
    const type = document.getElementById("bot-type").value;
    const repoSelect = document.getElementById("repo-select");

    repoSelect.innerHTML = "";
    repoSelect.add(new Option("Cargando repositorios...", ""));

    if (!repositories[type] || repositories[type].length === 0) {
        repoSelect.innerHTML = "";
        repoSelect.add(new Option("No hay repositorios", ""));
        return;
    }

    repoSelect.innerHTML = "";
    repoSelect.add(new Option("Selecciona un repositorio", ""));

    for (const repository of repositories[type]) {

        try {
            console.log("Consultando:", repository.github);
            const repo = await getRepositoryData(repository.github);
            console.log("GitHub respondió:", repo);
            repoSelect.add(
                new Option(repo.full_name, repository.github)
            );

        } catch (error) {
            console.error(error);
            repoSelect.add(
                new Option(`❌ ${error.message}`, "")
            );
        }
    }
}

async function updateRepository() {
    const github = document.getElementById("repo-select").value;

    if (!github) {
        document
            .getElementById("repository-card")
            ?.classList.add("hidden");

        document
            .getElementById("repository-view")
            ?.classList.add("hidden");

        return;
    }

    try {
        currentRepository = await analyzeRepository(github);
        renderRepositoryCard();

        document
            .getElementById("repository-view")
            .classList.remove("hidden");

        showRepoTab("readme");

    } catch (error) {
        console.error(error);

        alert(error.message);
    }
}

async function analyzeRepository(githubUrl) {
    const repository = await getRepositoryData(githubUrl);

    const owner = repository.owner.login;
    const repo = repository.name;
    const branch = repository.default_branch;

    const [
        readme,
        packageJson,
        tree,
        commits
    ] = await Promise.all([

        loadReadme(owner, repo, branch),
        loadPackage(owner, repo, branch),
        loadTree(owner, repo, branch),
        loadLastCommit(owner, repo)
    ]);

    return {
        owner,
        repo,
        repository,
        readme,
        package: packageJson,
        tree,

        warnings: detectWarnings(tree),

        dependencies: packageJson
            ? Object.keys(packageJson.dependencies || {})
            : [],

        devDependencies: packageJson
            ? Object.keys(packageJson.devDependencies || {})
            : [],

        scripts: packageJson?.scripts || {},

        lastCommit: commits
    };
}

async function loadReadme(owner, repo, branch){
    try{
        const response = await fetch(
`https://raw.githubusercontent.com/${owner}/${repo}/${branch}/README.md`
        );
        if(!response.ok) return null;

        return await response.text();
    }catch{
        return null;
    }
}

async function loadPackage(owner, repo, branch){
    try{
        const response = await fetch(
`https://raw.githubusercontent.com/${owner}/${repo}/${branch}/package.json`
        );

        if(!response.ok) return null;

        return await response.json();
    }catch{
        return null;
    }
}

async function loadTree(owner, repo, branch){
    try{
        const response = await fetch(
`https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`
        );

        if(!response.ok) return [];

        const data = await response.json();

        return data.tree || [];
    }catch{
        return [];
    }
}

async function loadLastCommit(owner, repo){
    try{
        const response = await fetch(
`https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`
        );

        if(!response.ok) return null;

        const commits = await response.json();

        return commits[0];
    }catch{
        return null;
    }
}

function detectWarnings(tree){
    const files = tree.map(file=>file.path);
    const warnings=[];

    if(files.includes(".env"))
        warnings.push("🔑 Utiliza variables de entorno.");

    if(files.includes(".env.example"))
        warnings.push("📄 Incluye un archivo .env.example.");

    if(files.includes("docker-compose.yml"))
        warnings.push("🐳 Compatible con Docker.");

    if(files.includes("pnpm-lock.yaml"))
        warnings.push("📦 Utiliza PNPM.");

    if(files.includes("yarn.lock"))
        warnings.push("🧶 Utiliza Yarn.");

    if(files.includes("bun.lockb"))
        warnings.push("🥟 Utiliza Bun.");

    if(files.includes("requirements.txt"))
        warnings.push("🐍 Proyecto Python.");

    if(files.includes("Cargo.toml"))
        warnings.push("🦀 Proyecto Rust.");

    if(files.includes("go.mod"))
        warnings.push("🐹 Proyecto Go.");

    if(files.includes("pm2.config.js"))
        warnings.push("⚙ Compatible con PM2.");

    return warnings;
}

function renderRepositoryCard(){
    const repo=currentRepository.repository;

    document.getElementById("repository-card")
        .classList.remove("hidden");

    document.getElementById("repo-avatar").src =
        repo.owner.avatar_url;

    document.getElementById("repo-name").textContent =
        repo.name;

    document.getElementById("repo-owner").textContent =
        repo.full_name;

    document.getElementById("repo-description").textContent =
        repo.description || "Sin descripción.";

    document.getElementById("repo-stars").textContent =
        repo.stargazers_count;

    document.getElementById("repo-forks").textContent =
        repo.forks_count;

    document.getElementById("repo-issues").textContent =
        repo.open_issues_count;

    document.getElementById("repo-watchers").textContent =
        repo.watchers_count;

    document.getElementById("repo-license").textContent =
        repo.license?.name || "Sin licencia";

    document.getElementById("repo-updated").textContent =
        new Date(repo.updated_at).toLocaleString();

    document.getElementById("repo-github").href =
        repo.html_url;

    document.getElementById("download-zip").href =
        `${repo.html_url}/archive/refs/heads/${repo.default_branch}.zip`;

    document.getElementById("copy-clone-btn").onclick = () => {
        navigator.clipboard.writeText(
            `git clone ${repo.clone_url}`
        );
    };
}

function getFileIcon(path, type) {
    if (type === "tree") return "📁";

    const name = path.toLowerCase();

    // GitHub
    if (name === ".github") return "🐙";

    // Configuración
    if (name === "package.json") return "📦";
    if (name === "package-lock.json") return "🔒";
    if (name === "yarn.lock") return "🧶";
    if (name === "pnpm-lock.yaml") return "📌";
    if (name === ".env") return "🔑";
    if (name === ".gitignore") return "🙈";
    if (name === ".gitattributes") return "🐙";
    if (name === "dockerfile") return "🐳";
    if (name === "docker-compose.yml") return "🐳";
    if (name === "tsconfig.json") return "🔷";
    if (name === "eslint.config.js") return "🧹";
    if (name === ".eslintrc") return "🧹";
    if (name === "prettier.config.js") return "✨";

    // Documentación
    if (name.startsWith("readme")) return "📖";
    if (name.startsWith("license")) return "⚖️";
    if (name.startsWith("changelog")) return "📝";
    if (name.startsWith("contributing")) return "🤝";

    // JavaScript / TypeScript
    if (name.endsWith(".js")) return "🟨";
    if (name.endsWith(".mjs")) return "🟨";
    if (name.endsWith(".cjs")) return "🟨";
    if (name.endsWith(".ts")) return "🔷";

    // Web
    if (name.endsWith(".html")) return "🌐";
    if (name.endsWith(".css")) return "🎨";
    if (name.endsWith(".scss")) return "🎨";

    // JSON / YAML
    if (name.endsWith(".json")) return "📋";
    if (name.endsWith(".yaml")) return "⚙️";
    if (name.endsWith(".yml")) return "⚙️";

    // Imágenes
    if (name.endsWith(".png")) return "🖼️";
    if (name.endsWith(".jpg")) return "🖼️";
    if (name.endsWith(".jpeg")) return "🖼️";
    if (name.endsWith(".gif")) return "🖼️";
    if (name.endsWith(".svg")) return "🎭";
    if (name.endsWith(".webp")) return "🖼️";

    // Audio
    if (name.endsWith(".mp3")) return "🎵";
    if (name.endsWith(".wav")) return "🎵";

    // Video
    if (name.endsWith(".mp4")) return "🎬";
    if (name.endsWith(".mov")) return "🎬";

    // Archivos comprimidos
    if (name.endsWith(".zip")) return "🗜️";
    if (name.endsWith(".rar")) return "🗜️";
    if (name.endsWith(".7z")) return "🗜️";

    // Scripts
    if (name.endsWith(".sh")) return "🐧";
    if (name.endsWith(".bat")) return "💻";

    // Python
    if (name.endsWith(".py")) return "🐍";

    // PHP
    if (name.endsWith(".php")) return "🐘";

    // Java
    if (name.endsWith(".java")) return "☕";

    // C/C++
    if (name.endsWith(".c")) return "⚙️";
    if (name.endsWith(".cpp")) return "⚙️";
    if (name.endsWith(".h")) return "📐";

    // Markdown
    if (name.endsWith(".md")) return "📖";

    return "📄";
}

function getFileType(path, type){
    if(type==="tree") return "Carpeta";

    const file = path.toLowerCase();

    if(file==="package.json") return "Node.js";
    if(file==="package-lock.json") return "Dependencias";

    if(file.startsWith("readme")) return "Markdown";
    if(file.startsWith("license")) return "Licencia";

    if(file.endsWith(".js")) return "JavaScript";
    if(file.endsWith(".ts")) return "TypeScript";
    if(file.endsWith(".json")) return "JSON";
    if(file.endsWith(".html")) return "HTML";
    if(file.endsWith(".css")) return "CSS";
    if(file.endsWith(".scss")) return "SCSS";
    if(file.endsWith(".md")) return "Markdown";
    if(file.endsWith(".png")) return "Imagen";
    if(file.endsWith(".jpg")) return "Imagen";
    if(file.endsWith(".jpeg")) return "Imagen";
    if(file.endsWith(".gif")) return "Imagen";
    if(file.endsWith(".svg")) return "SVG";
    if(file.endsWith(".mp3")) return "Audio";
    if(file.endsWith(".mp4")) return "Video";
    if(file.endsWith(".zip")) return "ZIP";
    if(file.endsWith(".rar")) return "RAR";
    if(file.endsWith(".py")) return "Python";
    if(file.endsWith(".php")) return "PHP";
    if(file.endsWith(".java")) return "Java";
    if(file.endsWith(".yml")) return "YAML";
    if(file.endsWith(".yaml")) return "YAML";

    return "Archivo";
}

function formatFileSize(bytes){
    if(bytes < 1024) return `${bytes} B`;

    if(bytes < 1024 * 1024)
        return `${(bytes/1024).toFixed(1)} KB`;

    return `${(bytes/1024/1024).toFixed(1)} MB`;
}

async function openRepositoryFile(path){
    const owner =
        currentRepository.owner;

    const repo =
        currentRepository.repo;

    const branch =
        currentRepository.repository.default_branch;

    const response = await fetch(
`https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`
    );

    if(!response.ok){

        alert("No se pudo abrir el archivo.");

        return;

    }

    const code =
        await response.text();

    showCodeViewer(path, code);
}

function showCodeViewer(name, code){
    document
        .getElementById("code-viewer")
        .classList
        .remove("hidden");

    document
        .getElementById("code-title")
        .textContent =
        name;

    const codeElement = document.getElementById("code-content");
    codeElement.textContent = code;
    hljs.highlightElement(codeElement);
}

function closeCodeViewer(){
    document
        .getElementById("code-viewer")
        .classList
        .add("hidden");
}

function showRepoTab(tab) {
    if (!currentRepository) return;

    const container = document.getElementById("repository-content");

    switch (tab) {
        case "readme":
            container.innerHTML = `
                <div class="prose prose-invert max-w-none">
                    ${marked.parse(currentRepository.readme || "# README no encontrado")}
                </div>
            `;
            break;

        case "install":
            container.innerHTML = `
<pre class="bg-gray-900 rounded-xl p-5 overflow-auto">
git clone ${currentRepository.repository.clone_url}

cd ${currentRepository.repository.name}

npm install

npm start
</pre>
            `;
            break;

        case "dependencies":
            container.innerHTML =
                currentRepository.dependencies.length
                    ? currentRepository.dependencies.map(dep =>
                        `<span class="inline-block bg-cyan-700 rounded-lg px-3 py-2 mr-2 mb-2">${dep}</span>`
                    ).join("")
                    : "No se encontraron dependencias.";
            break;

        case "files":
          let html = `
<h2 class="text-2xl font-bold mb-6 text-cyan-400">📂 Árbol de archivos</h2>
<div class="bg-gray-900 rounded-xl overflow-hidden border border-gray-700">
  <div class="grid grid-cols-12 bg-gray-800 px-4 py-3 font-bold text-cyan-300">
  <div class="col-span-7">📁 Nombre</div>
  <div class="col-span-3">📄 Tipo</div>
  <div class="col-span-2 text-right">📏 Tamaño</div>
</div>
          `;

          currentRepository.tree.forEach(file => {

              html += `
<div class="grid grid-cols-12 px-4 py-2 border-b border-gray-800 hover:bg-gray-800 transition">
  <div class="col-span-7 truncate">
    <div class="cursor-pointer hover:text-cyan-400 transition" onclick="openRepositoryFile('${file.path}')">
      ${getFileIcon(file.path, file.type)}
      ${file.path}
    </div>
  </div>

  <div class="col-span-3 text-gray-400">
    ${getFileType(file.path, file.type)}
  </div>

  <div class="col-span-2 text-right text-gray-500">
    ${file.type === "blob"
    ? formatFileSize(file.size || 0)
    : "—"}
  </div>
</div>
              `;
          });

          html += "</div>";
          container.innerHTML = html;

          break;

        case "info":
            const repo = currentRepository.repository;

            container.innerHTML = `
<h2 class="text-2xl font-bold mb-6 text-cyan-400">
📊 Información del repositorio
</h2>

<div class="grid md:grid-cols-2 gap-5">

<div class="bg-gray-900 rounded-xl p-4">
<b>📦 Repositorio</b><br>
${repo.full_name}
</div>

<div class="bg-gray-900 rounded-xl p-4">
<b>⭐ Stars</b><br>
${repo.stargazers_count}
</div>

<div class="bg-gray-900 rounded-xl p-4">
<b>🍴 Forks</b><br>
${repo.forks_count}
</div>

<div class="bg-gray-900 rounded-xl p-4">
<b>👀 Watchers</b><br>
${repo.watchers_count}
</div>

<div class="bg-gray-900 rounded-xl p-4">
<b>🐞 Issues</b><br>
${repo.open_issues_count}
</div>

<div class="bg-gray-900 rounded-xl p-4">
<b>📄 Licencia</b><br>
${repo.license?.name ?? "Sin licencia"}
</div>

<div class="bg-gray-900 rounded-xl p-4 md:col-span-2">
<b>🕒 Última actualización</b><br>
${new Date(repo.updated_at).toLocaleString()}
</div>

</div>
            `;
            break;

        case "warnings":
            container.innerHTML =
                currentRepository.warnings.length
                    ? currentRepository.warnings.map(w =>
                        `<div class="bg-yellow-700 rounded-xl p-3 mb-2">⚠ ${w}</div>`
                    ).join("")
                    : "✅ No se detectaron avisos.";
            break;
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
        <button onclick="deleteBot(${bot.id})" class="flex-1 py-3 rounded-2xl bg-red-600 hover:bg-red-700">Eliminar</button>
      </div>
    </div>
  `).join('');
}

async function deleteBot(id) {

    if (!confirm("¿Eliminar este bot?")) return;

    const { error } = await supabase
        .from("bots")
        .delete()
        .eq("id", id)
        .eq("user_id", currentUser.id);

    if (error) {
        console.error(error);
        return alert("No se pudo eliminar el bot.");
    }

    await loadBots();

    logConsole("🗑️ Bot eliminado correctamente.");
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
        logConsole(`/> ${command}

Comandos disponibles:

help        - Muestra esta ayuda
bots        - Bots activos
clear, cls  - Limpia la consola
date        - Fecha y hora
time        - Hora actual`);
        logConsole("/>");
        break;

    case "bots":
        logConsole(`/> ${command}
            
Bots activos: ${bots.length}`);
        logConsole("/>");
        break;

    case "date":
        logConsole(`/> ${command}
            
Fecha y hora actual:`);
        logConsole(new Date().toLocaleString());
        logConsole("/>");
        break;

    case "time":
        logConsole(`/> ${command}

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
window.loadRepositories = loadRepositories;
window.updateRepository = updateRepository;
window.openRepositoryFile = openRepositoryFile;
window.closeCodeViewer = closeCodeViewer;
window.deleteBot = deleteBot;
window.deployBot = deployBot;
window.toggleBot = toggleBot;
window.showRepoTab = showRepoTab;
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

    loadRepositories();

    logConsole("BotHost Console v1.0");
    logConsole("Escribe 'help' para ver los comandos.");
    logConsole("/>");
};