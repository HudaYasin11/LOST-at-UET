// ========================================
// DATA SERVICE - Bridge between UI and API
// ========================================

import * as api from './api.js';
import { questsData } from './questData.js';
import { supabase } from './config.js';

// ========================================
// STATE
// ========================================

let appState = {
    user: null,
    locations: [],
    quests: [],
    loading: false,
    error: null,
    isAuthenticated: false
};

const listeners = [];

// ========================================
// NOTIFY LISTENERS
// ========================================

function notifyListeners() {
    console.log('🔄 Notifying listeners...');
    listeners.forEach(listener => {
        try {
            listener(appState);
        } catch (e) {
            console.error('Listener error:', e);
        }
    });
}

export function subscribe(listener) {
    listeners.push(listener);
    console.log(`📡 Listener added. Total: ${listeners.length}`);
    return () => {
        const index = listeners.indexOf(listener);
        if (index > -1) listeners.splice(index, 1);
        console.log(`📡 Listener removed. Total: ${listeners.length}`);
    };
}

export function getState() {
    return appState;
}

// ========================================
// LOAD DATA FROM API
// ========================================

export async function loadGameData() {
    console.log('🔄 loadGameData: Starting...');
    appState.loading = true;
    appState.error = null;
    notifyListeners();
    
    try {
        const userResult = await api.getCurrentUser();
        console.log('📡 User result:', userResult);
        
        if (userResult.success) {
            // ✅ Get completed quests from database
            const completedQuests = await getUserCompletedQuests(userResult.data.id);
            userResult.data.completedQuests = completedQuests;
            
            appState.user = userResult.data;
            appState.isAuthenticated = true;
            console.log('✅ User authenticated. Discoveries:', appState.user?.discoveries?.length || 0);
            console.log('✅ Completed Quests from DB:', appState.user?.completedQuests || []);
        } else {
            console.warn('❌ Not authenticated:', userResult.error);
            appState.isAuthenticated = false;
            appState.loading = false;
            notifyListeners();
            return { success: false, error: userResult.error || 'Not authenticated' };
        }
        
        const locationsResult = await api.getLocations();
        if (locationsResult.success) {
            appState.locations = locationsResult.data || [];
            console.log('✅ Locations loaded:', appState.locations.length);
        } else {
            console.warn('⚠️ Failed to load locations:', locationsResult.error);
            appState.locations = [];
        }
        
        const questsResult = await api.getQuests();
        if (questsResult.success) {
            appState.quests = questsResult.data || [];
            console.log('✅ Quests loaded:', appState.quests.length);
        } else {
            console.warn('⚠️ Failed to load quests:', questsResult.error);
            appState.quests = [];
        }
        
        appState.loading = false;
        notifyListeners();
        console.log('✅ loadGameData: Complete!');
        return { success: true };
        
    } catch (error) {
        console.error('❌ loadGameData error:', error);
        appState.loading = false;
        appState.error = error.message;
        notifyListeners();
        return { success: false, error: error.message };
    }
}

// ========================================
// ✅ GET USER COMPLETED QUESTS FROM DB
// ========================================

export async function getUserCompletedQuests(userId) {
    try {
        const { data, error } = await supabase
            .from('quest_completions')
            .select('quest_id')
            .eq('user_id', userId);

        if (error) {
            console.error('❌ Error fetching completed quests:', error);
            return [];
        }

        const questIds = data.map(item => item.quest_id);
        console.log('✅ Fetched completed quests from DB:', questIds);
        return questIds;
    } catch (error) {
        console.error('❌ Error fetching completed quests:', error);
        return [];
    }
}

// ========================================
// ✅ SAVE COMPLETED QUEST TO DB
// ========================================

export async function saveCompletedQuestToDB(userId, questId) {
    try {
        // Check if already completed
        const { data: existing, error: checkError } = await supabase
            .from('quest_completions')
            .select('id')
            .eq('user_id', userId)
            .eq('quest_id', questId)
            .single();

        if (existing) {
            console.log('⚠️ Quest already completed in DB');
            return { success: true, alreadyExists: true };
        }

        // Insert new completion
        const { data, error } = await supabase
            .from('quest_completions')
            .insert({
                user_id: userId,
                quest_id: questId,
                completed_at: new Date().toISOString()
            })
            .select();

        if (error) {
            console.error('❌ Error saving quest completion:', error);
            return { success: false, error: error.message };
        }

        console.log('✅ Quest completion saved to DB:', questId);
        return { success: true, data: data };
    } catch (error) {
        console.error('❌ Error saving quest completion:', error);
        return { success: false, error: error.message };
    }
}

// ========================================
// REFRESH DATA
// ========================================

export async function refreshUserData() {
    console.log('🔄 Refreshing user data...');
    const result = await api.getCurrentUser();
    if (result.success) {
        // ✅ Get completed quests from database
        const completedQuests = await getUserCompletedQuests(result.data.id);
        result.data.completedQuests = completedQuests;
        
        appState.user = result.data;
        console.log('✅ User data refreshed. Discoveries:', appState.user?.discoveries?.length || 0);
        console.log('✅ Completed Quests from DB:', appState.user?.completedQuests || []);
        notifyListeners();
    } else {
        console.warn('⚠️ Failed to refresh user data:', result.error);
    }
    return result;
}

