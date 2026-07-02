const MOBILE_NAV_QUERY = '(max-width: 992px)';
const KAKAO_PLACEHOLDER = '{KAKAO_CHANNEL_URL}';

const labels = {
    quickMenu: '빠른 연락 메뉴',
    call: '전화',
    callConsult: '전화 상담',
    kakao: '카톡',
    kakaoConsult: '카카오톡 상담',
    blog: '블로그',
    toTop: 'TOP',
    toTopAction: '맨 위로 이동',
};

const isKakaoPlaceholder = (href) => {
    if (!href) return false;
    return href.includes(KAKAO_PLACEHOLDER) || href.trim() === '';
};

const getContactConfig = () => {
    const existingPhoneAnchor = document.querySelector('a[href^="tel:"]');
    const existingKakaoAnchor = Array.from(document.querySelectorAll('a[href]')).find((anchor) => {
        const href = anchor.getAttribute('href') || '';
        return /kakao|KAKAO_CHANNEL_URL/i.test(href);
    });

    return {
        phoneLink: existingPhoneAnchor?.getAttribute('href') || 'tel:1844-2355',
        kakaoChannelUrl:
            document.body?.dataset?.kakaoChannelUrl ||
            document.documentElement?.dataset?.kakaoChannelUrl ||
            existingKakaoAnchor?.getAttribute('href') ||
            KAKAO_PLACEHOLDER,
    };
};

const initHeaderScroll = () => {
    const header = document.querySelector('.header');
    if (!header) return;

    const syncHeader = () => {
        header.classList.toggle('scrolled', window.scrollY > 50);
    };

    syncHeader();
    window.addEventListener('scroll', syncHeader, { passive: true });
};

const initMobileMenu = () => {
    const header = document.querySelector('.header');
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    if (!header || !hamburger || !navMenu) return;

    const mobileMediaQuery = window.matchMedia(MOBILE_NAV_QUERY);
    const hamburgerIcon = hamburger.querySelector('i');
    const dropdownItems = Array.from(navMenu.querySelectorAll(':scope > li.dropdown'));
    const closingTimers = new WeakMap();
    const isMobileView = () => mobileMediaQuery.matches;

    if (!navMenu.id) {
        navMenu.id = 'primary-navigation';
    }

    hamburger.setAttribute('aria-controls', navMenu.id);
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', '메뉴 열기');

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

    const closeDropdown = (item) => {
        const subMenu = item.querySelector(':scope > .sub-menu');
        const toggleButton = item.querySelector(':scope > .dropdown-toggle');
        const triggerLink = item.querySelector(':scope > a');
        if (!subMenu || !toggleButton) return;

        const closeTimer = closingTimers.get(item);
        if (closeTimer) {
            window.clearTimeout(closeTimer);
            closingTimers.delete(item);
        }

        const menuLabel = triggerLink ? triggerLink.textContent.trim() : '메뉴';
        toggleButton.setAttribute('aria-expanded', 'false');
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
        }, 250);
        closingTimers.set(item, nextTimer);
    };

    const closeAllDropdowns = (exceptItem = null) => {
        dropdownItems.forEach((item) => {
            if (item !== exceptItem) closeDropdown(item);
        });
    };

    const syncDropdownStateByViewport = () => {
        dropdownItems.forEach((item) => {
            const subMenu = item.querySelector(':scope > .sub-menu');
            const toggleButton = item.querySelector(':scope > .dropdown-toggle');
            if (!subMenu || !toggleButton) return;

            if (isMobileView()) {
                const isOpen = item.classList.contains('is-open');
                subMenu.style.maxHeight = isOpen ? `${subMenu.scrollHeight}px` : '0px';
                setSubMenuAccessibility(subMenu, isOpen, true);
                return;
            }

            item.classList.remove('is-open', 'is-closing');
            toggleButton.setAttribute('aria-expanded', 'false');
            subMenu.style.removeProperty('max-height');
            setSubMenuAccessibility(subMenu, true);
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

        const toggleItem = () => {
            if (item.classList.contains('is-open')) {
                closeDropdown(item);
            } else {
                openItem();
            }
        };

        toggleButton.addEventListener('click', (event) => {
            if (!isMobileView()) return;
            event.preventDefault();
            event.stopPropagation();
            toggleItem();
        });

        triggerLink.addEventListener('click', (event) => {
            if (!isMobileView() || item.classList.contains('is-open')) return;
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

    hamburger.addEventListener('click', () => {
        setMenuOpenState(!navMenu.classList.contains('active'));
    });

    navMenu.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
            if (isMobileView()) setMenuOpenState(false);
        });
    });

    document.addEventListener('click', (event) => {
        if (!isMobileView() || !navMenu.classList.contains('active')) return;
        if (header.contains(event.target)) return;
        setMenuOpenState(false);
    });

    window.addEventListener('resize', () => {
        if (!isMobileView()) setMenuOpenState(false);
        syncDropdownStateByViewport();
    });

    syncDropdownStateByViewport();
};

