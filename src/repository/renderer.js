import { getCurrentRepository } from "./state.js";
import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";

export function renderRepositoryCard(){
    const repo=getCurrentRepository().repository;

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

export function showRepoTab(tab) {
    // Ocultar el visor de código al cambiar de pestaña
    closeCodeViewer();

    if (!getCurrentRepository()) return;

    const container = document.getElementById("repository-content");

    switch (tab) {
        case "readme":
            container.innerHTML = `
                <div class="prose prose-invert max-w-none">
                    ${marked.parse(getCurrentRepository().readme || "# README no encontrado")}
                </div>
            `;
            break;

        case "install":
            container.innerHTML = `
<pre class="bg-gray-900 rounded-xl p-5 overflow-auto">
git clone ${getCurrentRepository().repository.clone_url}

cd ${getCurrentRepository().repository.name}

npm install

npm start
</pre>
            `;
            break;

        case "dependencies":
            container.innerHTML =
                getCurrentRepository().dependencies.length
                    ? getCurrentRepository().dependencies.map(dep =>
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

          getCurrentRepository().tree.forEach(file => {

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
            const repo = getCurrentRepository().repository;

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
                getCurrentRepository().warnings.length
                    ? getCurrentRepository().warnings.map(w =>
                        `<div class="bg-yellow-700 rounded-xl p-3 mb-2">⚠ ${w}</div>`
                    ).join("")
                    : "✅ No se detectaron avisos.";
            break;
    }
}