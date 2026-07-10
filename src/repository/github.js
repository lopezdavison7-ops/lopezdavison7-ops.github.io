export function parseGitHubUrl(url) {
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

export async function getRepositoryData(githubUrl) {
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

export async function loadReadme(owner, repo, branch){
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

export async function loadPackage(owner, repo, branch){
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

export async function loadTree(owner, repo, branch){
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

export async function loadLastCommit(owner, repo){
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