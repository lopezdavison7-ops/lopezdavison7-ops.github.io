import { getCurrentUser } from "../auth/session.js";
import { supabase } from "../supabase.js";
import { loadBots } from "./bots.js";

export async function deployBot() {
    if (!getCurrentUser()) {
        return alert("Debes iniciar sesión.");
    }

    const name = document.getElementById("bot-name").value.trim() || "NuevoBot";
    const type = document.getElementById("bot-type").value;

    const { error } = await supabase
        .from("bots")
        .insert({
            user_id: getCurrentUser().id,
            name,
            type,
            status: "✅ Online",
            logs: [
                `[${new Date().toLocaleTimeString()}] Bot ${name} desplegado`
            ]
        });

    if (error) {
        console.error(error);
        return alert("No se pudo crear el bot.");
    }

    await loadBots();

    alert(`🚀 Bot "${name}" desplegado correctamente.`);

    showSection("bots");
}