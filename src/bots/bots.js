export async function loadBots() {

    if (!getCurrentUser()) {
        bots = [];
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

    bots = data ?? [];

    renderBots();
}