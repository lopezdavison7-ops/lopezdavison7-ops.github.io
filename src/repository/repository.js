import { repositories } from "../data/repositories.js";

export async function loadRepositories() {
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

export async function updateRepository() {
    closeCodeViewer();

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