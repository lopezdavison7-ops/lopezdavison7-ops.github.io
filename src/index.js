// (El script es el mismo que la versión anterior, se mantengo funcional)

import { supabase } from "./supabase.js";

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

alert("index.js cargado");

startApplication();

alert|("después de startApplication");