const initLinkGuards = () => {
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
};

const initHeroSlider = () => {
    const heroSlider = document.querySelector('.hero-slider');
    if (!heroSlider) return;

    heroSlider.classList.add('is-sequenced');

    const slides = Array.from(heroSlider.querySelectorAll('.hero-slide'));
    const dots = Array.from(heroSlider.querySelectorAll('.hero-slider-dots button'));
    const pauseOnHoverTargets = Array.from(heroSlider.querySelectorAll('.hero-cta-btn, .hero-slider-dots button'));
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
        window.clearTimeout(textRevealTimer);
        window.clearTimeout(ctaRevealTimer);
        textRevealTimer = null;
        ctaRevealTimer = null;
    };

    const stopSlider = () => {
        window.clearInterval(sliderTimer);
        sliderTimer = null;
    };

    const revealActiveSlideSequence = (slideIndex) => {
        clearRevealTimers();
        const textDelay = shouldReduceMotion() ? 0 : textRevealDelayMs;
        const ctaDelay = shouldReduceMotion() ? 0 : textRevealDelayMs + ctaRevealDelayAfterTextMs;

        textRevealTimer = window.setTimeout(() => {
            const slide = slides[slideIndex];
            if (slide && slideIndex === currentSlideIndex && slide.classList.contains('is-active')) {
                slide.classList.add('is-text-visible');
            }
            textRevealTimer = null;
        }, textDelay);

        ctaRevealTimer = window.setTimeout(() => {
            const slide = slides[slideIndex];
            if (slide && slideIndex === currentSlideIndex && slide.classList.contains('is-active')) {
                slide.classList.add('is-cta-visible');
            }
            ctaRevealTimer = null;
        }, ctaDelay);
    };

    const setActiveSlide = (nextIndex) => {
        clearRevealTimers();
        slides.forEach((slide, index) => {
            const isTarget = index === nextIndex;
            slide.classList.toggle('is-active', isTarget);
            slide.classList.remove('is-text-visible', 'is-cta-visible');
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

    const startSlider = () => {
        stopSlider();
        if (slides.length <= 1 || shouldReduceMotion() || isPausedByHoverControl) return;
        sliderTimer = window.setInterval(() => {
            setActiveSlide((currentSlideIndex + 1) % slides.length);
        }, slideIntervalMs);
    };

    if (slides.length === 0) return;

    dotsWrap?.removeAttribute('aria-hidden');
    slides.forEach((slide, index) => {
        slide.setAttribute('role', 'group');
        slide.setAttribute('aria-label', `${index + 1} / ${slides.length}`);
    });
    dots.forEach((dot, index) => {
        dot.setAttribute('aria-label', `Slide ${index + 1}`);
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
        if (!heroSlider.contains(event.relatedTarget)) startSlider();
    });

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

    setActiveSlide(0);
    startSlider();
};

const initGallery = () => {
    const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
    const lightbox = document.querySelector('.lightbox');
    const lightboxImg = lightbox?.querySelector('.lightbox-content img');
    const lightboxClose = lightbox?.querySelector('.lightbox-close');
    if (galleryItems.length === 0 || !lightbox || !lightboxImg || !lightboxClose) return;

    const closeLightbox = () => {
        lightbox.classList.remove('show');
    };

    galleryItems.forEach((item) => {
        item.addEventListener('click', () => {
            const image = item.querySelector('img');
            if (!image) return;
            lightboxImg.src = image.src;
            lightboxImg.alt = image.alt || '';
            lightbox.classList.add('show');
        });
    });

    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (event) => {
        if (event.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && lightbox.classList.contains('show')) closeLightbox();
    });
};

const initPortfolio = ({ phoneLink, kakaoChannelUrl }) => {
    const filterWrap = document.querySelector('.portfolio-filters');
    const portfolioCards = Array.from(document.querySelectorAll('.portfolio-card[data-case-id]'));
    const galleryItems = Array.from(document.querySelectorAll('.portfolio-gallery-item[data-gallery-id]'));
    if (!filterWrap || portfolioCards.length === 0) return;

    const filterButtons = Array.from(filterWrap.querySelectorAll('[data-category]'));
    const emptyState = document.querySelector('.portfolio-empty-state');
    const loadMoreButton = document.querySelector('[data-portfolio-load-more]');
    const visibleStep = 6;
    const hideTimers = new WeakMap();
    let activeCategory = 'all';
    let visibleLimit = visibleStep;
    let lastFocusedElement = null;
    let activeModal = null;

    const matchesCategory = (element, category) => category === 'all' || element.dataset.category === category;

    const setFilterVisibility = (element, shouldShow) => {
        const timer = hideTimers.get(element);
        if (timer) {
            window.clearTimeout(timer);
            hideTimers.delete(element);
        }

        if (shouldShow) {
            element.hidden = false;
            window.requestAnimationFrame(() => element.classList.remove('is-filter-hiding'));
            return;
        }

        element.classList.add('is-filter-hiding');
        const nextTimer = window.setTimeout(() => {
            element.hidden = true;
            hideTimers.delete(element);
        }, 180);
        hideTimers.set(element, nextTimer);
    };

    const applyPortfolioFilter = () => {
        const matchingCards = portfolioCards.filter((card) => matchesCategory(card, activeCategory));
        let shownCount = 0;

        portfolioCards.forEach((card) => {
            const shouldShow = matchesCategory(card, activeCategory) && shownCount < visibleLimit;
            if (shouldShow) shownCount += 1;
            setFilterVisibility(card, shouldShow);
        });

        galleryItems.forEach((item) => setFilterVisibility(item, matchesCategory(item, activeCategory)));
        if (emptyState) emptyState.hidden = matchingCards.length !== 0;
        if (loadMoreButton) loadMoreButton.hidden = matchingCards.length <= visibleLimit;
    };

    const setActiveFilter = (category) => {
        activeCategory = category;
        visibleLimit = visibleStep;
        filterButtons.forEach((button) => {
            const isActive = button.dataset.category === category;
            button.classList.toggle('is-active', isActive);
            button.setAttribute('aria-pressed', String(isActive));
        });
        applyPortfolioFilter();
    };

    const closePortfolioModal = () => {
        if (!activeModal) return;
        activeModal.remove();
        activeModal = null;
        document.body.classList.remove('portfolio-modal-open');
        lastFocusedElement?.focus?.({ preventScroll: true });
        lastFocusedElement = null;
    };

    const createPortfolioModal = ({ className = '', labelledBy, bodyHtml }) => {
        closePortfolioModal();
        lastFocusedElement = document.activeElement;

        const modal = document.createElement('div');
        modal.className = `portfolio-modal ${className}`.trim();
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', labelledBy);
        modal.innerHTML = `
            <div class="portfolio-modal-dialog" role="document">
                <button type="button" class="portfolio-modal-close" aria-label="상세 보기 닫기">
                    <i class="fa-solid fa-xmark" aria-hidden="true"></i>
                </button>
                ${bodyHtml}
            </div>
        `;

        modal.addEventListener('click', (event) => {
            if (event.target === modal) closePortfolioModal();
        });
        modal.querySelector('.portfolio-modal-close')?.addEventListener('click', closePortfolioModal);

        document.body.appendChild(modal);
        document.body.classList.add('portfolio-modal-open');
        activeModal = modal;
        modal.querySelector('.portfolio-modal-close')?.focus({ preventScroll: true });
    };

    const escapeHtml = (value) => {
        const template = document.createElement('template');
        template.textContent = value || '';
        return template.innerHTML;
    };

    const openCaseModal = (card) => {
        const image = card.querySelector('.portfolio-card-media img');
        const badge = card.querySelector('.portfolio-badge')?.textContent.trim() || '';
        const kicker = card.querySelector('.portfolio-card-kicker')?.textContent.trim() || '';
        const title = card.querySelector('h3')?.textContent.trim() || '사업실적 상세';
        const description = card.querySelector('.portfolio-card-body > p:not(.portfolio-card-kicker)')?.textContent.trim() || '';
        const tags = Array.from(card.querySelectorAll('.portfolio-tags span')).map((tag) => tag.textContent.trim());
        const modalTitleId = `portfolio-modal-title-${card.dataset.caseId || Date.now()}`;

        createPortfolioModal({
            labelledBy: modalTitleId,
            bodyHtml: `
                <figure class="portfolio-modal-media">
                    <img src="${escapeHtml(image?.getAttribute('src') || '')}" alt="${escapeHtml(image?.getAttribute('alt') || title)}">
                </figure>
                <div class="portfolio-modal-body">
                    <span class="portfolio-badge">${escapeHtml(badge)}</span>
                    <p class="portfolio-card-kicker">${escapeHtml(kicker)}</p>
                    <h2 id="${escapeHtml(modalTitleId)}">${escapeHtml(title)}</h2>
                    <p>${escapeHtml(description)}</p>
                    <div class="portfolio-tags" aria-label="사례 태그">
                        ${tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}
                    </div>
                    <div class="portfolio-modal-actions">
                        <a href="${escapeHtml(phoneLink)}" class="btn btn-primary"><i class="fa-solid fa-phone" aria-hidden="true"></i> 전화 상담</a>
                        <a href="${escapeHtml(kakaoChannelUrl)}" class="btn btn-secondary" target="_blank" rel="noopener noreferrer"><i class="fa-solid fa-comment" aria-hidden="true"></i> 카카오톡 상담</a>
                    </div>
                </div>
            `,
        });
    };

    const openGalleryModal = (item) => {
        const image = item.querySelector('img');
        const caption = image?.getAttribute('alt') || item.querySelector('figcaption span')?.textContent.trim() || '현장 이미지';
        const modalTitleId = `portfolio-gallery-title-${item.dataset.galleryId || Date.now()}`;

        createPortfolioModal({
            className: 'portfolio-gallery-modal',
            labelledBy: modalTitleId,
            bodyHtml: `
                <figure class="portfolio-modal-media">
                    <img src="${escapeHtml(image?.getAttribute('src') || '')}" alt="${escapeHtml(caption)}">
                </figure>
                <div class="portfolio-modal-body">
                    <p id="${escapeHtml(modalTitleId)}">${escapeHtml(caption)}</p>
                </div>
            `,
        });
    };

    filterButtons.forEach((button) => {
        button.setAttribute('aria-pressed', String(button.classList.contains('is-active')));
        button.addEventListener('click', () => setActiveFilter(button.dataset.category || 'all'));
    });

    portfolioCards.forEach((card) => {
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.addEventListener('click', () => openCaseModal(card));
        card.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openCaseModal(card);
            }
        });
    });

    galleryItems.forEach((item) => {
        item.setAttribute('tabindex', '0');
        item.setAttribute('role', 'button');
        item.addEventListener('click', () => openGalleryModal(item));
        item.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openGalleryModal(item);
            }
        });
    });

    loadMoreButton?.addEventListener('click', () => {
        visibleLimit += visibleStep;
        applyPortfolioFilter();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closePortfolioModal();
    });

    setActiveFilter(filterButtons.find((button) => button.classList.contains('is-active'))?.dataset.category || 'all');
};

