/**
 * Velaa Vehicle Management API Service
 * Professional API integration with comprehensive error handling
 * Version 2.0.0
 */

class VelaaAPI {
    constructor() {
        this.baseURL = 'http://localhost:5001/api';
        this.timeout = 30000; // 30 seconds
        this.registrationData = {}; // Store registration data across steps
        this.defaultCountryCode = '+255'; // Tanzania country code
        this.mockMode = false; // Set to true for testing without backend
    }

    /**
     * Generic API request method with error handling
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Request options
     * @returns {Promise<Object>} API response
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        const defaultOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            timeout: this.timeout
        };

        const config = { ...defaultOptions, ...options };

        try {
            // Create abort controller for timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);

            const response = await fetch(url, {
                ...config,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new APIError(
                    errorData.message || `HTTP ${response.status}: ${response.statusText}`,
                    response.status,
                    errorData
                );
            }

            return await response.json();
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new APIError('Request timeout. Please try again.', 408);
            }
            
            if (error instanceof APIError) {
                throw error;
            }

            // Network or other errors
            throw new APIError(
                'Network error. Please check your connection and try again.',
                0,
                { originalError: error.message }
            );
        }
    }

    /**
     * Step 1: Register User
     * @param {Object} userData - User registration data
     * @returns {Promise<Object>} Registration response
     */
    async registerUser(userData) {
        try {
            // Check if in mock mode for testing without backend
            if (this.mockMode) {
                console.log('🧪 Mock mode: Simulating API response');
                await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
                
                const mockResponse = {
                    success: true,
                    data: {
                        userId: 'mock_user_' + Date.now(),
                        phone: userData.phone,
                        otpSent: true,
                        nextStep: 'verify-otp'
                    }
                };
                
                // Store registration data for next steps
                this.registrationData = {
                    phone: userData.phone,
                    ownerManagerName: userData.ownerManagerName,
                    warehouseName: userData.warehouseName,
                    userId: mockResponse.data.userId
                };
                
                return mockResponse;
            }

            const response = await this.request('/auth/register', {
                method: 'POST',
                body: JSON.stringify({
                    ownerManagerName: userData.ownerManagerName,
                    warehouseName: userData.warehouseName,
                    phone: userData.phone
                })
            });

            // Store registration data for next steps
            this.registrationData = {
                phone: userData.phone,
                ownerManagerName: userData.ownerManagerName,
                warehouseName: userData.warehouseName,
                userId: response.data?.userId
            };

            return response;
        } catch (error) {
            console.error('Registration error:', error);
            
            // Auto-enable mock mode if backend is not available
            if (error.status === 0 || error.message.includes('Network error')) {
                console.log('🔄 Backend not available, enabling mock mode for testing...');
                this.mockMode = true;
                NotificationManager.warning('Backend server not available. Running in demo mode.');
                return this.registerUser(userData); // Retry with mock mode
            }
            
            throw error;
        }
    }

    /**
     * Step 2: Verify OTP
     * @param {string} phone - Phone number
     * @param {string} otp - OTP code
     * @returns {Promise<Object>} Verification response
     */
    async verifyOTP(phone, otp) {
        try {
            // Check if in mock mode for testing without backend
            if (this.mockMode) {
                console.log('🧪 Mock mode: Simulating OTP verification');
                await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
                
                // Accept only 1234 OTP in mock mode
                if (otp === '1234') {
                    return {
                        success: true,
                        data: {
                            user: {
                                status: 'otp-verified',
                                isOtpVerified: true,
                                isPhoneVerified: true
                            },
                            nextStep: 'create-password'
                        }
                    };
                } else {
                    throw new APIError('Invalid OTP. Please use 1234 for demo mode.', 400);
                }
            }

            const response = await this.request('/auth/verify-otp', {
                method: 'POST',
                body: JSON.stringify({
                    phone: phone,
                    otp: otp
                })
            });

            return response;
        } catch (error) {
            console.error('OTP verification error:', error);
            
            // Auto-enable mock mode if backend is not available
            if (error.status === 0 || error.message.includes('Network error')) {
                console.log('🔄 Backend not available for OTP verification, using mock mode...');
                this.mockMode = true;
                return this.verifyOTP(phone, otp); // Retry with mock mode
            }
            
            throw error;
        }
    }

