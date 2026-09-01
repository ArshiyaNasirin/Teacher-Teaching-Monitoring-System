// Core UI Logic for Aegis System

// Active Link Handler
function initializeNavigation() {
    const path = window.location.pathname;
    const links = {
        '/': 'nav-dashboard',
        '/teachers': 'nav-teachers',
        '/timetable': 'nav-classes',
        '/face_recognition': 'nav-attendance',
        '/ahm_dashboard': 'nav-reports',
        '/sessions': 'nav-transmission'
    };

    const activeId = links[path];
    if (activeId) {
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        const activeLink = document.getElementById(activeId);
        if (activeLink) activeLink.classList.add('active');
    }
}

// Particle configuration for AI feel
function initializeParticles() {
    if (document.getElementById('particles-js')) {
        particlesJS('particles-js', {
            "particles": {
                "number": { "value": 80, "density": { "enable": true, "value_area": 800 } },
                "color": { "value": "#00f2ff" },
                "shape": { "type": "circle" },
                "opacity": { "value": 0.2, "random": true },
                "size": { "value": 2, "random": true },
                "line_linked": { "enable": true, "distance": 150, "color": "#00f2ff", "opacity": 0.1, "width": 1 },
                "move": { "enable": true, "speed": 1, "direction": "none", "random": true, "straight": false, "out_mode": "out" }
            },
            "interactivity": {
                "events": { "onhover": { "enable": true, "mode": "grab" }, "onclick": { "enable": true, "mode": "push" } },
                "modes": { "grab": { "distance": 140, "line_linked": { "opacity": 0.5 } } }
            }
        });
    }
}

// Smooth Page Transitions
function initializePageTransitions() {
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.hostname === window.location.hostname && !link.hash && link.getAttribute('href') !== '#') {
            link.addEventListener('click', e => {
                const target = e.currentTarget.href;
                const content = document.getElementById('main-content');
                if (content) {
                    e.preventDefault();
                    content.style.transition = 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
                    content.style.opacity = '0';
                    content.style.transform = 'translateY(10px) scale(0.98)';
                    setTimeout(() => { window.location.href = target; }, 400);
                }
            });
        }
    });
}

// Card Stagger Animations
function initializeCardAnimations() {
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
            card.style.transition = 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
            // Remove inline transition after animation so CSS hover states work properly
            setTimeout(() => card.style.transition = '', 600);
        }, 50 + (index * 75));
    });
}

// Global Custom Cursor
function initializeCustomCursor() {
    const style = document.createElement('style');
    style.innerHTML = `
        body, a, button, input, select { cursor: none !important; }
        #aegis-cursor {
            position: fixed; top: 0; left: 0; width: 25px; height: 25px;
            border: 2px solid #00f2ff; border-radius: 50%; pointer-events: none; z-index: 999999;
            transition: width 0.2s, height 0.2s, background-color 0.2s, border 0.2s;
            box-shadow: 0 0 10px rgba(0, 242, 255, 0.4);
            transform: translate(-50%, -50%);
        }
        #aegis-cursor.hovering {
            width: 45px; height: 45px; border-color: rgba(0, 242, 255, 0.1);
            background-color: rgba(0, 242, 255, 0.15); backdrop-filter: blur(2px);
        }
        #aegis-cursor.clicking { width: 15px; height: 15px; background-color: #00f2ff; }
    `;
    document.head.appendChild(style);

    const cursor = document.createElement('div');
    cursor.id = 'aegis-cursor';
    document.body.appendChild(cursor);

    let mouseX = -100, mouseY = -100;
    let cursorX = mouseX, cursorY = mouseY;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX; mouseY = e.clientY;
    });

    function animateCursor() {
        cursorX += (mouseX - cursorX) * 0.3;
        cursorY += (mouseY - cursorY) * 0.3;
        cursor.style.transform = \`translate(calc(\${cursorX}px - 50%), calc(\${cursorY}px - 50%))\`;
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    document.addEventListener('mouseover', (e) => {
        if(e.target.closest('a, button, input, select, .cursor-pointer')) cursor.classList.add('hovering');
    });
    document.addEventListener('mouseout', (e) => {
        if(e.target.closest('a, button, input, select, .cursor-pointer')) cursor.classList.remove('hovering');
    });
    document.addEventListener('mousedown', () => cursor.classList.add('clicking'));
    document.addEventListener('mouseup', () => cursor.classList.remove('clicking'));
}

// Profile Dropdown Toggle
function initializeProfileDropdown() {
    const btn      = document.getElementById('profile-btn');
    const dropdown = document.getElementById('profile-dropdown');
    const chevron  = document.getElementById('profile-chevron');
    if (!btn || !dropdown) return;

    let open = false;

    function openDropdown() {
        open = true;
        dropdown.style.opacity = '1';
        dropdown.style.transform = 'translateY(0) scale(1)';
        dropdown.style.pointerEvents = 'auto';
        if (chevron) chevron.style.transform = 'rotate(180deg)';
    }

    function closeDropdown() {
        open = false;
        dropdown.style.opacity = '0';
        dropdown.style.transform = 'translateY(-8px) scale(0.97)';
        dropdown.style.pointerEvents = 'none';
        if (chevron) chevron.style.transform = 'rotate(0deg)';
    }

    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        open ? closeDropdown() : openDropdown();
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
        const wrapper = document.getElementById('profile-wrapper');
        if (open && wrapper && !wrapper.contains(e.target)) {
            closeDropdown();
        }
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && open) closeDropdown();
    });
}

// Initialize on Load
window.addEventListener('DOMContentLoaded', () => {
    // Initialize Feather Icons first so all icons render
    if (typeof feather !== 'undefined') feather.replace();

    initializeProfileDropdown();
    initializeCustomCursor();
    initializeNavigation();
    initializeParticles();
    initializePageTransitions();
    initializeCardAnimations();
});
