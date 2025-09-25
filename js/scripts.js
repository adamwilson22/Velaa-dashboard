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
        this.setupChart();
        this.setupScrollIndicators();
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

    // Chart functionality
    setupChart() {
        const chartContainer = document.querySelector('.chart-container');
        if (!chartContainer) return;

        this.chartData = {
            Toyota: { value: 85, color: '#4CAF50' },
            Nissan: { value: 45, color: '#2196F3' },
            BMW: { value: 35, color: '#FF9800' },
            Benz: { value: 70, color: '#9C27B0' },
            Audi: { value: 65, color: '#F44336' }
        };

        this.animateChart();
        this.setupChartInteractivity();
    }

    animateChart() {
        const bars = document.querySelectorAll('.bar-fill');
        bars.forEach((bar, index) => {
            bar.style.height = '0%';
            bar.style.transition = 'all 0.8s ease-in-out';
            
            setTimeout(() => {
                const brandClass = bar.classList[1];
                const brandName = brandClass.charAt(0).toUpperCase() + brandClass.slice(1);
                const targetHeight = this.chartData[brandName]?.value || 0;
                bar.style.height = `${targetHeight}%`;
                bar.style.backgroundColor = this.chartData[brandName]?.color || '#999999';
            }, index * 200);
        });
    }

    setupChartInteractivity() {
        const barContainers = document.querySelectorAll('.bar-container');
        
        barContainers.forEach((container, index) => {
            const bar = container.querySelector('.bar-fill');
            const label = container.querySelector('.bar-label');
            const brandName = label.textContent;
            
            // Hover effects
            container.addEventListener('mouseenter', () => {
                bar.style.transform = 'scaleY(1.05)';
                bar.style.filter = 'brightness(1.1)';
                this.showChartTooltip(container, brandName, this.chartData[brandName]?.value);
            });

            container.addEventListener('mouseleave', () => {
                bar.style.transform = 'scaleY(1)';
                bar.style.filter = 'brightness(1)';
                this.hideChartTooltip();
            });

            // Click to update data
            container.addEventListener('click', () => {
                this.updateChartData(brandName);
            });
        });

        // Add refresh button
        this.addChartRefreshButton();
    }

    showChartTooltip(element, brand, value) {
        const tooltip = document.createElement('div');
        tooltip.className = 'chart-tooltip';
        tooltip.innerHTML = `
            <strong>${brand}</strong><br>
            Vehicles: ${value}<br>
            <small>Click to simulate data change</small>
        `;
        tooltip.style.cssText = `
            position: absolute;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 12px;
            border-radius: 8px;
            font-size: 12px;
            z-index: 10000;
            pointer-events: none;
            white-space: nowrap;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        `;

        document.body.appendChild(tooltip);

        const rect = element.getBoundingClientRect();
        tooltip.style.left = `${rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2)}px`;
        tooltip.style.top = `${rect.top - tooltip.offsetHeight - 10}px`;
    }

    hideChartTooltip() {
        const tooltip = document.querySelector('.chart-tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    }

    updateChartData(brandName) {
        // Simulate data update with random values
        const newValue = Math.floor(Math.random() * 90) + 10;
        this.chartData[brandName].value = newValue;
        
        const barFill = document.querySelector(`.bar-fill.${brandName.toLowerCase()}`);
        if (barFill) {
            barFill.style.transition = 'all 0.6s ease-in-out';
            barFill.style.height = `${newValue}%`;
        }

        // Update tooltip if visible
        this.hideChartTooltip();
        
        // Show update notification
        this.showUpdateNotification(brandName, newValue);
    }

    showUpdateNotification(brand, value) {
        const notification = document.createElement('div');
        notification.className = 'chart-notification';
        notification.textContent = `${brand} updated to ${value} vehicles`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            font-size: 14px;
            z-index: 10001;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);

        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    addChartRefreshButton() {
        const chartCard = document.querySelector('.chart-card');
        if (!chartCard) return;

        const refreshButton = document.createElement('button');
        refreshButton.className = 'chart-refresh-btn';
        refreshButton.innerHTML = '↻ Refresh Data';
        refreshButton.style.cssText = `
            position: absolute;
            top: 15px;
            right: 15px;
            background: rgba(255, 255, 255, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.3);
            color: white;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.2s ease;
        `;

        refreshButton.addEventListener('mouseenter', () => {
            refreshButton.style.background = 'rgba(255, 255, 255, 0.3)';
        });

        refreshButton.addEventListener('mouseleave', () => {
            refreshButton.style.background = 'rgba(255, 255, 255, 0.2)';
        });

        refreshButton.addEventListener('click', () => {
            this.refreshAllChartData();
        });

        chartCard.style.position = 'relative';
        chartCard.appendChild(refreshButton);
    }

    refreshAllChartData() {
        Object.keys(this.chartData).forEach(brand => {
            this.updateChartData(brand);
        });
    }

    // Scroll indicators functionality
    setupScrollIndicators() {
        this.updateScrollIndicators();
        
        // Update on resize
        window.addEventListener('resize', FleetManager.debounce(() => {
            this.updateScrollIndicators();
        }, 250));
        
        // Update on scroll
        window.addEventListener('scroll', FleetManager.throttle(() => {
            this.updateScrollIndicators();
        }, 100));
    }

    updateScrollIndicators() {
        // Check vehicle table scroll
        const vehicleTableScroll = document.querySelector('.vehicle-table-scroll');
        if (vehicleTableScroll) {
            const isScrollable = vehicleTableScroll.scrollWidth > vehicleTableScroll.clientWidth;
            vehicleTableScroll.setAttribute('data-scrollable', isScrollable);
        }

        // Check vehicle controls scroll
        const vehicleControls = document.querySelector('.vehicle-controls');
        if (vehicleControls) {
            const isScrollable = vehicleControls.scrollWidth > vehicleControls.clientWidth;
            vehicleControls.setAttribute('data-scrollable', isScrollable);
        }

        // Check clients table scroll
        const clientsTableScroll = document.querySelector('.clients-table-scroll');
        if (clientsTableScroll) {
            const isScrollable = clientsTableScroll.scrollWidth > clientsTableScroll.clientWidth;
            clientsTableScroll.setAttribute('data-scrollable', isScrollable);
        }

        // Check clients controls scroll
        const clientsControls = document.querySelector('.clients-controls');
        if (clientsControls) {
            const isScrollable = clientsControls.scrollWidth > clientsControls.clientWidth;
            clientsControls.setAttribute('data-scrollable', isScrollable);
        }

        // Check billing table scroll
        const billingTableScroll = document.querySelector('.billing-table-scroll');
        if (billingTableScroll) {
            const isScrollable = billingTableScroll.scrollWidth > billingTableScroll.clientWidth;
            billingTableScroll.setAttribute('data-scrollable', isScrollable);
        }
    }
}

// Mobile Menu Toggle Functionality
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    let overlay = document.querySelector('.sidebar-overlay');
    
    console.log('🎯 toggleSidebar called!');
    console.log('📱 Sidebar element found:', !!sidebar);
    
    if (sidebar) {
        const isOpen = sidebar.classList.contains('sidebar--open');
        console.log('🔍 Sidebar currently open:', isOpen);
        
        if (isOpen) {
            // Close sidebar
            console.log('🔒 Closing sidebar');
            sidebar.classList.remove('sidebar--open');
            if (overlay) {
                overlay.classList.remove('show');
                setTimeout(() => overlay.remove(), 300);
            }
        } else {
            // Open sidebar
            console.log('🔓 Opening sidebar');
            sidebar.classList.add('sidebar--open');
            
            // Create overlay if it doesn't exist
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.className = 'sidebar-overlay';
                overlay.onclick = closeSidebar;
                document.body.appendChild(overlay);
                console.log('✅ Overlay created');
            }
            
            // Show overlay with animation
            requestAnimationFrame(() => {
                overlay.classList.add('show');
                console.log('✨ Overlay shown with animation');
            });
        }
        
    } else {
        console.error('❌ Sidebar element not found!');
    }
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    
    if (sidebar) {
        sidebar.classList.remove('sidebar--open');
    }
    
    if (overlay) {
        overlay.classList.remove('show');
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.remove();
            }
        }, 300);
    }
}

