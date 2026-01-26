document.addEventListener('DOMContentLoaded', () => {

    // --- Intersection Observer for animations ---
    const animatedElements = document.querySelectorAll('.animate-on-scroll');

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                // Optional: Stop observing the element once it's visible
                // observer.unobserve(entry.target); 
            }
        });
    }, {
        threshold: 0.1 // Trigger when 10% of the element is visible
    });

    animatedElements.forEach(element => {
        observer.observe(element);
    });

    // --- Mobile Menu Toggle ---
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const headerNav = document.querySelector('.header-nav');

    if (menuToggle && headerNav) {
        // Clone header nav for mobile display to not interfere with desktop
        const mobileNav = headerNav.cloneNode(true);
        mobileNav.classList.add('mobile-nav');
        document.body.appendChild(mobileNav);

        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('is-active');
            mobileNav.classList.toggle('is-active');
        });
        
        // You might want to close the menu when a link is clicked
        mobileNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                 menuToggle.classList.remove('is-active');
                 mobileNav.classList.remove('is-active');
            });
        });
    }
    
    // Add mobile-specific styles for the cloned navigation
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
            padding: 20px;
            border-bottom: 1px solid #dee2e6;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .mobile-nav.is-active {
            display: flex;
        }
        .mobile-nav a {
            padding: 15px 0;
            text-align: center;
        }
        .mobile-menu-toggle {
            z-index: 1001; /* Above mobile nav */
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

        @media (min-width: 769px) {
            .mobile-nav {
                display: none !important;
            }
        }
    `;
    document.head.append(style);

});
