// ========================================
// API SERVICE - LOST@UET Backend Connection
// ========================================

import { API_BASE_URL } from './config.js';

// ========================================
// TOKEN MANAGEMENT
// ========================================

function getToken() {
    const token = localStorage.getItem('access_token');
    console.log('🔑 Token:', token ? `${token.substring(0, 20)}...` : 'No token found');
    return token;
}

function setToken(token) {
    localStorage.setItem('access_token', token);
}

function getRefreshToken() {
    return localStorage.getItem('refresh_token');
}

function setRefreshToken(token) {
    localStorage.setItem('refresh_token', token);
}

function removeTokens() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
}

// ========================================
// API REQUEST HELPER
// ========================================

async function apiRequest(endpoint, method = 'GET', data = null) {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`🌐 API Request: ${method} ${url}`);
    
    const publicEndpoints = ['/auth/login', '/auth/signup', '/locations', '/quests', '/users/leaderboard'];
    const isPublic = publicEndpoints.some(e => endpoint.includes(e));
    
    const headers = {
        'Content-Type': 'application/json',
    };
    
    if (!isPublic) {
        const token = getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        } else {
            console.warn('⚠️ No token found for protected endpoint');
        }
    }
    
    const options = {
        method: method,
        headers: headers,
    };
    
    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        options.body = JSON.stringify(data);
        console.log('📦 Request body:', data);
    }
    
    try {
        const response = await fetch(url, options);
        console.log(`📥 Response status: ${response.status}`);
        
        let result;
        const text = await response.text();
        try {
            result = JSON.parse(text);
        } catch (e) {
            result = { error: text || 'Invalid response from server' };
        }
        console.log('📦 Response:', result);
        
        if (response.status === 401) {
            console.warn('⚠️ 401 Unauthorized - Token may be expired');
            removeTokens();
            return { 
                success: false, 
                error: result.error || 'Session expired. Please login again.',
                status: 401,
                requiresLogin: true
            };
        }
        
        if (!response.ok) {
            return { 
                success: false, 
                error: result.error || result.message || 'API request failed',
                status: response.status,
                data: result
            };
        }
        
        return { success: true, data: result };
    } catch (error) {
        console.error('❌ Network Error:', error);
        return { success: false, error: error.message };
    }
}

// ========================================
// AUTHENTICATION - Import from auth.js
// ========================================

import { signUp, signIn, getCurrentUser as authGetCurrentUser } from './auth.js';

export async function getCurrentUser() {
    try {
        const result = await authGetCurrentUser();
        return result;
    } catch (error) {
        return { success: false, error: error.message, data: null };
    }
}

export { signUp, signIn };

// ========================================
// USER DATA
// ========================================

export async function getUserProfile(userId) {
    return await apiRequest(`/users/${userId}`, 'GET');
}

export async function getLeaderboard(limit = 10) {
    return await apiRequest(`/users/leaderboard?limit=${limit}`, 'GET');
}

// ========================================
// LOCATIONS
// ========================================

export async function getLocations() {
    const result = await apiRequest('/locations', 'GET');
    if (result.success && result.data && result.data.locations) {
        return { success: true, data: result.data.locations };
    }
    return result;
}

export async function getLocation(locationId) {
    const result = await apiRequest(`/locations/${locationId}`, 'GET');
    if (result.success && result.data && result.data.location) {
        return { success: true, data: result.data.location };
    }
    return result;
}

// ✅ FIXED: locationId → location_id
export async function unlockLocation(locationId) {
    console.log(`🔓 API: Unlocking ${locationId}`);
    const result = await apiRequest('/discover', 'POST', { location_id: locationId });
    console.log(`🔓 API Result:`, result);
    return result;
}

// ========================================
// QUESTS
// ========================================

export async function getQuests() {
    const result = await apiRequest('/quests', 'GET');
    if (result.success && result.data && result.data.quests) {
        return { success: true, data: result.data.quests };
    }
    return result;
}

export async function getQuest(questId) {
    return await apiRequest(`/quests/${questId}`, 'GET');
}

export async function completeQuest(questId) {
    return await apiRequest(`/quests/${questId}/complete`, 'POST');
}

// ========================================
// QR SCAN
// ========================================

export async function scanQR(qrCode) {
    return await apiRequest('/scan', 'POST', { qrCode });
}

// ========================================
// GAME PROGRESS
// ========================================

export async function getGameProgress() {
    return await apiRequest('/progress', 'GET');
}

// ========================================
// EXPORT ALL
// ========================================

export default {
    signUp,
    signIn,
    getCurrentUser,
    getUserProfile,
    getLeaderboard,
    getLocations,
    getLocation,
    unlockLocation,
    getQuests,
    getQuest,
    completeQuest,
    scanQR,
    getGameProgress
};