// Close sidebar when clicking outside on mobile
document.addEventListener('click', (e) => {
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    
    if (window.innerWidth <= 767 && sidebar && sidebar.classList.contains('sidebar--open')) {
        if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
            closeSidebar();
        }
    }
});

// Professional Window Resize Handler
window.addEventListener('resize', () => {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    
    // Close mobile sidebar when resizing to desktop
    if (window.innerWidth >= 992) {
        if (sidebar && sidebar.classList.contains('sidebar--open')) {
            sidebar.classList.remove('sidebar--open');
        }
        if (overlay) {
            overlay.classList.remove('show');
            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.remove();
                }
            }, 300);
        }
    }
});

// Professional Responsive Handler
function handleResponsiveChanges() {
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    
    console.log('📱 Responsive handler triggered, window width:', window.innerWidth);
    console.log('🔍 Menu toggle found:', !!menuToggle);
    
    if (window.innerWidth >= 992) {
        // Desktop mode
        if (sidebar) {
            sidebar.classList.remove('sidebar--open');
            sidebar.style.transform = '';
        }
        if (menuToggle) {
            menuToggle.style.display = 'none';
            console.log('🖥️ Desktop mode: hiding menu toggle');
        }
    } else {
        // Mobile/Tablet mode
        if (menuToggle) {
            menuToggle.style.display = 'flex';
            console.log('📱 Mobile mode: showing menu toggle');
        }
    }
}