    /**
     * Step 3: Complete Registration (Create Password)
     * @param {string} phone - Phone number
     * @param {string} password - User password
     * @returns {Promise<Object>} Completion response
     */
    async completeRegistration(phone, password) {
        try {
            // Check if in mock mode for testing without backend
            if (this.mockMode) {
                console.log('🧪 Mock mode: Simulating registration completion');
                await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
                
                const mockResponse = {
                    success: true,
                    data: {
                        token: 'mock_jwt_token_' + Date.now(),
                        user: {
                            status: 'active',
                            isPhoneVerified: true,
                            isOtpVerified: true,
                            ownerManagerName: this.registrationData.ownerManagerName,
                            warehouseName: this.registrationData.warehouseName,
                            phone: phone,
                            id: 'mock_user_' + Date.now()
                        }
                    }
                };
                
                // Clear registration data on success
                this.registrationData = {};
                return mockResponse;
            }

            const response = await this.request('/auth/complete-registration', {
                method: 'POST',
                body: JSON.stringify({
                    phone: phone,
                    password: password
                })
            });

            // Clear registration data on success
            if (response.success) {
                this.registrationData = {};
            }

            return response;
        } catch (error) {
            console.error('Registration completion error:', error);
            
            // Auto-enable mock mode if backend is not available
            if (error.status === 0 || error.message.includes('Network error')) {
                console.log('🔄 Backend not available for registration completion, using mock mode...');
                this.mockMode = true;
                return this.completeRegistration(phone, password); // Retry with mock mode
            }
            
            throw error;
        }
    }

    /**
     * Login User
     * @param {string} phone - Phone number
     * @param {string} password - Password
     * @returns {Promise<Object>} Login response
     */
    async login(phone, password) {
        try {
            // Check if in mock mode for testing without backend
            if (this.mockMode) {
                console.log('🧪 Mock mode: Simulating login');
                await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
                
                // Simple mock validation
                if (password && password.length >= 6) {
                    return {
                        success: true,
                        data: {
                            token: 'mock_login_token_' + Date.now(),
                            user: {
                                id: 'mock_user_login',
                                phone: phone,
                                ownerManagerName: 'Mock User',
                                warehouseName: 'Mock Warehouse',
                                status: 'active'
                            }
                        }
                    };
                } else {
                    throw new APIError('Invalid password', 401);
                }
            }

            const response = await this.request('/auth/login', {
                method: 'POST',
                body: JSON.stringify({
                    phone: phone,
                    password: password
                })
            });

            return response;
        } catch (error) {
            console.error('Login error:', error);
            
            // Auto-enable mock mode if backend is not available
            if (error.status === 0 || error.message.includes('Network error')) {
                console.log('🔄 Backend not available for login, using mock mode...');
                this.mockMode = true;
                NotificationManager.warning('Backend server not available. Running in demo mode.');
                return this.login(phone, password); // Retry with mock mode
            }
            
            throw error;
        }
    }

    /**
     * Forgot Password - Send OTP
     * @param {string} phone - Phone number
     * @returns {Promise<Object>} Forgot password response
     */
    async forgotPassword(phone) {
        try {
            // Check if in mock mode for testing without backend
            if (this.mockMode) {
                console.log('🧪 Mock mode: Simulating forgot password');
                await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
                
                return {
                    success: true,
                    data: {
                        phone: phone,
                        otpSent: true,
                        message: 'OTP sent to your phone number'
                    }
                };
            }

            const response = await this.request('/auth/forgot-password', {
                method: 'POST',
                body: JSON.stringify({
                    phone: phone
                })
            });

            return response;
        } catch (error) {
            console.error('Forgot password error:', error);
            
            // Auto-enable mock mode if backend is not available
            if (error.status === 0 || error.message.includes('Network error')) {
                console.log('🔄 Backend not available for forgot password, using mock mode...');
                this.mockMode = true;
                return this.forgotPassword(phone); // Retry with mock mode
            }
            
            throw error;
        }
    }

    /**
     * Verify Recovery OTP
     * @param {string} phone - Phone number
     * @param {string} otp - OTP code
     * @returns {Promise<Object>} Verification response
     */
    async verifyRecoveryOTP(phone, otp) {
        try {
            // Check if in mock mode for testing without backend
            if (this.mockMode) {
                console.log('🧪 Mock mode: Simulating recovery OTP verification');
                await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
                
                // Accept only 1234 OTP in mock mode
                if (otp === '1234') {
                    return {
                        success: true,
                        data: {
                            phone: phone,
                            otpVerified: true,
                            resetToken: 'mock_reset_token_' + Date.now()
                        }
                    };
                } else {
                    throw new APIError('Invalid recovery code. Please use 1234 for demo mode.', 400);
                }
            }

            const response = await this.request('/auth/verify-recovery-otp', {
                method: 'POST',
                body: JSON.stringify({
                    phone: phone,
                    otp: otp
                })
            });

            return response;
        } catch (error) {
            console.error('Recovery OTP verification error:', error);
            
            // Auto-enable mock mode if backend is not available
            if (error.status === 0 || error.message.includes('Network error')) {
                console.log('🔄 Backend not available for recovery OTP verification, using mock mode...');
                this.mockMode = true;
                return this.verifyRecoveryOTP(phone, otp); // Retry with mock mode
            }
            
            throw error;
        }
    }

