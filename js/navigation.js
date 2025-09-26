/**
 * Velaa Navigation Manager
 * Smooth page transitions and navigation helpers
 */

class NavigationManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupPageTransitions();
        this.setupBackButton();
        this.setupPreventNavigation();
    }

    /**
     * Setup smooth page transitions
     */
    setupPageTransitions() {
        // Add transition overlay
        this.createTransitionOverlay();
        
        // Override default navigation for smooth transitions
        this.interceptNavigation();
    }

    /**
     * Create transition overlay
     */
    createTransitionOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'pageTransitionOverlay';
        overlay.className = 'page-transition-overlay';
        overlay.innerHTML = `
            <div class="transition-content">
                <div class="transition-spinner">
                    <div class="spinner"></div>
                </div>
                <div class="transition-message">Loading...</div>
            </div>
        `;
        document.body.appendChild(overlay);
    }

    /**
     * Navigate to a page with smooth transition
     * @param {string} url - Target URL
     * @param {string} message - Loading message
     */
    async navigateTo(url, message = 'Loading...') {
        return new Promise((resolve) => {
            const overlay = document.getElementById('pageTransitionOverlay');
            const messageEl = overlay.querySelector('.transition-message');
            
            // Update message
            messageEl.textContent = message;
            
            // Show overlay
            overlay.classList.add('show');
            
            // Navigate after transition
            setTimeout(() => {
                window.location.href = url;
                resolve();
            }, 600);
        });
    }

    /**
     * Intercept navigation for smooth transitions
     */
    interceptNavigation() {
        // Override window.location.href assignments
        const originalAssign = window.location.assign;
        const originalReplace = window.location.replace;
        
        window.location.assign = (url) => {
            this.navigateTo(url, 'Redirecting...');
        };
        
        window.location.replace = (url) => {
            this.navigateTo(url, 'Redirecting...');
        };
    }

    /**
     * Setup browser back button handling
     */
    setupBackButton() {
        window.addEventListener('popstate', (event) => {
            // Handle back button for registration flow
            this.handleBackNavigation(event);
        });
    }

    /**
     * Handle back navigation during registration
     * @param {PopStateEvent} event - Popstate event
     */
    handleBackNavigation(event) {
        const currentPage = window.location.pathname.split('/').pop();
        
        // Define registration flow pages
        const registrationPages = ['signup.html', 'otp.html', 'create-password.html', 'reset-success.html'];
        
        if (registrationPages.includes(currentPage)) {
            // Check if user is in middle of registration
            const registrationPhone = sessionStorage.getItem('registrationPhone');
            
            if (registrationPhone && (currentPage === 'otp.html' || currentPage === 'create-password.html')) {
                // Confirm if user wants to abandon registration
                const confirmed = confirm('Are you sure you want to go back? Your registration progress will be lost.');
                
                if (!confirmed) {
                    // Prevent back navigation
                    event.preventDefault();
                    window.history.pushState(null, '', window.location.href);
                    return;
                }
                
                // Clear registration data if user confirms
                sessionStorage.removeItem('registrationPhone');
                sessionStorage.removeItem('registrationData');
                window.velaaAPI?.clearRegistrationData();
            }
        }
    }

    /**
     * Prevent navigation during API calls
     */
    setupPreventNavigation() {
        let isAPICallActive = false;
        
        // Track API call state
        const originalShow = window.loadingManager?.show;
        const originalHide = window.loadingManager?.hide;
        
        if (window.loadingManager) {
            window.loadingManager.show = function(...args) {
                isAPICallActive = true;
                return originalShow.apply(this, args);
            };
            
            window.loadingManager.hide = function(...args) {
                isAPICallActive = false;
                return originalHide.apply(this, args);
            };
        }
        
        // Prevent navigation during API calls
        window.addEventListener('beforeunload', (event) => {
            if (isAPICallActive) {
                event.preventDefault();
                event.returnValue = 'An operation is in progress. Are you sure you want to leave?';
                return event.returnValue;
            }
        });
    }

    /**
     * Add loading state to navigation buttons
     * @param {HTMLElement} button - Button element
     * @param {string} message - Loading message
     */
    setButtonLoading(button, message = 'Loading...') {
        if (!button) return;
        
        button.disabled = true;
        button.classList.add('btn--loading');
        button.setAttribute('data-original-text', button.textContent);
        button.textContent = message;
    }

    /**
     * Remove loading state from navigation buttons
     * @param {HTMLElement} button - Button element
     */
    removeButtonLoading(button) {
        if (!button) return;
        
        button.disabled = false;
        button.classList.remove('btn--loading');
        const originalText = button.getAttribute('data-original-text');
        if (originalText) {
            button.textContent = originalText;
            button.removeAttribute('data-original-text');
        }
    }

    /**
     * Check if user should be on current page
     * @param {string} requiredData - Required session data key
     * @param {string} redirectUrl - URL to redirect if data missing
     */
    validatePageAccess(requiredData, redirectUrl = 'signup.html') {
        if (!sessionStorage.getItem(requiredData)) {
            NotificationManager.warning('Please start the registration process from the beginning.');
            setTimeout(() => {
                this.navigateTo(redirectUrl, 'Redirecting...');
            }, 2000);
            return false;
        }
        return true;
    }

    /**
     * Get current registration step
     * @returns {number} Current step (1-4)
     */
    getCurrentRegistrationStep() {
        const currentPage = window.location.pathname.split('/').pop();
        const registrationPhone = sessionStorage.getItem('registrationPhone');
        
        switch (currentPage) {
            case 'signup.html':
                return 1;
            case 'otp.html':
                return registrationPhone ? 2 : 1;
            case 'create-password.html':
                return registrationPhone ? 3 : 1;
            case 'reset-success.html':
                return 4;
            default:
                return 1;
        }
    }

    /**
     * Show registration progress
     */
    showRegistrationProgress() {
        const currentStep = this.getCurrentRegistrationStep();
        const totalSteps = 4;
        
        // Create progress indicator if it doesn't exist
        let progressContainer = document.getElementById('registrationProgress');
        if (!progressContainer) {
            progressContainer = document.createElement('div');
            progressContainer.id = 'registrationProgress';
            progressContainer.className = 'registration-progress';
            
            const authContent = document.querySelector('.auth-layout__content');
            if (authContent) {
                authContent.insertBefore(progressContainer, authContent.firstChild);
            }
        }
        
        // Update progress
        progressContainer.innerHTML = `
            <div class="progress-steps">
                ${Array.from({ length: totalSteps }, (_, i) => {
                    const step = i + 1;
                    const isActive = step === currentStep;
                    const isCompleted = step < currentStep;
                    
                    return `
                        <div class="progress-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}">
                            <div class="step-number">${isCompleted ? '✓' : step}</div>
                        </div>
                    `;
                }).join('')}
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${((currentStep - 1) / (totalSteps - 1)) * 100}%"></div>
            </div>
        `;
    }
}