// Run on load and resize
window.addEventListener('load', handleResponsiveChanges);
window.addEventListener('resize', handleResponsiveChanges);

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.fleetManager = new FleetManager();
    
    // Professional Mobile Menu Toggle Setup
    const menuToggle = document.querySelector('.mobile-menu-toggle') || document.getElementById('menuToggle');
    if (menuToggle) {
        console.log('✅ Mobile menu toggle found, attaching event listeners');
        
        // Universal click handler - works for both mouse and touch
        menuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🔄 Menu toggle activated (click/touch)');
            toggleSidebar();
        });
        
        // Additional touch handler for better mobile support
        menuToggle.addEventListener('touchend', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('👆 Touch end detected - triggering menu');
            toggleSidebar();
        });
        
        // Pointer events for modern browsers
        if ('PointerEvent' in window) {
            menuToggle.addEventListener('pointerdown', function(e) {
                e.preventDefault();
                console.log('🎯 Pointer down detected');
                toggleSidebar();
            });
        }
        
        // Ensure visibility on mobile
        if (window.innerWidth < 992) {
            menuToggle.style.display = 'flex';
        }
    } else {
        console.error('❌ Mobile menu toggle not found in DOM');
    }
    
    // Run responsive handler immediately
    handleResponsiveChanges();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FleetManager;
}

// Profile Dropdown Functions
function toggleProfileDropdown() {
    const dropdown = document.getElementById('profileDropdown');
    const overlay = document.getElementById('profileDropdownOverlay');
    
    if (dropdown && overlay) {
        const isVisible = dropdown.classList.contains('show');
        
        if (isVisible) {
            closeProfileDropdown();
        } else {
            openProfileDropdown();
        }
    }
}

function openProfileDropdown() {
    const dropdown = document.getElementById('profileDropdown');
    const overlay = document.getElementById('profileDropdownOverlay');
    
    if (dropdown && overlay) {
        dropdown.classList.add('show');
        overlay.classList.add('show');
        // Don't prevent scrolling - let the dropdown scroll internally
    }
}

function closeProfileDropdown() {
    const dropdown = document.getElementById('profileDropdown');
    const overlay = document.getElementById('profileDropdownOverlay');
    
    if (dropdown && overlay) {
        dropdown.classList.remove('show');
        overlay.classList.remove('show');
        // No need to restore scrolling since we didn't disable it
    }
}

// Close dropdown when clicking outside or pressing escape
document.addEventListener('click', (event) => {
    const dropdown = document.getElementById('profileDropdown');
    const profile = document.querySelector('.header__profile');
    
    if (dropdown && profile && !profile.contains(event.target)) {
        closeProfileDropdown();
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closeProfileDropdown();
    }
});

// Handle logout functionality
function handleLogout() {
    // Close the dropdown first
    closeProfileDropdown();
    
    // Redirect to index.html after a brief delay for smooth UX
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 200);
}

// Add click handler for logout when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Find all logout buttons and add click handlers
    const logoutButtons = document.querySelectorAll('.dropdown-menu-item.logout');
    logoutButtons.forEach(button => {
        button.addEventListener('click', handleLogout);
    });
});

