/**
 * Velaa Fleet Management - Page Loader Utility
 * Provides consistent loading experience across all pages
 */

class PageLoader {
    constructor(loaderText = 'Loading') {
        this.loaderElement = null;
        this.contentElement = null;
        this.dotsInterval = null;
        this.loaderText = loaderText;
        this.init();
    }

    init() {
        // Create loader HTML if not exists
        if (!document.getElementById('pageLoader')) {
            const loaderHTML = `
                <div class="page-loader" id="pageLoader">
                    <div class="loader-spinner"></div>
                    <div class="loader-text">${this.loaderText}<span class="loader-dots">...</span></div>
                </div>
            `;
            document.body.insertAdjacentHTML('afterbegin', loaderHTML);
        }

        this.loaderElement = document.getElementById('pageLoader');
        
        // Add loaded class to main content
        const mainContent = document.querySelector('.dashboard-layout') || 
                           document.querySelector('.page-container') ||
                           document.querySelector('main');
        if (mainContent && !mainContent.classList.contains('page-content')) {
            mainContent.classList.add('page-content');
            this.contentElement = mainContent;
        }

        // Start animated dots
        this.startDotsAnimation();
    }

    startDotsAnimation() {
        let dotCount = 0;
        this.dotsInterval = setInterval(() => {
            const dotsEl = document.querySelector('.loader-dots');
            if (dotsEl) {
                dotCount = (dotCount + 1) % 4;
                dotsEl.textContent = '.'.repeat(dotCount);
            }
        }, 500);
    }

    stopDotsAnimation() {
        if (this.dotsInterval) {
            clearInterval(this.dotsInterval);
            this.dotsInterval = null;
        }
    }

    hide(delay = 500) {
        this.stopDotsAnimation();
        setTimeout(() => {
            if (this.loaderElement) {
                this.loaderElement.classList.add('hidden');
            }
            if (this.contentElement) {
                this.contentElement.classList.add('loaded');
            }
        }, delay);
    }

    show() {
        if (this.loaderElement) {
            this.loaderElement.classList.remove('hidden');
        }
        if (this.contentElement) {
            this.contentElement.classList.remove('loaded');
        }
        this.startDotsAnimation();
    }

    showError(errorMessage = 'Failed to load', hideAfter = 2000) {
        this.stopDotsAnimation();
        const loaderText = document.querySelector('.loader-text');
        if (loaderText) {
            loaderText.textContent = errorMessage;
            loaderText.style.color = '#ff6b6b';
        }

        setTimeout(() => {
            this.hide(0);
        }, hideAfter);
    }

    updateText(newText) {
        const loaderText = document.querySelector('.loader-text');
        if (loaderText) {
            const dotsSpan = loaderText.querySelector('.loader-dots');
            loaderText.childNodes[0].textContent = newText;
            if (!dotsSpan) {
                loaderText.insertAdjacentHTML('beforeend', '<span class="loader-dots">...</span>');
            }
        }
    }
}

// Global instance
window.PageLoader = PageLoader;

// Auto-initialize on DOM load if loader element exists
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        // Check if page has loader placeholder
        if (document.getElementById('pageLoader')) {
            console.log('[PageLoader] Detected existing loader element');
        }
    });
}

