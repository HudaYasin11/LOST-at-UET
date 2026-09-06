import { supabase } from "./config.js";

// ========================================
// SIGN UP
// ========================================

export async function signup(name, email, password) {
    try {
        console.log('📝 Signing up:', { name, email });
        
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
            console.error('❌ Signup error from Supabase:', error);
            throw new Error(error.message);
        }

        console.log('✅ Signup response:', data);

        if (data.user && !data.session) {
            console.log('📧 Email confirmation required. Check your email.');
            return { 
                user: data.user, 
                session: null,
                requiresConfirmation: true 
            };
        }

        if (data.user && data.session) {
            console.log('📝 Creating profile for user:', data.user.id);
            
            try {
                const { error: profileError } = await supabase
                    .from("profiles")
                    .insert({
                        id: data.user.id,
                        name: name,
                        xp: 0,
                        level: 1
                    });

                if (profileError) {
                    console.error('⚠️ Profile creation error:', profileError);
                } else {
                    console.log('✅ Profile created successfully');
                }
            } catch (profileErr) {
                console.error('⚠️ Profile creation exception:', profileErr);
            }
            
            localStorage.setItem('access_token', data.session.access_token);
            if (data.session.refresh_token) {
                localStorage.setItem('refresh_token', data.session.refresh_token);
            }
            console.log('✅ Session stored');
        }

        return data;
    } catch (error) {
        console.error('❌ Signup function error:', error);
        throw error;
    }
}

// ========================================
// LOGIN
// ========================================

export async function login(email, password) {
    try {
        console.log('Attempting login for:', email);
        
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            console.error('Supabase login error:', error);
            throw new Error(error.message);
        }

        console.log('Login successful!', data);

        if (data.session) {
            localStorage.setItem('access_token', data.session.access_token);
            if (data.session.refresh_token) {
                localStorage.setItem('refresh_token', data.session.refresh_token);
            }
            console.log('✅ Token stored successfully');
        }

        return data;
    } catch (error) {
        console.error('Login function error:', error);
        throw error;
    }
}

// ========================================
// LOGOUT
// ========================================

export async function logout() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        console.log('Logout successful');
    } catch (error) {
        console.error('Logout error:', error);
        throw error;
    }
}

// ========================================
// GET CURRENT USER - FIXED with discoveries
// ========================================

export async function getCurrentUser() {
    try {
        const {
            data: { user },
            error
        } = await supabase.auth.getUser();

        if (error) {
            console.error('Get user error:', error);
            return { success: false, error: error.message, data: null };
        }

        if (!user) {
            return { success: false, error: 'No user logged in', data: null };
        }

        // Get profile data
        const profile = await getCurrentProfile();
        
        // ✅ Get discoveries from the discoveries table
        const discoveries = await getUserDiscoveries(user.id);
        
        // ✅ Get completed quests
        const completedQuests = await getUserCompletedQuests(user.id);
        
        return { 
            success: true, 
            data: {
                id: user.id,
                email: user.email,
                name: user.user_metadata?.name || profile?.name || 'Explorer',
                xp: profile?.xp || 0,
                level: profile?.level || 1,
                discoveries: discoveries || [],
                completedQuests: completedQuests || [],
                ...profile
            } 
        };
    } catch (error) {
        console.error('Get user error:', error);
        return { success: false, error: error.message, data: null };
    }
}

// ========================================
// ✅ GET USER DISCOVERIES
// ========================================

export async function getUserDiscoveries(userId) {
    try {
        const { data, error } = await supabase
            .from("discoveries")
            .select("location_id")
            .eq("user_id", userId);

        if (error) {
            console.error('Get discoveries error:', error);
            return [];
        }

        return data.map(d => d.location_id);
    } catch (error) {
        console.error('Get discoveries error:', error);
        return [];
    }
}

// ========================================
// ✅ GET USER COMPLETED QUESTS
// ========================================

export async function getUserCompletedQuests(userId) {
    try {
        const { data, error } = await supabase
            .from("quest_completions")
            .select("quest_id")
            .eq("user_id", userId);

        if (error) {
            console.error('Get completed quests error:', error);
            return [];
        }

        return data.map(q => q.quest_id);
    } catch (error) {
        console.error('Get completed quests error:', error);
        return [];
    }
}

// ========================================
// GET SESSION
// ========================================

export async function getSession() {
    try {
        const {
            data: { session },
            error
        } = await supabase.auth.getSession();
        if (error) throw error;
        return session;
    } catch (error) {
        console.error('Get session error:', error);
        return null;
    }
}

// ========================================
// GET CURRENT USER PROFILE
// ========================================

export async function getCurrentProfile() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data, error } = await supabase
            .from("profiles")
            .select("id, name, xp, level, created_at")
            .eq("id", user.id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                console.log('📝 Profile not found, creating one...');
                const { error: insertError } = await supabase
                    .from("profiles")
                    .insert({
                        id: user.id,
                        name: user.user_metadata?.name || 'Explorer',
                        xp: 0,
                        level: 1
                    });

                if (insertError) {
                    console.error('❌ Failed to create profile:', insertError);
                    return null;
                }

                const { data: newProfile, error: fetchError } = await supabase
                    .from("profiles")
                    .select("id, name, xp, level, created_at")
                    .eq("id", user.id)
                    .single();

                if (fetchError) {
                    console.error('❌ Failed to fetch new profile:', fetchError);
                    return null;
                }

                return newProfile;
            }
            
            console.error('Get profile error:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Get profile error:', error);
        return null;
    }
}

// ========================================
// ALIASES FOR BACKWARD COMPATIBILITY
// ========================================

export const signUp = signup;
export const signIn = login;
export const signOut = logout;

// ========================================
// GET FULL USER DATA (User + Profile)
// ========================================

export async function getUserWithProfile() {
    try {
        const user = await getCurrentUser();
        if (!user) return null;
        return user;
    } catch (error) {
        console.error('Error getting user with profile:', error);
        return null;
    }
}

// ========================================
// GET ACCESS TOKEN
// ========================================

export function getAccessToken() {
    return localStorage.getItem('access_token');
}

// ========================================
// CHECK IF USER IS AUTHENTICATED
// ========================================

export async function isAuthenticated() {
    try {
        const result = await getCurrentUser();
        return result.success;
    } catch {
        return false;
    }
}

// ========================================
// DEFAULT EXPORT
// ========================================

export default {
    signup,
    login,
    logout,
    signUp,
    signIn,
    signOut,
    getCurrentUser,
    getSession,
    getCurrentProfile,
    getUserWithProfile,
    getAccessToken,
    isAuthenticated,
    getUserDiscoveries,
    getUserCompletedQuests
};