document.addEventListener('DOMContentLoaded', () => {

    // --- Intersection Observer for animations ---
    const animatedElements = document.querySelectorAll('.animate-on-scroll');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, {
        threshold: 0.1
    });

    animatedElements.forEach(element => {
        observer.observe(element);
    });

    // --- New Mobile Menu Logic ---
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    const headerCta = document.querySelector('.header-cta');
    
    // Legacy nav for pages that might not have been updated
    const legacyHeaderNav = document.querySelector('.header-nav'); 

    if (menuToggle) {
        const mobileNav = document.createElement('div');
        mobileNav.className = 'mobile-nav';

        // Populate mobile nav from new structure if it exists
        if (mainNav) {
            [...mainNav.children].forEach(item => {
                if (item.tagName === 'A') {
                    mobileNav.appendChild(item.cloneNode(true));
                    return;
                }
                if (item.classList.contains('nav-dropdown')) {
                    const toggle = item.querySelector('.nav-dropdown-toggle');
                    const menu = item.querySelector('.nav-dropdown-menu');
                    if (!toggle || !menu) return;

                    const mobileDropdown = document.createElement('div');
                    mobileDropdown.className = 'mobile-dropdown';

                    const button = document.createElement('button');
                    button.type = 'button';
                    button.className = 'mobile-dropdown-toggle';
                    button.setAttribute('aria-expanded', 'false');
                    const label = toggle.textContent.replace('▾', '').replace(/\s+/g, ' ').trim();
                    button.innerHTML = `${label} <span class="mobile-dropdown-caret" aria-hidden="true">+</span>`;

                    const mobileMenu = document.createElement('div');
                    mobileMenu.className = 'mobile-dropdown-menu';
                    menu.querySelectorAll('a').forEach(link => {
                        mobileMenu.appendChild(link.cloneNode(true));
                    });

                    mobileDropdown.appendChild(button);
                    mobileDropdown.appendChild(mobileMenu);
                    mobileNav.appendChild(mobileDropdown);
                }
            });
        }
        if (headerCta) {
             headerCta.querySelectorAll('a').forEach(link => {
                mobileNav.appendChild(link.cloneNode(true));
            });
        }

        // Populate from legacy structure if new one isn't there
        if (!mainNav && legacyHeaderNav) {
             legacyHeaderNav.querySelectorAll('a').forEach(link => {
                mobileNav.appendChild(link.cloneNode(true));
            });
        }

        document.body.appendChild(mobileNav);

        const closeMobileNav = () => {
            menuToggle.classList.remove('is-active');
            mobileNav.classList.remove('is-active');
            mobileNav.querySelectorAll('.mobile-dropdown').forEach(dropdown => {
                dropdown.classList.remove('is-open');
                const toggle = dropdown.querySelector('.mobile-dropdown-toggle');
                if (toggle) toggle.setAttribute('aria-expanded', 'false');
            });
        };

        menuToggle.addEventListener('click', () => {
            const isActive = menuToggle.classList.toggle('is-active');
            mobileNav.classList.toggle('is-active', isActive);
            if (!isActive) {
                closeMobileNav();
            }
        });

        mobileNav.querySelectorAll('.mobile-dropdown-toggle').forEach(button => {
            button.addEventListener('click', () => {
                const parent = button.parentElement;
                const isOpen = parent.classList.toggle('is-open');
                button.setAttribute('aria-expanded', String(isOpen));
            });
        });

        mobileNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                closeMobileNav();
            });
        });
    }

    // --- Dynamic Styles for Mobile Menu ---
    // Avoids needing a separate CSS file update for just this.
    const style = document.createElement('style');
    style.textContent = `
        .mobile-nav {
            display: none;
            position: fixed;
            top: 70px; /* Height of header */
            left: 0;
            width: 100%;
            background-color: #fff;
            flex-direction: column;
            padding: 20px 0;
            border-bottom: 1px solid var(--border-color);
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 999;
        }
        .mobile-nav.is-active {
            display: flex;
        }
        .mobile-nav a {
            padding: 15px 20px;
            text-align: center;
            display: block;
            width: 100%;
            border-bottom: 1px solid var(--surface-color);
        }
        .mobile-dropdown {
            border-bottom: 1px solid var(--surface-color);
        }
        .mobile-dropdown-toggle {
            width: 100%;
            padding: 15px 20px;
            text-align: left;
            background: none;
            border: none;
            font: inherit;
            color: inherit;
            display: flex;
            align-items: center;
            justify-content: space-between;
            cursor: pointer;
        }
        .mobile-dropdown-caret {
            transition: transform 0.2s ease;
        }
        .mobile-dropdown-menu {
            display: none;
            flex-direction: column;
            padding: 4px 0 10px;
        }
        .mobile-dropdown-menu a {
            padding: 10px 30px;
            text-align: left;
            border-bottom: none;
        }
        .mobile-dropdown.is-open .mobile-dropdown-menu {
            display: flex;
        }
        .mobile-dropdown.is-open .mobile-dropdown-caret {
            transform: rotate(45deg);
        }
        .mobile-nav a.btn {
            margin: 10px auto;
            width: calc(100% - 40px);
        }
        .mobile-nav a:last-child {
            border-bottom: none;
        }

        .mobile-menu-toggle {
            z-index: 1001;
            display: none; /* Hidden by default */
            background: none;
            border: none;
            cursor: pointer;
        }
        .mobile-menu-toggle span {
             display: block;
             width: 25px;
             height: 3px;
             background-color: #333;
             margin: 5px 0;
             transition: all 0.3s;
        }
        .mobile-menu-toggle.is-active span:nth-child(1) {
            transform: rotate(45deg) translate(5px, 5px);
        }
        .mobile-menu-toggle.is-active span:nth-child(2) {
            opacity: 0;
        }
        .mobile-menu-toggle.is-active span:nth-child(3) {
            transform: rotate(-45deg) translate(7px, -6px);
        }
        
        /* Show toggle on screens where desktop nav is hidden */
        @media (max-width: 992px) {
            .mobile-menu-toggle {
                display: block; 
            }
        }

        @media (min-width: 993px) {
            .mobile-nav {
                display: none !important;
            }
        }
    `;
    document.head.append(style);

});
