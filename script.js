
        /* --- Clean & Lag-Free Particle Background for Hero --- */
        const canvas = document.getElementById('hero-canvas');
        const ctx = canvas.getContext('2d');
        const heroSection = document.getElementById('hero-section');
        
        let width, height;
        let particles = [];
        const mouse = { x: -9999, y: -9999 };

        function resize() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = heroSection.offsetHeight;
        }
        window.addEventListener('resize', resize);
        resize();

        // Track mouse position over the hero section (Mouse + Touch)
        function updateMousePos(e) {
            const rect = heroSection.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            mouse.x = clientX - rect.left;
            mouse.y = clientY - rect.top;
        }
        heroSection.addEventListener('mousemove', updateMousePos);
        heroSection.addEventListener('touchmove', updateMousePos, { passive: true });
        
        function clearMousePos() {
            mouse.x = -9999;
            mouse.y = -9999;
        }
        heroSection.addEventListener('mouseleave', clearMousePos);
        heroSection.addEventListener('touchend', clearMousePos);

        // Particle Class
        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.size = Math.random() * 1.5 + 0.5;
                this.vx = (Math.random() - 0.5) * 0.4;
                this.vy = (Math.random() - 0.5) * 0.4;
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;
                
                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;

                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 120) {
                    this.x -= dx * 0.015;
                    this.y -= dy * 0.015;
                }
            }
            draw() {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Initialize particles (Keep count low for 0 lag)
        // Reduced slightly for mobile devices to ensure peak performance
        const particleCount = window.innerWidth < 768 ? 40 : 70;
        for (let i = 0; i < particleCount; i++) particles.push(new Particle());

        // Animation Loop
        function animateCanvas() {
            ctx.clearRect(0, 0, width, height);
            
            particles.forEach(p => {
                p.update();
                p.draw();
            });

            ctx.lineWidth = 0.5;
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distSq = dx * dx + dy * dy;
                    if (distSq < 12000) {
                        ctx.strokeStyle = `rgba(255, 255, 255, ${0.12 - distSq/100000})`;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
            
            for (let i = 0; i < particles.length; i++) {
                const dx = particles[i].x - mouse.x;
                const dy = particles[i].y - mouse.y;
                const distSq = dx * dx + dy * dy;
                if (distSq < 25000) {
                    ctx.strokeStyle = `rgba(255, 255, 255, ${0.15 - distSq/166666})`;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.stroke();
                }
            }

            requestAnimationFrame(animateCanvas);
        }
        animateCanvas();

        /* --- Branding Card Spotlight Effect --- */
        const brandingCard = document.querySelector('.branding-card');
        if (brandingCard) {
            brandingCard.addEventListener('mousemove', (e) => {
                const rect = brandingCard.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                brandingCard.style.setProperty('--mouse-x', `${x}px`);
                brandingCard.style.setProperty('--mouse-y', `${y}px`);
            });
        }

        /* --- Smooth Drag-to-Scroll Slider --- */
        const slider = document.getElementById('projectSlider');
        let isDown = false;
        let startX;
        let scrollLeft;

        slider.addEventListener('mousedown', (e) => {
            isDown = true;
            slider.style.cursor = 'grabbing';
            slider.style.scrollSnapType = 'none';
            startX = e.pageX - slider.offsetLeft;
            scrollLeft = slider.scrollLeft;
        });

        slider.addEventListener('mouseleave', () => {
            isDown = false;
            slider.style.cursor = 'grab';
            slider.style.scrollSnapType = 'x mandatory';
        });

        slider.addEventListener('mouseup', () => {
            isDown = false;
            slider.style.cursor = 'grab';
            slider.style.scrollSnapType = 'x mandatory';
        });

        slider.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - slider.offsetLeft;
            const walk = (x - startX) * 2; 
            slider.scrollLeft = scrollLeft - walk;
        });
        
        /* --- Floating Arrow Button Scroll --- */
        const btnLeft = document.getElementById('slide-left');
        const btnRight = document.getElementById('slide-right');
        
        const getScrollAmount = () => {
            const card = slider.querySelector('.project-card');
            return card ? card.offsetWidth + 48 : 450;
        };

        btnLeft.addEventListener('click', () => {
            slider.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
        });

        btnRight.addEventListener('click', () => {
            slider.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
        });
        
        /* --- Update Active Nav Item on Scroll --- */
        const sections = document.querySelectorAll('section');
        const navLinks = document.querySelectorAll('.nav-links a');

        window.addEventListener('scroll', () => {
            let current = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                if (scrollY >= (sectionTop - sectionHeight / 3)) {
                    current = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href').includes(current)) {
                    link.classList.add('active');
                }
            });
        });

        /* --- Responsive Nerd Mode Logic & Synthesized Sound Effect --- */
        const modeSwitch = document.getElementById('mode-switch');
        const labelNorm = document.getElementById('label-norm');
        const labelNerd = document.getElementById('label-nerd');
        const nerdTooltip = document.getElementById('nerd-tooltip');
        let isNerdMode = false;
        let currentlyHighlighted = null;
        let audioCtx;

        function playNerdHoverSound() {
            if (!audioCtx) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }

            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();

            oscillator.type = 'sine'; 
            oscillator.frequency.setValueAtTime(1000, audioCtx.currentTime); 
            oscillator.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.03);

            gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime); 
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.03); 

            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.03);
        }

        modeSwitch.addEventListener('click', () => {
            isNerdMode = !isNerdMode;
            
            if (isNerdMode && !audioCtx) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            modeSwitch.classList.toggle('nerd-active', isNerdMode);
            document.body.classList.toggle('nerd-mode', isNerdMode);
            labelNorm.classList.toggle('active', !isNerdMode);
            labelNerd.classList.toggle('active', isNerdMode);

            if (!isNerdMode) {
                nerdTooltip.style.opacity = 0;
                if (currentlyHighlighted) {
                    currentlyHighlighted.classList.remove('nerd-highlight');
                    currentlyHighlighted = null;
                }
            }
        });

        // Handles hovering on desktop and dragging on touch screens
        function handleNerdHover(e) {
            if (!isNerdMode) return;

            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            const pageX = e.touches ? e.touches[0].pageX : e.pageX;
            const pageY = e.touches ? e.touches[0].pageY : e.pageY;

            // Constrain tooltip to avoid pushing off screen on mobile
            let tooltipX = pageX + 15;
            if (clientX > window.innerWidth - 120) {
                tooltipX = pageX - nerdTooltip.offsetWidth - 15;
            }

            nerdTooltip.style.left = tooltipX + 'px';
            nerdTooltip.style.top = (pageY + 15) + 'px';

            const el = document.elementFromPoint(clientX, clientY);

            if (el && el !== currentlyHighlighted && el !== document.body && el.tagName !== 'HTML') {
                if (currentlyHighlighted) currentlyHighlighted.classList.remove('nerd-highlight');
                
                currentlyHighlighted = el;
                currentlyHighlighted.classList.add('nerd-highlight');
                playNerdHoverSound();

                const tag = el.tagName.toLowerCase();
                let clsStr = '';
                
                if (typeof el.className === 'string') {
                    const classes = el.className.split(' ').filter(c => 
                        c && c !== 'nerd-highlight' && !c.includes('animate-up') && !c.includes('delay-')
                    );
                    if (classes.length > 0) clsStr = '.' + classes[0]; 
                }

                const rect = el.getBoundingClientRect();
                const w = Math.round(rect.width);
                const h = Math.round(rect.height);

                nerdTooltip.innerHTML = `
                    <div class="nerd-tag">${tag}${clsStr}</div>
                    <div class="nerd-dims">${w} <span style="color:var(--text-muted)">×</span> ${h}</div>
                `;
                nerdTooltip.style.opacity = 1;
                
            } else if (!el || el === document.body || el.tagName === 'HTML') {
                if (currentlyHighlighted) {
                    currentlyHighlighted.classList.remove('nerd-highlight');
                    currentlyHighlighted = null;
                }
                nerdTooltip.style.opacity = 0;
            }
        }

        document.addEventListener('mousemove', handleNerdHover);
        document.addEventListener('touchmove', handleNerdHover, { passive: true });

        /* --- Seamless Contact Form Submission (Web3Forms) --- */
        const contactForm = document.getElementById('contact-form');
        const submitBtn = contactForm.querySelector('.btn-submit');

        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const originalText = submitBtn.innerText;
            submitBtn.innerText = 'Sending...';
            submitBtn.style.opacity = '0.7';
            submitBtn.style.cursor = 'not-allowed';

            const formData = new FormData(contactForm);
            const object = Object.fromEntries(formData);
            const json = JSON.stringify(object);

            try {
                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: json
                });
                
                if (response.status == 200) {
                    submitBtn.innerText = 'Message Sent!';
                    submitBtn.style.backgroundColor = 'var(--text-main)';
                    submitBtn.style.color = 'var(--bg-color)';
                    submitBtn.style.opacity = '1';
                    contactForm.reset();
                    
                    setTimeout(() => {
                        submitBtn.innerText = originalText;
                        submitBtn.style.backgroundColor = 'transparent';
                        submitBtn.style.color = 'var(--text-main)';
                        submitBtn.style.cursor = 'pointer';
                    }, 3000);
                } else {
                    console.log(response);
                    submitBtn.innerText = 'Error! Try Again.';
                    submitBtn.style.opacity = '1';
                    setTimeout(() => {
                        submitBtn.innerText = originalText;
                        submitBtn.style.cursor = 'pointer';
                    }, 3000);
                }
            } catch (error) {
                console.log(error);
                submitBtn.innerText = 'Network Error!';
                submitBtn.style.opacity = '1';
                setTimeout(() => {
                    submitBtn.innerText = originalText;
                    submitBtn.style.cursor = 'pointer';
                }, 3000);
            }
        });
    
