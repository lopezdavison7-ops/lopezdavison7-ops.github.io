import { supabase } from "../supabase.js";

export function showLogin() {
  document.getElementById('login-form').classList.remove('hidden');
  document.getElementById('register-form').classList.add('hidden');
}

export function showRegister() {
  document.getElementById('login-form').classList.add('hidden');
  document.getElementById('register-form').classList.remove('hidden');
}

export async function register() {
    const username = document.getElementById("reg-user").value.trim();
    const email = document.getElementById("reg-email").value.trim();
    const pass = document.getElementById("reg-pass").value.trim();

    if (!username || !email || !pass) {
        return alert("Completa todos los campos.");
    }

    // Crear usuario en Authentication
    const { data, error: authError } = await supabase.auth.signUp({
        email,
        password: pass
    });

    if (authError) {
        console.error(authError);
        return alert(authError.message);
    }

    const user = data.user;

    if (!user) {
        return alert("No se pudo crear la cuenta.");
    }

    // Guardar perfil
    const { error: profileError } = await supabase
        .from("user_data")
        .insert({
            id: user.id,
            username,
            email
        });

    if (profileError) {
        console.error(profileError);
        return alert(profileError.message);
    }

    alert("✅ Cuenta creada correctamente.");

    showLogin();
}

export async function deleteAccount() {

    if (!getCurrentUser()) {
        return alert("No hay una sesión iniciada.");
    }

    if (!confirm("¿Seguro que deseas eliminar tu cuenta? Esta acción no se puede deshacer.")) {
        return;
    }

    // Eliminar bots
    const { error: botsError } = await supabase
        .from("bots")
        .delete()
        .eq("user_id", getCurrentUser().id);

    if (botsError) {
        console.error(botsError);
        return alert("No se pudieron eliminar los bots.");
    }

    // Eliminar perfil
    const { error: profileError } = await supabase
        .from("user_data")
        .delete()
        .eq("id", getCurrentUser().id);

    if (profileError) {
        console.error(profileError);
        return alert("No se pudo eliminar el perfil.");
    }

    // Cerrar sesión
    await supabase.auth.signOut();

    alert("✅ Cuenta eliminada.");

    resetUI();
}
    
export async function login() {

    let login = document.getElementById("login-user").value.trim();
    const pass = document.getElementById("login-pass").value.trim();

    if (!login || !pass) {
        return alert("Ingresa tu usuario o correo.");
    }

    // Si escribió un usuario buscar su correo
    if (!login.includes("@")) {

        const { data: profile, error } = await supabase
            .from("user_data")
            .select("email")
            .eq("username", login)
            .single();

        if (error || !profile) {
            return alert("Usuario no encontrado.");
        }

        login = profile.email;
    }

    // Login Auth
    const { error: authError } =
        await supabase.auth.signInWithPassword({
            email: login,
            password: pass
        });

    if (authError) {
        console.error(authError);
        return alert(authError.message);
    }

    // Obtener usuario autenticado
    const {
        data: { user }
    } = await supabase.auth.getUser();

    // Obtener perfil
    const { data: profile, error: profileError } =
        await supabase
            .from("user_data")
            .select("username,email")
            .eq("id", user.id)
            .single();

    if (profileError) {
        console.error(profileError);
        return alert("No se pudo cargar el perfil.");
    }

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
}
    
export async function logout() {

    if (!confirm("¿Cerrar sesión?")) return;

    const { error } = await supabase.auth.signOut();

    if (error) {
        console.error(error);
        return alert("No se pudo cerrar la sesión.");
    }

    resetUI();
}

export function resetUI() {
    clearCurrentUser();
    bots = [];

    renderBots();

    document.getElementById("dashboard").classList.add("hidden");
    document.getElementById("auth-screen").classList.remove("hidden");

    document.getElementById("nav-menu").classList.add("hidden");
    document.getElementById("user-info").classList.add("hidden");
    document.getElementById("btn-logout").classList.add("hidden");

    document.getElementById("login-user").value = "";
    document.getElementById("login-pass").value = "";

    document.getElementById("reg-user").value = "";
    document.getElementById("reg-email").value = "";
    document.getElementById("reg-pass").value = "";

    showLogin();
}