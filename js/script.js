(() => {
    "use strict";
    console.log("JavaScript успешно загружен!");
    
    // =========================================
    // 1. АВТОМАТИЧЕСКИЙ ГОД
    // =========================================

    const yearElement = document.getElementById("current-year");

    if (yearElement) {
        yearElement.textContent = String(new Date().getFullYear());
    }


    // =========================================
    // 2. МОБИЛЬНОЕ МЕНЮ
    // =========================================

    const menuToggle = document.getElementById("menu-toggle");
    const navigation = document.getElementById("navigation");

    if (menuToggle && navigation) {

        function closeMenu() {
            navigation.classList.remove("active");

            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.setAttribute("aria-label", "Открыть меню");
        }

        menuToggle.addEventListener("click", () => {
            const isOpen = navigation.classList.toggle("active");

            menuToggle.setAttribute(
                "aria-expanded",
                String(isOpen)
            );

            menuToggle.setAttribute(
                "aria-label",
                isOpen ? "Закрыть меню" : "Открыть меню"
            );
        });

        navigation.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", closeMenu);
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                closeMenu();
                menuToggle.focus();
            }
        });
    }


    // =========================================
    // 3. БАЗОВАЯ ПРОВЕРКА ССЫЛОК
    // =========================================

    function secureLinks() {

        const links = document.querySelectorAll("a[href]");

        links.forEach((link) => {

            const rawHref = link.getAttribute("href");

            if (!rawHref) return;

            try {
                const url = new URL(rawHref, document.baseURI);

                const allowedProtocols = [
                    "http:",
                    "https:",
                    "mailto:",
                    "tel:"
                ];

                // Удаляем ссылки с опасными протоколами
                if (!allowedProtocols.includes(url.protocol)) {
                    link.removeAttribute("href");
                    return;
                }

                // Защита при открытии ссылки в новой вкладке
                if (link.target === "_blank") {

                    const relValues = new Set(
                        (link.getAttribute("rel") || "")
                            .split(/\s+/)
                            .filter(Boolean)
                    );

                    relValues.add("noopener");
                    relValues.add("noreferrer");

                    link.setAttribute(
                        "rel",
                        [...relValues].join(" ")
                    );
                }

            } catch (error) {
                // Некорректная ссылка удаляется
                link.removeAttribute("href");
            }
        });
    }

    secureLinks();


    // =========================================
    // 4. ОБРАБОТКА ОШИБОК JAVASCRIPT
    // =========================================

    window.addEventListener("error", (event) => {
        console.error(
            "Ошибка JavaScript:",
            event.message
        );
    });

    window.addEventListener("unhandledrejection", (event) => {
        console.error(
            "Необработанная ошибка:",
            event.reason
        );
    });


    // =========================================
    // 5. ФОНОВАЯ АНИМАЦИЯ ЧАСТИЦ
    // =========================================

    const canvas = document.getElementById("particles-bg");

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    const motionQuery = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );

    let particles = [];
    let width = 0;
    let height = 0;
    let animationId = null;
    let isVisible = !document.hidden;

    const MAX_PARTICLES = 75;
    const MIN_PARTICLES = 35;
    const CONNECTION_DISTANCE = 105;


    // Изменение размеров Canvas
    function resizeCanvas() {

        const pixelRatio = Math.min(
            window.devicePixelRatio || 1,
            1.5
        );

        width = window.innerWidth;
        height = window.innerHeight;

        canvas.width = Math.round(width * pixelRatio);
        canvas.height = Math.round(height * pixelRatio);

        ctx.setTransform(
            pixelRatio,
            0,
            0,
            pixelRatio,
            0,
            0
        );

        const particleCount = Math.min(
            MAX_PARTICLES,
            Math.max(
                MIN_PARTICLES,
                Math.floor(width / 15)
            )
        );

        particles = Array.from(
            { length: particleCount },
            () => ({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 1.2 + 0.8,
                speedX: (Math.random() - 0.5) * 0.65,
                speedY: (Math.random() - 0.5) * 0.65,
                phase: Math.random() * Math.PI * 2
            })
        );

        if (motionQuery.matches) {
            drawParticles(0, false);
        }
    }


    // Отрисовка частиц
    function drawParticles(time, move = true) {

        ctx.clearRect(0, 0, width, height);

        particles.forEach((particle) => {

            if (move) {

                particle.x += particle.speedX;
                particle.y += particle.speedY;

                if (particle.x < -10) particle.x = width + 10;
                if (particle.x > width + 10) particle.x = -10;

                if (particle.y < -10) particle.y = height + 10;
                if (particle.y > height + 10) particle.y = -10;
            }

            const pulse = motionQuery.matches
                ? 0.55
                : 0.45 + 0.35 * Math.sin(
                    time * 0.0015 + particle.phase
                );

            ctx.beginPath();

            ctx.arc(
                particle.x,
                particle.y,
                particle.radius,
                0,
                Math.PI * 2
            );

            ctx.fillStyle = `rgba(205, 165, 255, ${pulse})`;
            ctx.shadowColor = "rgba(170, 100, 255, 0.9)";
            ctx.shadowBlur = 14;

            ctx.fill();
        });

        ctx.shadowBlur = 0;

        // Соединение близких частиц
        for (let i = 0; i < particles.length; i++) {

            for (let j = i + 1; j < particles.length; j++) {

                const first = particles[i];
                const second = particles[j];

                const dx = first.x - second.x;
                const dy = first.y - second.y;

                const distance = Math.hypot(dx, dy);

                if (distance >= CONNECTION_DISTANCE) continue;

                const opacity = 0.12 * (
                    1 - distance / CONNECTION_DISTANCE
                );

                ctx.beginPath();

                ctx.moveTo(first.x, first.y);
                ctx.lineTo(second.x, second.y);

                ctx.strokeStyle = `rgba(170, 120, 255, ${opacity})`;
                ctx.lineWidth = 0.7;

                ctx.stroke();
            }
        }
    }


    // Цикл анимации
    function animate(time) {

        if (!isVisible || motionQuery.matches) {
            animationId = null;
            return;
        }

        drawParticles(time);

        animationId = requestAnimationFrame(animate);
    }


    function startAnimation() {

        if (
            animationId !== null ||
            !isVisible ||
            motionQuery.matches
        ) {
            return;
        }

        animationId = requestAnimationFrame(animate);
    }


    function stopAnimation() {

        if (animationId !== null) {

            cancelAnimationFrame(animationId);

            animationId = null;
        }
    }


    // Остановка анимации при скрытии вкладки
    function handleVisibilityChange() {

        isVisible = !document.hidden;

        if (isVisible) {

            if (motionQuery.matches) {
                drawParticles(0, false);
            } else {
                startAnimation();
            }

        } else {
            stopAnimation();
        }
    }


    // Учитываем настройки уменьшения движения
    function handleMotionPreferenceChange() {

        stopAnimation();

        if (motionQuery.matches) {
            drawParticles(0, false);
        } else {
            startAnimation();
        }
    }


    // Запуск
    resizeCanvas();

    if (motionQuery.matches) {
        drawParticles(0, false);
    } else {
        startAnimation();
    }


    // События браузера
    window.addEventListener(
        "resize",
        resizeCanvas,
        { passive: true }
    );

    document.addEventListener(
        "visibilitychange",
        handleVisibilityChange
    );

    if (typeof motionQuery.addEventListener === "function") {

        motionQuery.addEventListener(
            "change",
            handleMotionPreferenceChange
        );

    } else if (typeof motionQuery.addListener === "function") {

        motionQuery.addListener(
            handleMotionPreferenceChange
        );
    }

})();
