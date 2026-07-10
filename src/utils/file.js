export function getFileIcon(path, type) {
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
    if (name.endsWith(".js")) return "⚡";
    if (name.endsWith(".mjs")) return "⚡";
    if (name.endsWith(".cjs")) return "⚡";
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

export function getFileType(path, type){
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

export function formatFileSize(bytes){
    if(bytes < 1024) return `${bytes} B`;

    if(bytes < 1024 * 1024)
        return `${(bytes/1024).toFixed(1)} KB`;

    return `${(bytes/1024/1024).toFixed(1)} MB`;
}