import { getCurrentRepository } from "./state.js";

export async function openRepositoryFile(path){
    const owner =
        getCurrentRepository().owner;

    const repo =
        getCurrentRepository().repo;

    const branch =
        getCurrentRepository().repository.default_branch;

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

export function showCodeViewer(name, code){
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

export function closeCodeViewer() {
    const viewer = document.getElementById("code-viewer");
    if (!viewer) return;
    viewer.classList.add("hidden");
}