const initMobileContactActions = ({ phoneLink, kakaoChannelUrl }) => {
    const headerContainer = document.querySelector('.header .container');
    if (!headerContainer || headerContainer.querySelector('.mobile-contact-actions')) return;

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
};

const initQuickMenu = ({ phoneLink, kakaoChannelUrl }) => {
    if (!document.querySelector('.quick-menu')) {
        document.body.insertAdjacentHTML('beforeend', `
            <aside class="quick-menu" aria-label="${labels.quickMenu}">
                <ul>
                    <li><a href="${phoneLink}" class="quick-menu-call" aria-label="${labels.callConsult}"><i class="fa-solid fa-phone" aria-hidden="true"></i><span>${labels.call}</span></a></li>
                    <li><a href="${kakaoChannelUrl}" class="quick-menu-kakao" target="_blank" rel="noopener noreferrer" aria-label="${labels.kakaoConsult}"><i class="fa-solid fa-comment" aria-hidden="true"></i><span>${labels.kakao}</span></a></li>
                    <li><a href="https://blog.naver.com/shiny_papa" class="quick-menu-blog" target="_blank" rel="noopener noreferrer" aria-label="${labels.blog}"><i class="fa-solid fa-blog" aria-hidden="true"></i><span>${labels.blog}</span></a></li>
                    <li><a href="#" class="quick-menu-top" aria-label="${labels.toTopAction}"><i class="fa-solid fa-arrow-up" aria-hidden="true"></i><span>${labels.toTop}</span></a></li>
                </ul>
            </aside>
        `);
    }

    const quickMenu = document.querySelector('.quick-menu');
    if (!quickMenu) return;

    const phoneQuickLink = quickMenu.querySelector('a[href^="tel:"]');
    if (phoneQuickLink) {
        phoneQuickLink.href = phoneLink;
        phoneQuickLink.classList.add('quick-menu-call');
    }

    const kakaoQuickLink = quickMenu.querySelector('.fa-comment')?.closest('a');
    if (kakaoQuickLink) {
        kakaoQuickLink.href = kakaoChannelUrl;
        kakaoQuickLink.target = '_blank';
        kakaoQuickLink.rel = 'noopener noreferrer';
        kakaoQuickLink.classList.add('quick-menu-kakao');
    }

    const syncQuickMenuTone = () => {
        const firstViewHeight = window.innerHeight * 0.9;
        quickMenu.classList.toggle('is-quiet', window.scrollY < firstViewHeight);
    };

    syncQuickMenuTone();
    window.addEventListener('scroll', syncQuickMenuTone, { passive: true });
    window.addEventListener('resize', syncQuickMenuTone);
};

const initTopButton = () => {
    const topButton = document.querySelector('.quick-menu-top');
    topButton?.addEventListener('click', (event) => {
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
};

document.addEventListener('DOMContentLoaded', () => {
    const contactConfig = getContactConfig();

    initHeaderScroll();
    initMobileMenu();
    initLinkGuards();
    initHeroSlider();
    initGallery();
    initPortfolio(contactConfig);
    initMobileContactActions(contactConfig);
    initQuickMenu(contactConfig);
    initTopButton();
});
