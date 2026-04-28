/* ============================================ */

(function () {
    'use strict';

    // =============================================
    const preloader = document.querySelector('.preloader');
    if (preloader) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                preloader.classList.add('hide');
                document.body.classList.remove('loading');
                initAfterLoad();
            }, 2400);
        });
    } else {
        document.addEventListener('DOMContentLoaded', initAfterLoad);
    }

    function initAfterLoad() {
        initParticles();
        initHeroTextReveal();
        initScrollAnimations();
        initCounterAnimation();
        initMagneticButtons();
    }

    // =============================================

    function initParticles() {
        const canvas = document.getElementById('particle-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let particles = [];
        let mouse = { x: -1000, y: -1000 };
        let animationId;

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resize();
        window.addEventListener('resize', resize);

        document.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });

        class Particle {
            constructor() {
                this.reset();
            }

            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 1.5 + 0.5;
                this.speedX = (Math.random() - 0.5) * 0.3;
                this.speedY = (Math.random() - 0.5) * 0.3;
                this.opacity = Math.random() * 0.5 + 0.1;
                this.opacitySpeed = (Math.random() - 0.5) * 0.005;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                this.opacity += this.opacitySpeed;

                if (this.opacity <= 0.05 || this.opacity >= 0.6) {
                    this.opacitySpeed *= -1;
                }

                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 150) {
                    const force = (150 - dist) / 150;
                    this.x -= (dx / dist) * force * 0.8;
                    this.y -= (dy / dist) * force * 0.8;
                }

                if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
                if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(212, 175, 55, ${this.opacity})`;
                ctx.fill();
            }
        }

        const particleCount = Math.min(80, Math.floor((canvas.width * canvas.height) / 15000));
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        function connectParticles() {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 120) {
                        const opacity = (1 - dist / 120) * 0.15;
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(212, 175, 55, ${opacity})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            connectParticles();
            animationId = requestAnimationFrame(animate);
        }

        animate();
    }

    // =============================================

    const cursorGlow = document.querySelector('.cursor-glow');
    const interactives = document.querySelectorAll('a, button, .tilt-element, .view-details-btn, .logo, .close-btn, .btn');

    let cursorX = -100, cursorY = -100;
    let glowX = -100, glowY = -100;
    let sparkleTimer = 0;

    document.addEventListener('mousemove', (e) => {
        cursorX = e.clientX;
        cursorY = e.clientY;
        sparkleTimer++;

        if (sparkleTimer % 4 === 0) {
            createSparkle(e.clientX, e.clientY);
        }
    });

    function smoothGlow() {
        glowX += (cursorX - glowX) * 0.15;
        glowY += (cursorY - glowY) * 0.15;

        if (cursorGlow) {
            cursorGlow.style.left = glowX + 'px';
            cursorGlow.style.top = glowY + 'px';
        }
        requestAnimationFrame(smoothGlow);
    }
    smoothGlow();

    function createSparkle(x, y) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.style.left = (x + (Math.random() - 0.5) * 20) + 'px';
        sparkle.style.top = (y + (Math.random() - 0.5) * 20) + 'px';
        sparkle.style.width = (Math.random() * 3 + 2) + 'px';
        sparkle.style.height = sparkle.style.width;
        document.body.appendChild(sparkle);
        setTimeout(() => sparkle.remove(), 800);
    }

    interactives.forEach(item => {
        item.addEventListener('mouseenter', () => {
            if (cursorGlow) cursorGlow.classList.add('active');
        });
        item.addEventListener('mouseleave', () => {
            if (cursorGlow) cursorGlow.classList.remove('active');
        });
    });

    // =============================================

    function initHeroTextReveal() {
        const glowTexts = document.querySelectorAll('.glow-text');
        glowTexts.forEach(el => {
            if (el.dataset.animated) return;
            el.dataset.animated = 'true';

            const fragment = document.createDocumentFragment();
            const childNodes = Array.from(el.childNodes);
            let wordIndex = 0;

            function wrapWord(text, extraClass) {
                const wordSpan = document.createElement('span');
                wordSpan.className = 'word';
                const inner = document.createElement('span');
                inner.className = 'word-inner';

                if (extraClass) {
                    const styled = document.createElement('span');
                    styled.className = extraClass;
                    styled.textContent = text;
                    inner.appendChild(styled);
                } else {
                    inner.textContent = text;
                }

                wordSpan.appendChild(inner);

                const delay = wordIndex * 100;
                setTimeout(() => inner.classList.add('revealed'), 500 + delay);
                wordIndex++;

                return wordSpan;
            }

            function processTextContent(text, extraClass, target) {
                const parts = text.split(/(\s+)/);
                parts.forEach(part => {
                    if (/^\s+$/.test(part)) {
                        target.appendChild(document.createTextNode(' '));
                    } else if (part.length > 0) {
                        target.appendChild(wrapWord(part, extraClass));
                        target.appendChild(document.createTextNode(' '));
                    }
                });
            }

            childNodes.forEach(node => {
                if (node.nodeType === Node.TEXT_NODE) {
                    processTextContent(node.textContent, null, fragment);
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                    if (node.tagName === 'BR') {
                        fragment.appendChild(document.createElement('br'));
                    } else if (node.tagName === 'SPAN') {
                        processTextContent(node.textContent, node.className, fragment);
                    }
                }
            });

            el.innerHTML = '';
            el.appendChild(fragment);
        });
    }

    // =============================================
    const globalCard = document.getElementById('global-3d-card');
    const cardGlare = document.getElementById('card-glare');
    const cardWrapper = document.querySelector('.opening-card-wrapper');
    const fireCanvas = document.getElementById('card-fire');
    const runeOrbit = document.getElementById('rune-orbit');

    // 
    let cardMouseGlow = null;
    if (globalCard) {
        cardMouseGlow = document.createElement('div');
        cardMouseGlow.className = 'card-mouse-glow';
        globalCard.appendChild(cardMouseGlow);
    }

    // 
    let mouseNear = false;
    document.addEventListener('mousemove', (e) => {
        if (!globalCard || !cardWrapper) return;

        const wrapperRect = cardWrapper.getBoundingClientRect();
        const wCx = wrapperRect.left + wrapperRect.width / 2;
        const wCy = wrapperRect.top + wrapperRect.height / 2;
        const distToCard = Math.sqrt((e.clientX - wCx) ** 2 + (e.clientY - wCy) ** 2);

        const isNear = distToCard < 400;
        if (isNear !== mouseNear) {
            mouseNear = isNear;
            cardWrapper.classList.toggle('mouse-near', isNear);
        }

        // 
        const mouseX = e.clientX - wCx;
        const mouseY = e.clientY - wCy;
        const maxDist = Math.max(window.innerWidth, window.innerHeight) / 2;
        const rotateX = (mouseY / maxDist) * -12;
        const rotateY = (mouseX / maxDist) * 12;

        globalCard.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

        // 
        if (cardGlare) {
            const normX = (mouseX / maxDist) * 50 + 50;
            const normY = (mouseY / maxDist) * 50 + 50;
            cardGlare.style.backgroundPosition = `${normX}% ${normY}%`;
        }

        // 
        if (cardMouseGlow) {
            const cardRect = globalCard.getBoundingClientRect();
            const localX = e.clientX - cardRect.left;
            const localY = e.clientY - cardRect.top;
            cardMouseGlow.style.left = localX + 'px';
            cardMouseGlow.style.top = localY + 'px';
        }

        // 
        if (runeOrbit) {
            const runes = runeOrbit.querySelectorAll('.rune');
            runes.forEach(rune => {
                const rRect = rune.getBoundingClientRect();
                const rCx = rRect.left + rRect.width / 2;
                const rCy = rRect.top + rRect.height / 2;
                const d = Math.sqrt((e.clientX - rCx) ** 2 + (e.clientY - rCy) ** 2);
                rune.classList.toggle('glow', d < 100);
            });
        }
    });

    // =============================================
    if (fireCanvas && globalCard) {
        const fCtx = fireCanvas.getContext('2d');
        let embers = [];
        let fMouse = { x: 0, y: 0 };

        function resizeFireCanvas() {
            const wrapper = fireCanvas.parentElement;
            const rect = wrapper.getBoundingClientRect();
            fireCanvas.width = rect.width + 120;
            fireCanvas.height = rect.height + 120;
        }
        resizeFireCanvas();
        window.addEventListener('resize', resizeFireCanvas);

        document.addEventListener('mousemove', (e) => {
            const rect = fireCanvas.getBoundingClientRect();
            fMouse.x = e.clientX - rect.left;
            fMouse.y = e.clientY - rect.top;
        });

        class Ember {
            constructor() { this.reset(); }

            reset() {
                const cw = fireCanvas.width;
                const ch = fireCanvas.height;
                const side = Math.floor(Math.random() * 4);

                if (side === 0) { this.x = 60 + Math.random() * (cw - 120); this.y = ch - 60; }
                else if (side === 1) { this.x = 60; this.y = 60 + Math.random() * (ch - 120); }
                else if (side === 2) { this.x = cw - 60; this.y = 60 + Math.random() * (ch - 120); }
                else { this.x = 60 + Math.random() * (cw - 120); this.y = 60; }

                this.size = 1 + Math.random() * 2.5;
                this.speedX = (Math.random() - 0.5) * 0.5;
                this.speedY = -(0.3 + Math.random() * 0.8);
                this.life = 1;
                this.decay = 0.005 + Math.random() * 0.01;
                this.hue = 35 + Math.random() * 15;
                this.flicker = Math.random() * Math.PI * 2;
            }

            update() {
                // Wind from mouse
                const dx = fMouse.x - this.x;
                const dy = fMouse.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    const force = (120 - dist) / 120;
                    this.speedX -= (dx / dist) * force * 0.15;
                    this.speedY -= (dy / dist) * force * 0.1;
                }

                this.x += this.speedX;
                this.y += this.speedY;
                this.speedX *= 0.99;
                this.life -= this.decay;
                this.flicker += 0.2;
            }

            draw() {
                const flickerAlpha = 0.5 + Math.sin(this.flicker) * 0.3;
                const alpha = this.life * flickerAlpha;
                if (alpha <= 0) return;

                fCtx.beginPath();
                fCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                fCtx.fillStyle = `hsla(${this.hue}, 80%, 55%, ${alpha})`;
                fCtx.fill();

                fCtx.beginPath();
                fCtx.arc(this.x, this.y, this.size * 2.5, 0, Math.PI * 2);
                fCtx.fillStyle = `hsla(${this.hue}, 90%, 50%, ${alpha * 0.15})`;
                fCtx.fill();
            }
        }

        function animateFire() {
            fCtx.clearRect(0, 0, fireCanvas.width, fireCanvas.height);

            if (embers.length < (mouseNear ? 60 : 25)) {
                embers.push(new Ember());
            }

            for (let i = embers.length - 1; i >= 0; i--) {
                embers[i].update();
                embers[i].draw();
                if (embers[i].life <= 0) {
                    embers[i].reset();
                }
            }

            requestAnimationFrame(animateFire);
        }

        for (let i = 0; i < 25; i++) embers.push(new Ember());
        animateFire();
    }

    // 
    if (runeOrbit) {
        const runes = runeOrbit.querySelectorAll('.rune');
        const total = runes.length;
        let orbitAngle = 0;

        function updateRunePositions() {
            const w = runeOrbit.offsetWidth;
            const h = runeOrbit.offsetHeight;
            const cx = w / 2;
            const cy = h / 2;
            const rx = cx - 10;
            const ry = cy - 10;
            const speed = mouseNear ? 0.008 : 0.003;
            orbitAngle += speed;

            runes.forEach((rune, i) => {
                const angle = orbitAngle + (i / total) * Math.PI * 2;
                const x = cx + Math.cos(angle) * rx;
                const y = cy + Math.sin(angle) * ry;
                rune.style.left = x + 'px';
                rune.style.top = y + 'px';
                rune.style.transform = `translate(-50%, -50%) ${rune.classList.contains('glow') ? 'scale(1.4)' : 'scale(1)'}`;
                rune.style.animation = 'none';
            });

            requestAnimationFrame(updateRunePositions);
        }
        updateRunePositions();
    }

    // =============================================
    const tiltElements = document.querySelectorAll('.tilt-element');

    tiltElements.forEach(element => {
        element.addEventListener('mousemove', (e) => {
            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const dragX = ((x - centerX) / centerX) * 4;
            const dragY = ((y - centerY) / centerY) * 4;
            const rotateX = ((y - centerY) / centerY) * -4;
            const rotateY = ((x - centerX) / centerX) * 4;
            const scale = element.classList.contains('btn') || element.classList.contains('logo') ? 1.03 : 1.01;

            element.style.transform = `perspective(1000px) translate3d(${dragX}px, ${dragY}px, 0) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`;
        });

        element.addEventListener('mouseleave', () => {
            element.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
            element.style.transform = `perspective(1000px) translate3d(0,0,0) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)`;
            setTimeout(() => { element.style.transition = 'transform 0.1s ease'; }, 600);
        });
    });

    // =============================================
    function initMagneticButtons() {
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
                btn.style.transform = 'translate(0, 0)';
                setTimeout(() => { btn.style.transition = ''; }, 400);
            });
        });
    }

    // =============================================
    const modal = document.getElementById('project-modal');
    const detailButtons = document.querySelectorAll('.view-details-btn');
    const closeBtn = document.querySelector('.close-btn');
    const modalTitle = document.getElementById('modal-title');
    const modalTech = document.getElementById('modal-tech');
    const modalDesc = document.getElementById('modal-desc');
    const modalImg = document.getElementById('modal-img');

    detailButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const card = e.target.closest('.project-card');
            if (modalTitle) modalTitle.textContent = card.getAttribute('data-title');
            if (modalTech) modalTech.textContent = card.getAttribute('data-tech');
            if (modalDesc) modalDesc.textContent = card.getAttribute('data-desc');
            if (modalImg) modalImg.src = card.getAttribute('data-image');
            if (modal) modal.classList.add('show-modal');
            document.body.style.overflow = 'hidden';
        });
    });

    function closeModal() {
        if (modal) modal.classList.remove('show-modal');
        document.body.style.overflow = '';
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });

    // =============================================
    function initScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('show-element');
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        document.querySelectorAll('.hidden-element').forEach(el => observer.observe(el));
    }

    // =============================================
    const header = document.querySelector('.modern-header');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;

        if (header) {
            if (currentScroll > 80) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }

            if (currentScroll > lastScroll && currentScroll > 400) {
                header.classList.add('hidden-header');
            } else {
                header.classList.remove('hidden-header');
            }
        }

        lastScroll = currentScroll;
    });

    // =============================================
    function initCounterAnimation() {
        const counters = document.querySelectorAll('[data-count]');

        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.dataset.counted) {
                    entry.target.dataset.counted = 'true';
                    const target = parseInt(entry.target.dataset.count);
                    const duration = 2000;
                    const start = performance.now();

                    function updateCounter(now) {
                        const elapsed = now - start;
                        const progress = Math.min(elapsed / duration, 1);
                        const eased = 1 - Math.pow(1 - progress, 4);
                        entry.target.textContent = Math.floor(eased * target);

                        if (progress < 1) {
                            requestAnimationFrame(updateCounter);
                        } else {
                            entry.target.textContent = target;
                        }
                    }
                    requestAnimationFrame(updateCounter);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(c => counterObserver.observe(c));
    }

    // =============================================
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');

    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            mobileMenu.classList.toggle('open');
            document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
        });

        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                mobileMenu.classList.remove('open');
                document.body.style.overflow = '';
            });
        });
    }

    // =============================================
    const swordTransition = document.querySelector('.sword-transition');
    const internalLinks = document.querySelectorAll('a[href$=".html"]');

    function createSlashSparks() {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;

        for (let i = 0; i < 24; i++) {
            const spark = document.createElement('div');
            spark.className = 'slash-spark';

            const angle = (Math.random() - 0.5) * Math.PI;
            const dist = 60 + Math.random() * 180;
            const sx = Math.cos(angle) * dist;
            const sy = Math.sin(angle) * dist - Math.random() * 80;

            spark.style.left = (cx + (Math.random() - 0.5) * 100) + 'px';
            spark.style.top = (cy + (Math.random() - 0.5) * 100) + 'px';
            spark.style.width = (2 + Math.random() * 4) + 'px';
            spark.style.height = spark.style.width;
            spark.style.setProperty('--sx', sx + 'px');
            spark.style.setProperty('--sy', sy + 'px');
            spark.style.animationDelay = (Math.random() * 0.15) + 's';

            document.body.appendChild(spark);
            requestAnimationFrame(() => spark.classList.add('animate'));
            setTimeout(() => spark.remove(), 900);
        }
    }

    internalLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (!href || href.startsWith('http') || href.startsWith('#')) return;

            e.preventDefault();

            if (swordTransition) {
                swordTransition.classList.add('active');
                setTimeout(createSlashSparks, 100);
                setTimeout(() => {
                    window.location.href = href;
                }, 650);
            } else {
                window.location.href = href;
            }
        });
    });

    // =============================================
    document.addEventListener('DOMContentLoaded', () => {
        document.body.style.opacity = '0';
        requestAnimationFrame(() => {
            document.body.style.transition = 'opacity 0.6s ease';
            document.body.style.opacity = '1';
        });
    });

})();
