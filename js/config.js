/**
 * Environment Configuration for Velaa Frontend
 * Automatically detects environment and sets appropriate API URLs
 */

class EnvironmentConfig {
    constructor() {
        this.environment = this.detectEnvironment();
        this.config = this.getConfig();
    }

    /**
     * Detect current environment based on hostname
     * @returns {string} Environment name
     */
    detectEnvironment() {
        const hostname = window.location.hostname;
        const protocol = window.location.protocol;
        
        console.log('Environment detection - hostname:', hostname, 'protocol:', protocol);
        
        // Production environment - be more specific
        if (hostname === 'velaa.the4loop.com' || 
            hostname === 'www.velaa.the4loop.com' || 
            hostname.includes('the4loop.com')) {
            console.log('Production environment detected');
            return 'production';
        }
        
        // Local development
        if (hostname === 'localhost' || 
            hostname === '127.0.0.1' || 
            hostname === '0.0.0.0' ||
            hostname.startsWith('192.168.') ||
            hostname.startsWith('10.0.') ||
            hostname.startsWith('172.')) {
            console.log('Development environment detected');
            return 'development';
        }
        
        // If we're on HTTPS or a real domain, assume production
        if (protocol === 'https:' || (hostname.includes('.') && !hostname.includes('localhost'))) {
            console.log('Production environment detected (HTTPS or domain)');
            return 'production';
        }
        
        // Default to production for unknown environments (safer for deployment)
        console.log('Unknown environment, defaulting to production');
        return 'production';
    }

    /**
     * Get configuration based on environment
     * @returns {Object} Configuration object
     */
    getConfig() {
        const configs = {
            development: {
                apiBaseUrl: 'http://localhost:5001/api',
                environment: 'development',
                debug: true,
                mockMode: false
            },
            production: {
                apiBaseUrl: 'https://velaabackend.vercel.app/api',
                environment: 'production',
                debug: false,
                mockMode: false
            }
        };

        return configs[this.environment] || configs.development;
    }

    /**
     * Get API base URL
     * @returns {string} API base URL
     */
    getApiBaseUrl() {
        console.log('Getting API base URL:', this.config.apiBaseUrl);
        return this.config.apiBaseUrl;
    }

    /**
     * Get environment name
     * @returns {string} Environment name
     */
    getEnvironment() {
        return this.config.environment;
    }

    /**
     * Check if debug mode is enabled
     * @returns {boolean} Debug mode status
     */
    isDebugMode() {
        return this.config.debug;
    }

    /**
     * Check if mock mode is enabled
     * @returns {boolean} Mock mode status
     */
    isMockMode() {
        return this.config.mockMode;
    }

    /**
     * Get full configuration object
     * @returns {Object} Full configuration
     */
    getFullConfig() {
        return {
            ...this.config,
            hostname: window.location.hostname,
            protocol: window.location.protocol,
            port: window.location.port
        };
    }
}

// Create global instance
window.envConfig = new EnvironmentConfig();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnvironmentConfig;
}
