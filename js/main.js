document.addEventListener('DOMContentLoaded', () => {

    // Header scroll effect
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Mobile hamburger + accordion navigation
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const mobileMediaQuery = window.matchMedia('(max-width: 992px)');

    if (hamburger && navMenu) {
        if (!navMenu.id) {
            navMenu.id = 'primary-navigation';
        }

        hamburger.setAttribute('role', 'button');
        hamburger.setAttribute('tabindex', '0');
        hamburger.setAttribute('aria-controls', navMenu.id);
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.setAttribute('aria-label', '메뉴 열기');

        const hamburgerIcon = hamburger.querySelector('i');
        const isMobileView = () => mobileMediaQuery.matches;
        const dropdownItems = Array.from(navMenu.querySelectorAll(':scope > li.dropdown'));
        const closingTimers = new WeakMap();

        const setSubMenuAccessibility = (subMenu, isOpen, mobileOnly = false) => {
            if (mobileOnly && !isMobileView()) {
                subMenu.setAttribute('aria-hidden', 'false');
                subMenu.querySelectorAll('a').forEach((link) => link.removeAttribute('tabindex'));
                return;
            }

            subMenu.setAttribute('aria-hidden', String(!isOpen));
            subMenu.querySelectorAll('a').forEach((link) => {
                if (isOpen) {
                    link.removeAttribute('tabindex');
                } else {
                    link.setAttribute('tabindex', '-1');
                }
            });
        };

        const syncDropdownStateByViewport = () => {
            dropdownItems.forEach((item) => {
                const subMenu = item.querySelector(':scope > .sub-menu');
                const toggleButton = item.querySelector(':scope > .dropdown-toggle');
                if (!subMenu || !toggleButton) return;

                if (isMobileView()) {
                    if (item.classList.contains('is-open')) {
                        subMenu.style.maxHeight = `${subMenu.scrollHeight}px`;
                        setSubMenuAccessibility(subMenu, true, true);
                    } else {
                        subMenu.style.maxHeight = '0px';
                        setSubMenuAccessibility(subMenu, false, true);
                    }
                } else {
                    item.classList.remove('is-open');
                    item.classList.remove('is-closing');
                    toggleButton.setAttribute('aria-expanded', 'false');
                    subMenu.style.removeProperty('max-height');
                    setSubMenuAccessibility(subMenu, true);
                }
            });
        };

        const closeDropdown = (item) => {
            const subMenu = item.querySelector(':scope > .sub-menu');
            const toggleButton = item.querySelector(':scope > .dropdown-toggle');
            if (!subMenu || !toggleButton) return;

            const closeTimer = closingTimers.get(item);
            if (closeTimer) {
                window.clearTimeout(closeTimer);
                closingTimers.delete(item);
            }

            toggleButton.setAttribute('aria-expanded', 'false');
            const triggerLink = item.querySelector(':scope > a');
            const menuLabel = triggerLink ? triggerLink.textContent.trim() : '메뉴';
            toggleButton.setAttribute('aria-label', `${menuLabel} 하위 메뉴 열기`);

            if (!isMobileView()) {
                item.classList.remove('is-open', 'is-closing');
                subMenu.style.removeProperty('max-height');
                setSubMenuAccessibility(subMenu, true);
                return;
            }

            if (!item.classList.contains('is-open') && !item.classList.contains('is-closing')) {
                subMenu.style.maxHeight = '0px';
                setSubMenuAccessibility(subMenu, false, true);
                return;
            }

            subMenu.style.maxHeight = `${subMenu.scrollHeight}px`;
            subMenu.offsetHeight;
            item.classList.remove('is-open');
            item.classList.add('is-closing');
            subMenu.style.maxHeight = '0px';
            setSubMenuAccessibility(subMenu, false, true);

            const nextTimer = window.setTimeout(() => {
                item.classList.remove('is-closing');
                closingTimers.delete(item);
            }, 300);
            closingTimers.set(item, nextTimer);
        };

        const closeAllDropdowns = (exceptItem = null) => {
            dropdownItems.forEach((item) => {
                if (item === exceptItem) return;
                closeDropdown(item);
            });
        };

        dropdownItems.forEach((item, index) => {
            const triggerLink = item.querySelector(':scope > a');
            const subMenu = item.querySelector(':scope > .sub-menu');
            if (!triggerLink || !subMenu) return;

            let toggleButton = item.querySelector(':scope > .dropdown-toggle');
            if (!toggleButton) {
                toggleButton = document.createElement('button');
                toggleButton.type = 'button';
                toggleButton.className = 'dropdown-toggle';
                toggleButton.innerHTML = '<i class="fa-solid fa-chevron-down" aria-hidden="true"></i>';
                item.appendChild(toggleButton);
            }

            if (!subMenu.id) {
                subMenu.id = `submenu-${index + 1}`;
            }

            const menuLabel = triggerLink.textContent.trim();
            toggleButton.setAttribute('aria-controls', subMenu.id);
            toggleButton.setAttribute('aria-expanded', 'false');
            toggleButton.setAttribute('aria-label', `${menuLabel} 하위 메뉴 열기`);
            setSubMenuAccessibility(subMenu, false, true);

            const openItem = () => {
                closeAllDropdowns(item);
                const closeTimer = closingTimers.get(item);
                if (closeTimer) {
                    window.clearTimeout(closeTimer);
                    closingTimers.delete(item);
                }
                item.classList.remove('is-closing');
                item.classList.add('is-open');
                toggleButton.setAttribute('aria-expanded', 'true');
                toggleButton.setAttribute('aria-label', `${menuLabel} 하위 메뉴 닫기`);
                subMenu.style.maxHeight = `${subMenu.scrollHeight}px`;
                setSubMenuAccessibility(subMenu, true, true);
            };

            const closeItem = () => {
                closeDropdown(item);
            };

            const toggleItem = () => {
                if (item.classList.contains('is-open')) {
                    closeItem();
                } else {
                    openItem();
                }
            };

            const handleDropdownToggle = (event) => {
                if (!isMobileView()) return;
                event.preventDefault();
                event.stopPropagation();
                toggleItem();
            };

            toggleButton.addEventListener('click', handleDropdownToggle);
            triggerLink.addEventListener('click', (event) => {
                if (!isMobileView()) return;
                if (item.classList.contains('is-open')) return;
                event.preventDefault();
                event.stopImmediatePropagation();
                openItem();
            });
        });

        const setMenuOpenState = (shouldOpen) => {
            navMenu.classList.toggle('active', shouldOpen);
            hamburger.classList.toggle('is-active', shouldOpen);
            document.body.classList.toggle('nav-open', shouldOpen);
            hamburger.setAttribute('aria-expanded', String(shouldOpen));
            hamburger.setAttribute('aria-label', shouldOpen ? '메뉴 닫기' : '메뉴 열기');

            if (hamburgerIcon) {
                hamburgerIcon.classList.toggle('fa-bars', !shouldOpen);
                hamburgerIcon.classList.toggle('fa-xmark', shouldOpen);
            }

            if (!shouldOpen && isMobileView()) {
                closeAllDropdowns();
            }
        };

        const toggleMenu = () => {
            setMenuOpenState(!navMenu.classList.contains('active'));
        };

        hamburger.addEventListener('click', toggleMenu);
        hamburger.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                toggleMenu();
            }
        });

        navMenu.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => {
                if (!isMobileView()) return;
                setMenuOpenState(false);
            });
        });

        document.addEventListener('click', (event) => {
            if (!isMobileView() || !navMenu.classList.contains('active')) return;
            if (header && header.contains(event.target)) return;
            setMenuOpenState(false);
        });

        window.addEventListener('resize', () => {
            if (!isMobileView()) {
                setMenuOpenState(false);
            }
            syncDropdownStateByViewport();
        });

        syncDropdownStateByViewport();
    }

    const isKakaoPlaceholder = (href) => {
        if (!href) return false;
        return href.includes('{KAKAO_CHANNEL_URL}') || href.trim() === '';
    };

    document.addEventListener('click', (event) => {
        const link = event.target.closest('a[href]');
        if (!link) return;

        const href = link.getAttribute('href') || '';
        if (isKakaoPlaceholder(href)) {
            event.preventDefault();
            console.warn('Kakao channel URL is not configured yet.');
            return;
        }

        if (href === '#' && (link.classList.contains('is-disabled') || link.getAttribute('aria-disabled') === 'true')) {
            event.preventDefault();
            console.warn('Temporary navigation link is disabled:', link.textContent.trim());
        }
    });

    // Main visual slider (index page)
    const heroSlider = document.querySelector('.hero-slider');
    if (heroSlider) {
        heroSlider.classList.add('is-sequenced');

        const slides = Array.from(heroSlider.querySelectorAll('.hero-slide'));
        const dots = Array.from(heroSlider.querySelectorAll('.hero-slider-dots button'));
        const pauseOnHoverTargets = Array.from(
            heroSlider.querySelectorAll('.hero-cta-btn, .hero-slider-dots button')
        );
        const dotsWrap = heroSlider.querySelector('.hero-slider-dots');
        const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        const slideIntervalMs = 4500;
        const textRevealDelayMs = 350;
        const ctaRevealDelayAfterTextMs = 300;
        let currentSlideIndex = 0;
        let sliderTimer = null;
        let textRevealTimer = null;
        let ctaRevealTimer = null;
        let isPausedByHoverControl = false;

        const shouldReduceMotion = () => reducedMotionQuery.matches;

        const clearRevealTimers = () => {
            if (textRevealTimer) {
                clearTimeout(textRevealTimer);
                textRevealTimer = null;
            }
            if (ctaRevealTimer) {
                clearTimeout(ctaRevealTimer);
                ctaRevealTimer = null;
            }
        };

        const stopSlider = () => {
            if (!sliderTimer) return;
            clearInterval(sliderTimer);
            sliderTimer = null;
        };

        const revealActiveSlideSequence = (slideIndex) => {
            clearRevealTimers();

            const textDelay = shouldReduceMotion() ? 0 : textRevealDelayMs;
            const ctaDelay = shouldReduceMotion() ? 0 : textRevealDelayMs + ctaRevealDelayAfterTextMs;

            textRevealTimer = window.setTimeout(() => {
                const slide = slides[slideIndex];
                if (!slide) return;
                if (slideIndex !== currentSlideIndex) return;
                if (!slide.classList.contains('is-active')) return;
                slide.classList.add('is-text-visible');
                textRevealTimer = null;
            }, textDelay);

            ctaRevealTimer = window.setTimeout(() => {
                const slide = slides[slideIndex];
                if (!slide) return;
                if (slideIndex !== currentSlideIndex) return;
                if (!slide.classList.contains('is-active')) return;
                slide.classList.add('is-cta-visible');
                ctaRevealTimer = null;
            }, ctaDelay);
        };

        const setActiveSlide = (nextIndex) => {
            clearRevealTimers();

            slides.forEach((slide, index) => {
                const isTarget = index === nextIndex;
                slide.classList.toggle('is-active', isTarget);
                slide.classList.remove('is-text-visible');
                slide.classList.remove('is-cta-visible');
                slide.setAttribute('aria-hidden', String(!isTarget));
            });

            dots.forEach((dot, index) => {
                const isTarget = index === nextIndex;
                dot.classList.toggle('is-active', isTarget);
                dot.setAttribute('aria-current', String(isTarget));
            });

            currentSlideIndex = nextIndex;
            revealActiveSlideSequence(nextIndex);
        };

        const moveToNextSlide = () => {
            const nextIndex = (currentSlideIndex + 1) % slides.length;
            setActiveSlide(nextIndex);
        };

        const startSlider = () => {
            stopSlider();
            if (slides.length <= 1 || shouldReduceMotion() || isPausedByHoverControl) return;
            sliderTimer = setInterval(moveToNextSlide, slideIntervalMs);
        };

        if (slides.length > 0) {
            if (dotsWrap) {
                dotsWrap.removeAttribute('aria-hidden');
            }

            slides.forEach((slide, index) => {
                slide.setAttribute('role', 'group');
                slide.setAttribute('aria-label', `${index + 1} / ${slides.length}`);
            });

            dots.forEach((dot, index) => {
                dot.setAttribute('aria-label', `Slide ${index + 1}`);
            });

            setActiveSlide(0);
            startSlider();

            dots.forEach((dot, index) => {
                dot.addEventListener('click', () => {
                    setActiveSlide(index);
                    startSlider();
                });
            });

            pauseOnHoverTargets.forEach((target) => {
                target.addEventListener('mouseenter', () => {
                    isPausedByHoverControl = true;
                    stopSlider();
                });

                target.addEventListener('mouseleave', () => {
                    isPausedByHoverControl = false;
                    startSlider();
                });
            });

            heroSlider.addEventListener('focusin', stopSlider);
            heroSlider.addEventListener('focusout', (event) => {
                if (heroSlider.contains(event.relatedTarget)) return;
                startSlider();
            });
        }

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                stopSlider();
                clearRevealTimers();
                return;
            }

            setActiveSlide(currentSlideIndex);
            startSlider();
        });

        const handleReducedMotionChange = () => {
            setActiveSlide(currentSlideIndex);
            startSlider();
        };

        if (typeof reducedMotionQuery.addEventListener === 'function') {
            reducedMotionQuery.addEventListener('change', handleReducedMotionChange);
        } else if (typeof reducedMotionQuery.addListener === 'function') {
            reducedMotionQuery.addListener(handleReducedMotionChange);
        }
    }


    // Lightbox for gallery
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.querySelector('.lightbox');
    const lightboxImg = lightbox ? lightbox.querySelector('.lightbox-content img') : null;
    const lightboxClose = lightbox ? lightbox.querySelector('.lightbox-close') : null;

    if (galleryItems.length > 0 && lightbox && lightboxImg && lightboxClose) {
        galleryItems.forEach(item => {
            item.addEventListener('click', () => {
                const imgSrc = item.querySelector('img').src;
                lightboxImg.src = imgSrc;
                lightbox.classList.add('show');
            });
        });

        const closeLightbox = () => {
            lightbox.classList.remove('show');
        }

        lightboxClose.addEventListener('click', closeLightbox);
        
        // Close lightbox on clicking the background
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });

        // Close with escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.classList.contains('show')) {
                closeLightbox();
            }
        });
    }

    const existingPhoneAnchor = document.querySelector('a[href^="tel:"]');
    const phoneLink = existingPhoneAnchor?.getAttribute('href') || 'tel:1844-2355';
    const existingKakaoAnchor = Array.from(document.querySelectorAll('a[href]')).find((anchor) => {
        const href = anchor.getAttribute('href') || '';
        return /kakao|KAKAO_CHANNEL_URL/i.test(href);
    });
    const kakaoChannelUrl =
        document.body?.dataset?.kakaoChannelUrl ||
        document.documentElement?.dataset?.kakaoChannelUrl ||
        existingKakaoAnchor?.getAttribute('href') ||
        '{KAKAO_CHANNEL_URL}';

    const labels = {
        quickMenu: '\uBE60\uB978 \uC5F0\uB77D \uBA54\uB274',
        call: '\uC804\uD654',
        callConsult: '\uC804\uD654 \uC0C1\uB2F4',
        kakao: '\uCE74\uD1A1',
        kakaoConsult: '\uCE74\uCE74\uC624\uD1A1 \uC0C1\uB2F4',
        blog: '\uBE14\uB85C\uADF8',
        toTop: 'TOP',
        toTopAction: '\uB9E8 \uC704\uB85C \uC774\uB3D9'
    };

    // Add mobile-only top contact buttons to the header while preserving existing structure.
    const headerContainer = document.querySelector('.header .container');
    if (headerContainer && !headerContainer.querySelector('.mobile-contact-actions')) {
        const mobileContactActions = document.createElement('div');
        mobileContactActions.className = 'mobile-contact-actions';
        mobileContactActions.innerHTML = `
            <a href="${phoneLink}" class="mobile-contact-btn mobile-contact-btn-call" aria-label="${labels.callConsult}">
                <i class="fa-solid fa-phone" aria-hidden="true"></i>
                <span>${labels.call}</span>
            </a>
            <a href="${kakaoChannelUrl}" class="mobile-contact-btn mobile-contact-btn-kakao" aria-label="${labels.kakaoConsult}" target="_blank" rel="noopener noreferrer">
                <i class="fa-solid fa-comment" aria-hidden="true"></i>
                <span>${labels.kakao}</span>
            </a>
        `;

        const hamburgerButton = headerContainer.querySelector('.hamburger');
        if (hamburgerButton) {
            headerContainer.insertBefore(mobileContactActions, hamburgerButton);
        } else {
            headerContainer.appendChild(mobileContactActions);
        }
    }

    // Inject a global floating quick menu if a page does not define one.
    if (!document.querySelector('.quick-menu')) {
        const quickMenuTemplate = `
            <aside class="quick-menu" aria-label="${labels.quickMenu}">
                <ul>
                    <li>
                        <a href="${phoneLink}" class="quick-menu-call" aria-label="${labels.callConsult}">
                            <i class="fa-solid fa-phone" aria-hidden="true"></i>
                            <span>${labels.call}</span>
                        </a>
                    </li>
                    <li>
                        <a href="${kakaoChannelUrl}" class="quick-menu-kakao" target="_blank" rel="noopener noreferrer" aria-label="${labels.kakaoConsult}">
                            <i class="fa-solid fa-comment" aria-hidden="true"></i>
                            <span>${labels.kakao}</span>
                        </a>
                    </li>
                    <li>
                        <a href="https://blog.naver.com/shiny_papa" class="quick-menu-blog" target="_blank" rel="noopener noreferrer" aria-label="${labels.blog}">
                            <i class="fa-solid fa-blog" aria-hidden="true"></i>
                            <span>${labels.blog}</span>
                        </a>
                    </li>
                    <li>
                        <a href="#" class="quick-menu-top" aria-label="${labels.toTopAction}">
                            <i class="fa-solid fa-arrow-up" aria-hidden="true"></i>
                            <span>${labels.toTop}</span>
                        </a>
                    </li>
                </ul>
            </aside>
        `;
        document.body.insertAdjacentHTML('beforeend', quickMenuTemplate);
    }
    const quickMenu = document.querySelector('.quick-menu');
    if (quickMenu) {
        const phoneQuickLink = quickMenu.querySelector('a[href^="tel:"]');
        if (phoneQuickLink) {
            phoneQuickLink.href = phoneLink;
            phoneQuickLink.classList.add('quick-menu-call');
        }

        const kakaoIcon = quickMenu.querySelector('.fa-comment');
        const kakaoQuickLink = kakaoIcon ? kakaoIcon.closest('a') : null;
        if (kakaoQuickLink) {
            kakaoQuickLink.href = kakaoChannelUrl;
            kakaoQuickLink.target = '_blank';
            kakaoQuickLink.rel = 'noopener noreferrer';
            kakaoQuickLink.classList.add('quick-menu-kakao');
        }

        // Keep the floating quick menu quieter in the first viewport.
        const syncQuickMenuTone = () => {
            const firstViewHeight = window.innerHeight * 0.9;
            quickMenu.classList.toggle('is-quiet', window.scrollY < firstViewHeight);
        };

        syncQuickMenuTone();
        window.addEventListener('scroll', syncQuickMenuTone, { passive: true });
        window.addEventListener('resize', syncQuickMenuTone);
    }

    // Floating 'Top' button
    const topButton = document.querySelector('.quick-menu-top');
    if (topButton) {
        topButton.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

});
