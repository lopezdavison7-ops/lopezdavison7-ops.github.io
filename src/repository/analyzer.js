export function detectWarnings(tree){
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

export async function analyzeRepository(githubUrl) {
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