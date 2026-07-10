import { getCurrentUser } from "../auth/session.js";
import { supabase } from "../supabase.js";
import { getBots, setBots } from "./state.js";

export async function loadBots() {

    if (!getCurrentUser()) {
        clearBots();
        renderBots();
        return;
    }

    const { data, error } = await supabase
        .from("bots")
        .select("*")
        .eq("user_id", getCurrentUser().id)
        .order("created_at", { ascending: true });

    if (error) {
        console.error(error);
        return alert("No se pudieron cargar los bots.");
    }

    setBots(data);

    renderBots();
}