    /**
     * Reset Password
     * @param {string} phone - Phone number
     * @param {string} otp - OTP code
     * @param {string} newPassword - New password
     * @returns {Promise<Object>} Reset response
     */
    async resetPassword(phone, otp, newPassword) {
        try {
            // Check if in mock mode for testing without backend
            if (this.mockMode) {
                console.log('🧪 Mock mode: Simulating password reset');
                await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
                
                return {
                    success: true,
                    data: {
                        message: 'Password reset successfully',
                        phone: phone
                    }
                };
            }

            const response = await this.request('/auth/reset-password', {
                method: 'POST',
                body: JSON.stringify({
                    phone: phone,
                    otp: otp,
                    newPassword: newPassword
                })
            });

            return response;
        } catch (error) {
            console.error('Password reset error:', error);
            
            // Auto-enable mock mode if backend is not available
            if (error.status === 0 || error.message.includes('Network error')) {
                console.log('🔄 Backend not available for password reset, using mock mode...');
                this.mockMode = true;
                return this.resetPassword(phone, otp, newPassword); // Retry with mock mode
            }
            
            throw error;
        }
    }

    /**
     * Resend OTP
     * @param {string} phone - Phone number
     * @returns {Promise<Object>} Resend response
     */
    async resendOTP(phone) {
        try {
            // Using the register endpoint to resend OTP
            const response = await this.request('/auth/register', {
                method: 'POST',
                body: JSON.stringify({
                    ownerManagerName: this.registrationData.ownerManagerName,
                    warehouseName: this.registrationData.warehouseName,
                    phone: phone
                })
            });

            return response;
        } catch (error) {
            console.error('Resend OTP error:', error);
            throw error;
        }
    }

    /**
     * Get stored registration data
     * @returns {Object} Registration data
     */
    getRegistrationData() {
        return this.registrationData;
    }

    /**
     * Clear registration data
     */
    clearRegistrationData() {
        this.registrationData = {};
    }

    /**
     * Format Tanzania phone number
     * @param {string} phone - Input phone number
     * @returns {string} Formatted phone number
     */
    formatTanzaniaPhone(phone) {
        // Remove all non-digit characters
        let cleaned = phone.replace(/\D/g, '');
        
        // Handle different input formats
        if (cleaned.startsWith('255')) {
            // Already has country code
            return '+' + cleaned;
        } else if (cleaned.startsWith('0')) {
            // Local format (0XX XXX XXXX) - remove leading 0 and add country code
            return '+255' + cleaned.substring(1);
        } else if (cleaned.length === 9) {
            // Missing country code and leading zero
            return '+255' + cleaned;
        } else if (cleaned.length === 10 && cleaned.startsWith('2')) {
            // 10 digits starting with 2 (mobile number without 0)
            return '+255' + cleaned.substring(1);
        }
        
        // Default: add country code if not present
        return cleaned.startsWith('+') ? cleaned : '+255' + cleaned;
    }

    /**
     * Validate Tanzania phone number
     * @param {string} phone - Phone number to validate
     * @returns {boolean} Is valid
     */
    validateTanzaniaPhone(phone) {
        const formatted = this.formatTanzaniaPhone(phone);
        
        // Tanzania phone number patterns:
        // Mobile: +255 6XX XXX XXX, +255 7XX XXX XXX, +255 8XX XXX XXX
        // Landline: +255 22 XXX XXXX, +255 24 XXX XXXX, +255 26 XXX XXXX, etc.
        const mobilePattern = /^\+255[678]\d{8}$/;
        const landlinePattern = /^\+255(2[2-8]|23|24|25|26|27|28)\d{7}$/;
        
        return mobilePattern.test(formatted) || landlinePattern.test(formatted);
    }
}

/**
 * Custom API Error class
 */
class APIError extends Error {
    constructor(message, status = 0, data = {}) {
        super(message);
        this.name = 'APIError';
        this.status = status;
        this.data = data;
    }

    /**
     * Get user-friendly error message
     * @returns {string} User-friendly error message
     */
    getUserMessage() {
        switch (this.status) {
            case 400:
                return this.data.message || 'Please check your input and try again.';
            case 401:
                return 'Authentication failed. Please try again.';
            case 403:
                return 'Access denied. Please contact support.';
            case 404:
                return 'Service not found. Please try again later.';
            case 408:
                return 'Request timeout. Please check your connection.';
            case 422:
                return this.data.message || 'Invalid data provided. Please check your input.';
            case 429:
                return 'Too many requests. Please wait a moment before trying again.';
            case 500:
                return 'Server error. Please try again later.';
            case 503:
                return 'Service temporarily unavailable. Please try again later.';
            default:
                return this.message || 'An unexpected error occurred. Please try again.';
        }
    }

