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
    const bot = bots.find(b => b.id === id);

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

    const bot = bots.find(b => b.id === id);

    if (!bot) return;

    consoleBox.innerHTML = "";

    logConsole(`Bot: ${bot.name}`);
    logConsole(`Estado: ${bot.status}`);
    logConsole("");

    (bot.logs || []).forEach(log => logConsole(log));
}