/* =====================================================
   6. HERO 3D SEQUENCE ANIMATION (Canvas / Scrubbing)
   ===================================================== */
(function initHeroSequence() {
    const section = qs('.hero-scrub');
    const canvas  = qs('#hero-canvas');
    const content = qs('#hero-content');
    if (!section || !canvas || !content) return;

    const ctx = canvas.getContext('2d');
    const frameCount = 192;
    
    // CORRECTION ICI : Ajout du ./ pour GitHub Pages
    const currentFrame = index => (
        `./assets/sequence/sequence_${index.toString().padStart(3, '0')}.jpg`
    );

    const images = [];
    const sequenceState = { frame: 0 };
    let loadedCount = 0;

    const render = () => {
        const img = images[sequenceState.frame];
        if (!img || !img.complete) return; // Sécurité si l'image n'est pas chargée

        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;

        const imgRatio = img.width / img.height;
        const canvasRatio = canvas.width / canvas.height;
        let dWidth, dHeight, dx, dy;

        if (imgRatio > canvasRatio) {
            dHeight = canvas.height;
            dWidth = dHeight * imgRatio;
            dx = (canvas.width - dWidth) / 2;
            dy = 0;
        } else {
            dWidth = canvas.width;
            dHeight = dWidth / imgRatio;
            dx = 0;
            dy = (canvas.height - dHeight) / 2;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, dx, dy, dWidth, dHeight);
    };

    const preloadImages = () => {
        for (let i = 0; i < frameCount; i++) {
            const img = new Image();
            img.src = currentFrame(i);
            img.onload = () => {
                loadedCount++;
                // Affiche la 1ère image dès qu'elle est chargée pour éviter l'écran noir
                if (i === 0 || (isInitialRender && i === sequenceState.frame)) {
                    render();
                }
                if (loadedCount === frameCount) {
                    console.log("Séquence 3D chargée entièrement");
                }
            };
            // Log d'erreur pour t'aider à déboguer sur GitHub
            img.onerror = () => console.error("Impossible de charger : " + img.src);
            images.push(img);
        }
    };

    let isInitialRender = true;
    const onScroll = () => {
        const rect = section.getBoundingClientRect();
        const scrollRange = rect.height - window.innerHeight;
        const scrollFraction = Math.max(0, Math.min(1, -rect.top / scrollRange));
        
        const frameIndex = Math.min(
            frameCount - 1,
            Math.floor(scrollFraction * frameCount)
        );
        
        sequenceState.frame = frameIndex;

        const contentOpacity = 1 - (scrollFraction * 4);
        content.style.opacity = Math.max(0, contentOpacity);
        content.style.pointerEvents = contentOpacity < 0.1 ? 'none' : 'auto';

        render();
        isInitialRender = false;
    };

    // ... (Garder la suite du code pour le tilt de la souris)
    let mouseX = 0;
    let mouseY = 0;
    const updateTransforms = () => {
        const tiltX = mouseY * 12;
        const tiltY = mouseX * 12;
        canvas.style.transform = `rotateX(${-tiltX}deg) rotateY(${tiltY}deg) scale(1.05)`;
        content.style.transform = `translate3d(${mouseX * -25}px, ${mouseY * -25}px, 60px) rotateX(${tiltX * 0.4}deg) rotateY(${-tiltY * 0.4}deg)`;
    };

    window.addEventListener('resize', render);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('mousemove', (e) => {
        if (window.innerWidth < 768) return;
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        updateTransforms();
    }, { passive: true });

    preloadImages();
})();
