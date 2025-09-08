// Fleet Management System - JavaScript Utilities
// Version 1.0.0

class FleetManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupMobileMenu();
        this.setupFormValidation();
        this.setupTooltips();
        this.setupThemeToggle();
        this.setupKeyboardNavigation();
    }

    // Mobile menu functionality
    setupMobileMenu() {
        const menuToggle = document.getElementById('menuToggle');
        const sidebar = document.getElementById('sidebar');

        if (menuToggle && sidebar) {
            menuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('sidebar--open');
            });

            // Close sidebar when clicking outside on mobile
            document.addEventListener('click', (e) => {
                if (window.innerWidth <= 768 && !sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                    sidebar.classList.remove('sidebar--open');
                }
            });

            // Close sidebar on escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && window.innerWidth <= 768) {
                    sidebar.classList.remove('sidebar--open');
                }
            });
        }
    }

    // Form validation utilities
    setupFormValidation() {
        // Auto-format phone numbers
        const phoneInputs = document.querySelectorAll('input[type="tel"]');
        phoneInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                this.formatPhoneNumber(e.target);
            });
        });

        // Password strength validation
        const passwordInputs = document.querySelectorAll('input[type="password"]');
        passwordInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                this.validatePasswordStrength(e.target);
            });
        });

        // Real-time form validation
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            const inputs = form.querySelectorAll('input[required]');
            inputs.forEach(input => {
                input.addEventListener('blur', () => {
                    this.validateInput(input);
                });
            });
        });
    }

    formatPhoneNumber(input) {
        let value = input.value.replace(/\D/g, '');
        if (value.length >= 10) {
            value = value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
        }
        input.value = value;
    }

    validatePasswordStrength(input) {
        const password = input.value;
        const strengthIndicator = document.getElementById('strengthIndicator');

        if (!password) {
            if (strengthIndicator) strengthIndicator.style.display = 'none';
            return;
        }

        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;

        if (strengthIndicator) {
            strengthIndicator.style.display = 'block';
            const strengthText = document.getElementById('strengthText');
            const strengthBar = document.getElementById('strengthBar');

            if (strengthText && strengthBar) {
                const strengthLevels = ['Weak', 'Fair', 'Good', 'Strong'];
                const colors = ['#dc3545', '#ffc107', '#17a2b8', '#28a745'];

                strengthText.textContent = strengthLevels[Math.min(strength - 1, 3)];
                strengthText.style.color = colors[Math.min(strength - 1, 3)];
                strengthBar.style.width = `${(strength / 5) * 100}%`;
                strengthBar.style.backgroundColor = colors[Math.min(strength - 1, 3)];
            }
        }
    }

    validateInput(input) {
        const isValid = input.checkValidity();
        input.classList.toggle('form__input--error', !isValid);

        // Add/remove error message
        let errorElement = input.parentNode.querySelector('.form__error');
        if (!isValid && !errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'form__error';
            errorElement.textContent = this.getValidationMessage(input);
            input.parentNode.appendChild(errorElement);
        } else if (isValid && errorElement) {
            errorElement.remove();
        }
    }

    getValidationMessage(input) {
        if (input.validity.valueMissing) {
            return `${input.placeholder || 'This field'} is required`;
        }
        if (input.validity.typeMismatch) {
            return `Please enter a valid ${input.type}`;
        }
        if (input.validity.tooShort) {
            return `Minimum length is ${input.minLength} characters`;
        }
        return 'Invalid input';
    }

    // Tooltip functionality
    setupTooltips() {
        const tooltipElements = document.querySelectorAll('[title]');
        tooltipElements.forEach(element => {
            element.addEventListener('mouseenter', (e) => {
                this.showTooltip(e.target, e.target.title);
            });
            element.addEventListener('mouseleave', () => {
                this.hideTooltip();
            });
        });
    }

    showTooltip(element, text) {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = text;
        tooltip.style.cssText = `
            position: fixed;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
            z-index: 10000;
            pointer-events: none;
            white-space: nowrap;
        `;

        document.body.appendChild(tooltip);

        const rect = element.getBoundingClientRect();
        tooltip.style.left = `${rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2)}px`;
        tooltip.style.top = `${rect.top - tooltip.offsetHeight - 8}px`;
    }

    hideTooltip() {
        const tooltip = document.querySelector('.tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    }

    // Theme toggle functionality
    setupThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            const currentTheme = localStorage.getItem('theme') || 'light';
            document.documentElement.setAttribute('data-theme', currentTheme);

            themeToggle.addEventListener('click', () => {
                const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
                document.documentElement.setAttribute('data-theme', newTheme);
                localStorage.setItem('theme', newTheme);
            });
        }
    }

    // Keyboard navigation
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Skip to main content
            if (e.key === '/' && e.ctrlKey) {
                e.preventDefault();
                const mainContent = document.querySelector('main') || document.querySelector('.dashboard-layout__content');
                if (mainContent) {
                    mainContent.focus();
                    mainContent.scrollIntoView();
                }
            }
        });
    }

    // Utility functions
    static formatCurrency(amount, currency = 'USD') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    }

    static formatDate(date, options = {}) {
        const defaultOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        };
        return new Date(date).toLocaleDateString('en-US', { ...defaultOptions, ...options });
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.fleetManager = new FleetManager();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FleetManager;
}

