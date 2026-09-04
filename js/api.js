// ========================================
// API SERVICE - LOST@UET Backend Connection
// ========================================

const API_BASE_URL = 'https://tumrnrszpjudmzuyduac.supabase.co/functions/v1';

// ========================================
// TOKEN MANAGEMENT
// ========================================

function getToken() {
    return localStorage.getItem('access_token');
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
    
    const headers = {
        'Content-Type': 'application/json',
    };
    
    // Add auth token if it exists
    const token = getToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    const options = {
        method: method,
        headers: headers,
    };
    
    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(url, options);
        const result = await response.json();
        
        if (!response.ok) {
            // Handle specific error codes
            if (response.status === 401) {
                // Token expired - try refresh
                const refreshed = await refreshToken();
                if (refreshed) {
                    // Retry the request with new token
                    return apiRequest(endpoint, method, data);
                } else {
                    // Refresh failed - redirect to login
                    removeTokens();
                    window.location.href = 'login.html';
                    return { success: false, error: 'Session expired. Please login again.' };
                }
            }
            
            throw new Error(result.error || result.message || 'API request failed');
        }
        
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// ========================================
// TOKEN REFRESH
// ========================================

async function refreshToken() {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshToken })
        });
        
        const result = await response.json();
        if (response.ok && result.access_token) {
            setToken(result.access_token);
            if (result.refresh_token) {
                setRefreshToken(result.refresh_token);
            }
            return true;
        }
        return false;
    } catch {
        return false;
    }
}

// ========================================
// AUTHENTICATION
// ========================================

// Sign Up
export async function signUp(username, email, password) {
    const result = await apiRequest('/auth/signup', 'POST', {
        username,
        email,
        password
    });
    
    if (result.success && result.data.access_token) {
        setToken(result.data.access_token);
        if (result.data.refresh_token) {
            setRefreshToken(result.data.refresh_token);
        }
    }
    
    return result;
}

// Sign In
export async function signIn(email, password) {
    const result = await apiRequest('/auth/login', 'POST', {
        email,
        password
    });
    
    if (result.success && result.data.access_token) {
        setToken(result.data.access_token);
        if (result.data.refresh_token) {
            setRefreshToken(result.data.refresh_token);
        }
    }
    
    return result;
}

// Sign Out
export function signOut() {
    removeTokens();
    return { success: true };
}

// Get Current User
export async function getCurrentUser() {
    const result = await apiRequest('/auth/me', 'GET');
    return result;
}

// ========================================
// USER DATA
// ========================================

// Get User Profile
export async function getUserProfile(userId) {
    return await apiRequest(`/users/${userId}`, 'GET');
}

// Update User Profile
export async function updateUserProfile(userId, data) {
    return await apiRequest(`/users/${userId}`, 'PUT', data);
}

// Get Leaderboard
export async function getLeaderboard(limit = 10) {
    return await apiRequest(`/users/leaderboard?limit=${limit}`, 'GET');
}

// ========================================
// LOCATIONS
// ========================================

// Get All Locations
export async function getLocations() {
    return await apiRequest('/locations', 'GET');
}

// Get Location Details
export async function getLocation(locationId) {
    return await apiRequest(`/locations/${locationId}`, 'GET');
}

// Unlock/Discover a Location
export async function unlockLocation(locationId) {
    return await apiRequest('/discover', 'POST', { locationId });
}

// ========================================
// QUESTS
// ========================================

// Get All Quests
export async function getQuests() {
    return await apiRequest('/quests', 'GET');
}

// Get Quest Details
export async function getQuest(questId) {
    return await apiRequest(`/quests/${questId}`, 'GET');
}

// Complete a Quest
export async function completeQuest(questId) {
    return await apiRequest(`/quests/${questId}/complete`, 'POST');
}

// ========================================
// QR SCAN
// ========================================

// Submit QR Scan
export async function scanQR(qrCode) {
    return await apiRequest('/scan', 'POST', { qrCode });
}

// ========================================
// GAME PROGRESS
// ========================================

// Get Full Game Progress
export async function getGameProgress() {
    return await apiRequest('/progress', 'GET');
}

// ========================================
// EXPORT ALL
// ========================================

export default {
    signUp,
    signIn,
    signOut,
    getCurrentUser,
    getUserProfile,
    updateUserProfile,
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