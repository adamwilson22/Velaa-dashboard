/**
 * Authentication Helper
 * Ensures consistent authentication across all pages
 * Version 2.0.1
 */

class AuthHelper {
    constructor() {
        this.tokenKey = 'authToken';
        this.userDataKey = 'userData';
    }

    /**
     * Initialize authentication for the page
     * Call this at the start of every protected page
     */
    init() {
        console.log('[AUTH] Initializing authentication...');
        
        // Ensure global API instance exists
        if (!window.velaaAPI) {
            console.error('[AUTH] Global API instance not found!');
            return false;
        }

        // Get token from localStorage
        const token = this.getToken();
        
        if (!token) {
            console.warn('[AUTH] No token found, redirecting to login...');
            this.redirectToLogin('Please login to continue');
            return false;
        }

        // Ensure the global API instance has the token
        if (!window.velaaAPI.token || window.velaaAPI.token !== token) {
            console.log('[AUTH] Loading token into global API instance...');
            window.velaaAPI.token = token;
        }

        console.log('[AUTH] Authentication initialized successfully');
        console.log('[AUTH] Token loaded:', token.substring(0, 20) + '...');
        
        return true;
    }

    /**
     * Get token from localStorage
     */
    getToken() {
        try {
            return localStorage.getItem(this.tokenKey) || '';
        } catch (e) {
            console.error('[AUTH] Error reading token:', e);
            return '';
        }
    }

    /**
     * Set token in localStorage and API instance
     */
    setToken(token) {
        try {
            localStorage.setItem(this.tokenKey, token);
            if (window.velaaAPI) {
                window.velaaAPI.token = token;
            }
            console.log('[AUTH] Token saved successfully');
            return true;
        } catch (e) {
            console.error('[AUTH] Error saving token:', e);
            return false;
        }
    }

    /**
     * Clear authentication data
     */
    clearAuth() {
        try {
            localStorage.removeItem(this.tokenKey);
            localStorage.removeItem(this.userDataKey);
            sessionStorage.clear();
            if (window.velaaAPI) {
                window.velaaAPI.token = '';
            }
            console.log('[AUTH] Authentication cleared');
            return true;
        } catch (e) {
            console.error('[AUTH] Error clearing auth:', e);
            return false;
        }
    }

    /**
     * Get user data from localStorage
     */
    getUserData() {
        try {
            const data = localStorage.getItem(this.userDataKey);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('[AUTH] Error reading user data:', e);
            return null;
        }
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return !!this.getToken();
    }

    /**
     * Redirect to login page
     */
    redirectToLogin(message = '') {
        if (message && typeof NotificationManager !== 'undefined') {
            NotificationManager.warning(message);
        }
        
        // Don't redirect if already on login page
        if (!window.location.pathname.includes('index.html') && 
            !window.location.pathname.endsWith('/')) {
            setTimeout(() => {
                window.location.href = 'index.html?returnUrl=' + encodeURIComponent(window.location.pathname);
            }, 1000);
        }
    }

    /**
     * Handle logout
     */
    async logout() {
        try {
            // Call API logout if available
            if (window.velaaAPI && typeof window.velaaAPI.logout === 'function') {
                await window.velaaAPI.logout().catch(() => {});
            }
        } catch (e) {
            console.error('[AUTH] Error during logout:', e);
        }
        
        this.clearAuth();
        this.redirectToLogin('You have been logged out');
    }

    /**
     * Get the global API instance with ensured token
     */
    getAPI() {
        if (!window.velaaAPI) {
            console.error('[AUTH] Global API instance not available');
            return null;
        }

        // Ensure token is loaded
        const token = this.getToken();
        if (token && (!window.velaaAPI.token || window.velaaAPI.token !== token)) {
            window.velaaAPI.token = token;
            console.log('[AUTH] Token synchronized with API instance');
        }

        return window.velaaAPI;
    }
}

// Create global instance
window.authHelper = new AuthHelper();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthHelper;
}