export async function refreshLocations() {
    console.log('🔄 Refreshing locations...');
    const result = await api.getLocations();
    if (result.success) {
        appState.locations = result.data;
        console.log('✅ Locations refreshed:', appState.locations.length);
        notifyListeners();
    } else {
        console.warn('⚠️ Failed to refresh locations:', result.error);
    }
    return result;
}

export async function refreshQuests() {
    console.log('🔄 Refreshing quests...');
    const result = await api.getQuests();
    if (result.success) {
        appState.quests = result.data;
        console.log('✅ Quests refreshed:', appState.quests.length);
        notifyListeners();
    } else {
        console.warn('⚠️ Failed to refresh quests:', result.error);
    }
    return result;
}

// ========================================
// ✅ COMPLETE QUEST - SAVES TO DB
// ========================================

export async function completeQuest(questId) {
    console.log(`🎯 Completing quest: ${questId}`);
    
    if (!appState.user) {
        return { success: false, error: 'No user logged in' };
    }
    
    const userId = appState.user.id;
    const completedQuests = appState.user.completedQuests || [];
    
    // Check if already completed
    if (completedQuests.includes(questId)) {
        console.log('⚠️ Quest already completed');
        return { success: false, error: 'Already completed' };
    }
    
    // ✅ Save to database FIRST
    const dbResult = await saveCompletedQuestToDB(userId, questId);
    
    if (!dbResult.success) {
        console.error('❌ Failed to save to database:', dbResult.error);
        // Still complete locally even if DB fails
    }
    
    // ✅ Update local state
    appState.user.completedQuests = [...completedQuests, questId];
    
    // Find quest to get XP
    const quest = appState.quests.find(q => q.id === questId);
    const xp = quest?.xp || 100;
    appState.user.xp = (appState.user.xp || 0) + xp;
    appState.user.level = Math.floor(appState.user.xp / 100) + 1;
    
    console.log(`✅ Quest completed! +${xp} XP`);
    console.log(`📊 Total XP: ${appState.user.xp}, Level: ${appState.user.level}`);
    console.log(`📋 Completed quests:`, appState.user.completedQuests);
    
    // ✅ Notify UI
    notifyListeners();
    
    return { success: true, data: { xp_awarded: xp, completedQuests: appState.user.completedQuests } };
}

// ========================================
// GAME ACTIONS
// ========================================

export async function unlockLocation(locationId) {
    console.log(`🔓 Unlocking location: ${locationId}`);
    
    try {
        const result = await api.unlockLocation(locationId);
        console.log('🔓 Unlock result:', result);
        
        if (!result.success) {
            return result;
        }
        
        console.log('🔄 Refreshing all data after unlock...');
        await refreshUserData();
        await refreshLocations();
        await refreshQuests();
        
        notifyListeners();
        return result;
    } catch (error) {
        console.error('❌ Unlock error:', error);
        return { success: false, error: error.message };
    }
}

export async function scanQR(qrCode) {
    const result = await api.scanQR(qrCode);
    if (result.success) {
        await refreshUserData();
        await refreshLocations();
        notifyListeners();
    }
    return result;
}

// ========================================
// HELPERS FOR UI
// ========================================

export function getLocationStatus(locationId) {
    if (!appState.user) return 'locked';
    const discoveries = appState.user.discoveries || [];
    return discoveries.includes(locationId) ? 'discovered' : 'locked';
}

export function getQuestProgress(questId) {
    if (!appState.user) return 0;
    const completedQuests = appState.user.completedQuests || [];
    return completedQuests.includes(questId) ? 100 : 0;
}

export function getTotalXP() {
    return appState.user?.xp || 0;
}

export function getLevel() {
    const xp = appState.user?.xp || 0;
    return Math.floor(xp / 100) + 1;
}

export function getTotalDiscoveries() {
    const discoveries = appState.user?.discoveries || [];
    return discoveries.length;
}

export function getTotalLocations() {
    return appState.locations.length || 0;
}

export function getCompletionPercentage() {
    const discovered = getTotalDiscoveries();
    const total = getTotalLocations();
    return total > 0 ? Math.round((discovered / total) * 100) : 0;
}

export function isAuthenticated() {
    return appState.isAuthenticated;
}

export async function getLeaderboard(limit = 10) {
    return await api.getLeaderboard(limit);
}

// ========================================
// EXPORT
// ========================================

export default {
    loadGameData,
    refreshUserData,
    refreshLocations,
    refreshQuests,
    unlockLocation,
    completeQuest,
    scanQR,
    getState,
    subscribe,
    getLocationStatus,
    getQuestProgress,
    getTotalXP,
    getLevel,
    getTotalDiscoveries,
    getTotalLocations,
    getCompletionPercentage,
    isAuthenticated,
    getLeaderboard,
    getUserCompletedQuests,
    saveCompletedQuestToDB
};