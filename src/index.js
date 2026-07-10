// (El script es el mismo que la versión anterior, se mantengo funcional)

import { supabase } from "./supabase.js";
import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";

import {
    getFileIcon,
    getFileType,
    formatFileSize
} from "./utils/index.js";

import {
    showLogin,
    showRegister,
    register,
    login,
    logout,
    deleteAccount,
    resetUI,
    getCurrentUser,
    setCurrentUser,
    clearCurrentUser
} from "./auth/index.js";

import {
    loadRepositories,
    updateRepository,
    openRepositoryFile,
    closeCodeViewer,
    showRepoTab
} from "./repository/index.js";

import {
    loadBots,
    renderBots,
    deployBot,
    deleteBot,
    toggleBot,
    openConsole,
    getBots,
    setBots
} from "./bots/index.js";

import {
    logConsole,
    runCommand,
    sendCommand,
    registerConsoleEvents
} from "./console/index.js";

import { startApplication } from "./core/index.js";


    // Auth
    window.showLogin = auth.showLogin;
    window.showRegister = auth.showRegister;
    window.register = auth.register;
    window.login = auth.login;
    window.logout = auth.logout;
    window.deleteAccount = auth.deleteAccount;

    // Router
    window.showSection = showSection;

    // Repository
    window.loadRepositories = repository.loadRepositories;
    window.updateRepository = repository.updateRepository;
    window.openRepositoryFile = repository.openRepositoryFile;
    window.closeCodeViewer = repository.closeCodeViewer;
    window.showRepoTab = repository.showRepoTab;

    // Bots
    window.deleteBot = bots.deleteBot;
    window.deployBot = bots.deployBot;
    window.toggleBot = bots.toggleBot;
    window.openConsole = bots.openConsole;

    // Console
    window.sendCommand = terminal.sendCommand;
    window.runCommand = terminal.runCommand;

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
    
        setCurrentUser({
            id: user.id,
            username: profile.username,
            email: profile.email
        });
    
        document.getElementById("nav-menu").classList.remove("hidden");
        document.getElementById("auth-screen").classList.add("hidden");
        document.getElementById("dashboard").classList.remove("hidden");
    
        document.getElementById("welcome-name").textContent = getCurrentUser().username;
        document.getElementById("username-display").textContent = getCurrentUser().username;
    
        document.getElementById("user-info").classList.remove("hidden");
        document.getElementById("btn-logout").classList.remove("hidden");
    
        await loadBots();
    
        showSection("bots");
    
        loadRepositories();
    
        registerConsoleEvents();
    
        logConsole("BotHost Console v1.0");
        logConsole("Escribe 'help' para ver los comandos.");
        logConsole("/>");
    }

startApplication();