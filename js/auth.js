import { supabase } from "./config.js";

// ========================================
// SIGN UP
// ========================================

export async function signup(name, email, password) {
    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            data: {
                name: name
            }
        }
    });

    if (error) {
        throw new Error(error.message);
    }

    // Create profile if a session exists immediately
    if (data.user && data.session) {
        const { error: profileError } = await supabase
            .from("profiles")
            .insert({
                id: data.user.id,
                name: name
            });

        if (profileError) {
            throw new Error(profileError.message);
        }
    }

    return data;
}


// ========================================
// LOGIN
// ========================================

export async function login(email, password) {
    const { data, error } =
        await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

    if (error) {
        throw new Error(error.message);
    }

    return data;
}


// ========================================
// LOGOUT
// ========================================

export async function logout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
        throw new Error(error.message);
    }
}


// ========================================
// GET CURRENT USER
// ========================================

export async function getCurrentUser() {
    const {
        data: { user },
        error
    } = await supabase.auth.getUser();

    if (error) {
        throw new Error(error.message);
    }

    return user;
}


// ========================================
// GET SESSION
// ========================================

export async function getSession() {
    const {
        data: { session },
        error
    } = await supabase.auth.getSession();

    if (error) {
        throw new Error(error.message);
    }

    return session;
}
// ========================================
// GET CURRENT USER PROFILE
// ========================================

export async function getCurrentProfile() {

    const {
        data: { user }
    } = await supabase.auth.getUser();

    // No one is logged in
    if (!user) {
        return null;
    }

    const { data, error } = await supabase
        .from("profiles")
        .select("id, name, xp, level, created_at")
        .eq("id", user.id)
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}