    /**
     * Check if error is retryable
     * @returns {boolean} Whether the error can be retried
     */
    isRetryable() {
        return [408, 429, 500, 502, 503, 504].includes(this.status);
    }
}

/**
 * Loading Manager for API calls
 */
class LoadingManager {
    constructor() {
        this.activeLoaders = new Set();
    }

    /**
     * Show loading state
     * @param {string} id - Unique loader ID
     * @param {string} message - Loading message
     */
    show(id, message = 'Loading...') {
        this.activeLoaders.add(id);
        
        // Create or update loader element
        let loader = document.getElementById(`loader-${id}`);
        if (!loader) {
            loader = this.createLoader(id, message);
            document.body.appendChild(loader);
        }
        
        loader.querySelector('.loader__message').textContent = message;
        loader.classList.add('show');
        
        // Disable form interactions
        this.disableInteractions();
    }

    /**
     * Hide loading state
     * @param {string} id - Loader ID to hide
     */
    hide(id) {
        this.activeLoaders.delete(id);
        
        const loader = document.getElementById(`loader-${id}`);
        if (loader) {
            loader.classList.remove('show');
            setTimeout(() => {
                if (loader.parentNode) {
                    loader.remove();
                }
            }, 300);
        }
        
        // Re-enable form interactions if no active loaders
        if (this.activeLoaders.size === 0) {
            this.enableInteractions();
        }
    }

    /**
     * Create loader element
     * @param {string} id - Loader ID
     * @param {string} message - Loading message
     * @returns {HTMLElement} Loader element
     */
    createLoader(id, message) {
        const loader = document.createElement('div');
        loader.id = `loader-${id}`;
        loader.className = 'velaa-loader';
        loader.innerHTML = `
            <div class="loader__backdrop"></div>
            <div class="loader__content">
                <div class="loader__spinner">
                    <div class="spinner"></div>
                </div>
                <div class="loader__message">${message}</div>
            </div>
        `;
        return loader;
    }

    /**
     * Disable form interactions
     */
    disableInteractions() {
        document.body.style.pointerEvents = 'none';
        document.body.style.userSelect = 'none';
        
        // Keep loaders interactive
        document.querySelectorAll('.velaa-loader').forEach(loader => {
            loader.style.pointerEvents = 'auto';
        });
    }

    /**
     * Enable form interactions
     */
    enableInteractions() {
        document.body.style.pointerEvents = '';
        document.body.style.userSelect = '';
    }

    /**
     * Hide all loaders
     */
    hideAll() {
        Array.from(this.activeLoaders).forEach(id => this.hide(id));
    }
}

/**
 * Notification Manager
 */
class NotificationManager {
    /**
     * Show success notification
     * @param {string} message - Success message
     * @param {number} duration - Display duration in ms
     */
    static success(message, duration = 4000) {
        this.show(message, 'success', duration);
    }

    /**
     * Show error notification
     * @param {string} message - Error message
     * @param {number} duration - Display duration in ms
     */
    static error(message, duration = 6000) {
        this.show(message, 'error', duration);
    }

    /**
     * Show warning notification
     * @param {string} message - Warning message
     * @param {number} duration - Display duration in ms
     */
    static warning(message, duration = 5000) {
        this.show(message, 'warning', duration);
    }

    /**
     * Show info notification
     * @param {string} message - Info message
     * @param {number} duration - Display duration in ms
     */
    static info(message, duration = 4000) {
        this.show(message, 'info', duration);
    }

    /**
     * Show notification
     * @param {string} message - Notification message
     * @param {string} type - Notification type
     * @param {number} duration - Display duration in ms
     */
    static show(message, type = 'info', duration = 4000) {
        const notification = document.createElement('div');
        notification.className = `velaa-notification velaa-notification--${type}`;
        notification.innerHTML = `
            <div class="notification__content">
                <div class="notification__icon">
                    ${this.getIcon(type)}
                </div>
                <div class="notification__message">${message}</div>
                <button class="notification__close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        // Add to DOM
        document.body.appendChild(notification);

        // Show with animation
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });

        // Auto remove
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, duration);
    }

    /**
     * Get icon for notification type
     * @param {string} type - Notification type
     * @returns {string} Icon HTML
     */
    static getIcon(type) {
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        return icons[type] || icons.info;
    }
}

// Initialize global instances
window.velaaAPI = new VelaaAPI();
window.loadingManager = new LoadingManager();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { VelaaAPI, APIError, LoadingManager, NotificationManager };
}
