import { supabase } from "../supabase.js";

import {
    resetUI,
    getCurrentUser,
    setCurrentUser
} from "../auth/index.js";

import { loadBots } from "../bots/index.js";

import { loadRepositories } from "../repository/index.js";

import { registerConsoleEvents, logConsole } from "../console/index.js";

import { showSection } from "./router.js";

export async function bootstrap() {
    // window.onload = async () => {
    
    console.log("Entró a bootstrap");
    alert("7. Entró a bootstrap");
    
    const {
        data: { session }
    } = await supabase.auth.getSession();

    console.log("Session obtenida");
    alert("8. Session obtenida");

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
};