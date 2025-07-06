// Optimized JavaScript with Performance Improvements
// Utilities
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

const throttle = (func, limit) => {
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
};

// Performance monitoring
const performanceMonitor = {
    start: (name) => performance.mark(`${name}-start`),
    end: (name) => {
        performance.mark(`${name}-end`);
        performance.measure(name, `${name}-start`, `${name}-end`);
    },
    getMetrics: () => performance.getEntriesByType('measure')
};

// DOM Content Loaded - Optimized
document.addEventListener('DOMContentLoaded', function() {
    performanceMonitor.start('init');
    
    initializeMobileNavigation();
    initializeSmoothScrolling();
    initializeNavbarScrollEffect();
    initializeBackToTopButton();
    initializeIntersectionObserver();
    initializeSkillBars();
    initializeContactForm();
    initializeActiveNavigation();
    initializeAnimations();
    initializeImageOptimization();
    initializeServiceWorker();
    
    performanceMonitor.end('init');
});

// Mobile Navigation - Optimized
function initializeMobileNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (!hamburger || !navMenu) return;
    
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
}

// Smooth Scrolling - Optimized
function initializeSmoothScrolling() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            
            if (target) {
                const headerHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = target.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Navbar Scroll Effect - Optimized with Throttling
function initializeNavbarScrollEffect() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    
    const handleScroll = throttle(() => {
        const scrollY = window.scrollY;
        
        if (scrollY > 50) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = 'none';
        }
    }, 16); // ~60fps
    
    window.addEventListener('scroll', handleScroll, { passive: true });
}

// Back to Top Button - Optimized
function initializeBackToTopButton() {
    const backToTopButton = document.getElementById('back-to-top');
    if (!backToTopButton) return;
    
    const handleScroll = throttle(() => {
        const scrollY = window.scrollY;
        
        if (scrollY > 300) {
            backToTopButton.classList.add('show');
        } else {
            backToTopButton.classList.remove('show');
        }
    }, 100);
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    backToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Intersection Observer - Optimized
function initializeIntersectionObserver() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('appear');
                // Unobserve after animation to improve performance
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements with fade-in animation
    const elementsToAnimate = document.querySelectorAll('.timeline-item, .project-card, .skill-category, .contact-item, .stat-item');
    elementsToAnimate.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
}

// Skill Bars - Optimized
function initializeSkillBars() {
    const skillBars = document.querySelectorAll('.skill-progress');
    if (skillBars.length === 0) return;
    
    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const progress = entry.target.getAttribute('data-progress');
                
                // Use requestAnimationFrame for smoother animation
                requestAnimationFrame(() => {
                    entry.target.style.width = progress + '%';
                });
                
                skillObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    skillBars.forEach(bar => {
        skillObserver.observe(bar);
    });
}

// Contact Form - Optimized
function initializeContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(contactForm);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            subject: formData.get('subject'),
            message: formData.get('message')
        };
        
        // Validation
        if (!validateForm(data)) return;
        
        // Submit form
        submitForm(data, contactForm);
    });
}

function validateForm(data) {
    const { name, email, subject, message } = data;
    
    if (!name || !email || !subject || !message) {
        showNotification('Please fill in all fields.', 'error');
        return false;
    }
    
    if (!isValidEmail(email)) {
        showNotification('Please enter a valid email address.', 'error');
        return false;
    }
    
    return true;
}

function submitForm(data, form) {
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    
    submitButton.textContent = 'Sending...';
    submitButton.disabled = true;
    
    // Simulate form submission
    setTimeout(() => {
        showNotification('Message sent successfully! I\'ll get back to you soon.', 'success');
        form.reset();
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }, 2000);
}

// Active Navigation - Optimized
function initializeActiveNavigation() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (sections.length === 0 || navLinks.length === 0) return;
    
    const handleScroll = throttle(() => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (window.scrollY >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    }, 100);
    
    window.addEventListener('scroll', handleScroll, { passive: true });
}

// Animations - Optimized
function initializeAnimations() {
    // Counter animation for stats
    const counters = document.querySelectorAll('.stat-number');
    if (counters.length === 0) return;
    
    const countObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                countObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => {
        countObserver.observe(counter);
    });
    
    // Project card hover effects
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
    });
}

function animateCounter(counter) {
    const target = parseInt(counter.textContent.replace(/\D/g, ''));
    const increment = target / 100;
    let current = 0;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            counter.textContent = counter.textContent.replace(/\d+/, target);
            clearInterval(timer);
        } else {
            counter.textContent = counter.textContent.replace(/\d+/, Math.ceil(current));
        }
    }, 20);
}

// Image Optimization - Lazy Loading
function initializeImageOptimization() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    
                    // Replace data-src with src for lazy loading
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                    }
                    
                    // Remove loading class when image loads
                    img.addEventListener('load', () => {
                        img.classList.remove('loading');
                    });
                    
                    imageObserver.unobserve(img);
                }
            });
        });

        // Observe all images
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            // Add loading class for images that aren't loaded yet
            if (!img.complete) {
                img.classList.add('loading');
            }
            
            // Set up lazy loading if data-src exists
            if (img.dataset.src) {
                img.classList.add('lazy');
                imageObserver.observe(img);
            }
        });
    }
}

// Service Worker - Enhanced
function initializeServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', async () => {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('ServiceWorker registered successfully');
                
                // Handle service worker updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            showNotification('A new version is available. Refresh to update.', 'info');
                        }
                    });
                });
            } catch (error) {
                console.log('ServiceWorker registration failed');
            }
        });
    }
}

// Utility Functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        info: '#007bff'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type]};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    requestAnimationFrame(() => {
        notification.style.transform = 'translateX(0)';
    });
    
    // Remove after delay
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

// Error Handling
window.addEventListener('error', (e) => {
    if (e.target.tagName === 'IMG') {
        // Fallback image for failed loads
        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+PC9zdmc+';
    }
});

// Theme Toggle (Optional Enhancement)
function toggleTheme() {
    const body = document.body;
    const isDark = body.classList.contains('dark-theme');
    
    if (isDark) {
        body.classList.remove('dark-theme');
        localStorage.setItem('theme', 'light');
    } else {
        body.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark');
    }
}

// Load saved theme
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
}

// Performance Monitoring
if (typeof window !== 'undefined' && 'performance' in window) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
            
            if (loadTime > 3000) {
                console.warn('Page load time is high:', loadTime + 'ms');
            }
        }, 0);
    });
}

// Cleanup function for memory management
function cleanup() {
    // Remove event listeners if needed
    const elementsWithListeners = document.querySelectorAll('[data-cleanup]');
    elementsWithListeners.forEach(element => {
        element.removeEventListener('click', element.clickHandler);
        element.removeEventListener('scroll', element.scrollHandler);
    });
}

// Initialize cleanup on page unload
window.addEventListener('beforeunload', cleanup);