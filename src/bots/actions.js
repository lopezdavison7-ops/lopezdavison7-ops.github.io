import { getCurrentUser } from "../auth/session.js";
import { supabase } from "../supabase.js";
import { loadBots } from "./bots.js";
import { getBots } from "./state.js";
import { showSection } from "../core/router.js";
import { logConsole } from "../console/logger.js";
import { consoleBox } from "../console/terminal.js";

export async function deleteBot(id) {
    if (!confirm("¿Eliminar este bot?")) return;

    const { error } = await supabase
        .from("bots")
        .delete()
        .eq("id", id)
        .eq("user_id", getCurrentUser().id);

    if (error) {
        console.error(error);
        return alert("No se pudo eliminar el bot.");
    }

    await loadBots();

    logConsole("🗑️ Bot eliminado correctamente.");
}

export async function toggleBot(id) {
    const bot = getBots().find(b => b.id === id);

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
        .eq("user_id", getCurrentUser().id);

    if (error) {
        console.error(error);
        return alert("No se pudo actualizar el bot.");
    }

    await loadBots();
}

export function openConsole(id) {
    showSection("console");

    const bot = getBots().find(b => b.id === id);

    if (!bot) return;

    consoleBox.innerHTML = "";

    logConsole(`Bot: ${bot.name}`);
    logConsole(`Estado: ${bot.status}`);
    logConsole("");

    (bot.logs || []).forEach(log => logConsole(log));
}