// CSS for transitions and progress (inject into head)
const transitionStyles = `
<style>
.page-transition-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(4px);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
}

.page-transition-overlay.show {
    opacity: 1;
    visibility: visible;
}

.transition-content {
    text-align: center;
    padding: 2rem;
}

.transition-spinner {
    margin-bottom: 1rem;
}

.transition-spinner .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #000000;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto;
}

.transition-message {
    font-family: 'SF Pro', -apple-system, BlinkMacSystemFont, sans-serif;
    font-size: 16px;
    font-weight: 500;
    color: #1C1C1C;
}

.registration-progress {
    margin-bottom: 2rem;
    padding: 1rem 0;
}

.progress-steps {
    display: flex;
    justify-content: space-between;
    margin-bottom: 1rem;
    position: relative;
}

.progress-step {
    position: relative;
    z-index: 2;
}

.step-number {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #e9ecef;
    color: #6c757d;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 600;
    transition: all 0.3s ease;
}

.progress-step.active .step-number {
    background: #000000;
    color: white;
}

.progress-step.completed .step-number {
    background: #22c55e;
    color: white;
}

.progress-bar {
    height: 4px;
    background: #e9ecef;
    border-radius: 2px;
    position: relative;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #22c55e 0%, #000000 100%);
    border-radius: 2px;
    transition: width 0.6s ease;
}

@media (max-width: 768px) {
    .step-number {
        width: 28px;
        height: 28px;
        font-size: 12px;
    }
    
    .registration-progress {
        margin-bottom: 1.5rem;
        padding: 0.5rem 0;
    }
}
</style>
`;

// Inject styles
document.head.insertAdjacentHTML('beforeend', transitionStyles);

// Initialize navigation manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.navigationManager = new NavigationManager();
    
    // Show registration progress on auth pages
    const authPages = ['signup.html', 'otp.html', 'create-password.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    if (authPages.includes(currentPage)) {
        setTimeout(() => {
            window.navigationManager.showRegistrationProgress();
        }, 100);
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NavigationManager;
}
