// ========================================
// DATA SERVICE - Bridge between UI and API
// ========================================

import * as api from './api.js';

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
            appState.user = userResult.data;
            appState.isAuthenticated = true;
            console.log('✅ User authenticated. Discoveries:', appState.user?.discoveries?.length || 0);
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
// REFRESH DATA - WITH NOTIFY
// ========================================

export async function refreshUserData() {
    console.log('🔄 Refreshing user data...');
    const result = await api.getCurrentUser();
    if (result.success) {
        appState.user = result.data;
        console.log('✅ User data refreshed. Discoveries:', appState.user?.discoveries?.length || 0);
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
        
        // ✅ CRITICAL: Refresh ALL data after unlock
        console.log('🔄 Refreshing all data after unlock...');
        await refreshUserData();
        await refreshLocations();
        await refreshQuests();
        
        // ✅ Force notify to update all subscribers
        notifyListeners();
        
        return result;
    } catch (error) {
        console.error('❌ Unlock error:', error);
        return { success: false, error: error.message };
    }
}

export async function completeQuest(questId) {
    const result = await api.completeQuest(questId);
    if (result.success) {
        await refreshUserData();
        await refreshQuests();
        notifyListeners();
    }
    return result;
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
    getLeaderboard
};