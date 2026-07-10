// ─── UI EXTRAS — JARVIS v5.0 Deep Space Immersive (Violet Core) ───

// ══════════════════════════════════════════════════════════
// ── 1. PHOTOREALISTIC 3D DEEP SPACE CANVAS ──
// ══════════════════════════════════════════════════════════
(function() {
    const canvas = document.getElementById('bgCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H;

    const starColors = [
        '#ffffff', '#fff7ed', '#fef3c7', '#fde68a', 
        '#fca5a5', '#f87171', '#ffd8a8', '#ffebeb'
    ];

    const numStars = 500;
    let stars = [];

    const nebulae = [
        { x: -600, y: 350, z: 970, radius: 260, color1: 'rgba(180, 40, 60, 0.05)', color2: 'rgba(255, 100, 80, 0.015)' },
        { x: 550,  y: -400, z: 960, radius: 320, color1: 'rgba(124, 58, 237, 0.05)', color2: 'rgba(168, 85, 247, 0.015)' },
        { x: -150, y: -550, z: 940, radius: 200, color1: 'rgba(80, 20, 120, 0.04)', color2: 'rgba(140, 60, 180, 0.01)' },
        { x: 300,  y: 500, z: 980, radius: 180, color1: 'rgba(219, 39, 119, 0.035)', color2: 'rgba(244, 114, 182, 0.01)' }
    ];

    const planets = [
        {
            x: -500, y: -280, z: 500, r: 18,
            bodyStart: '#d8b4fe', bodyMid: '#a855f7', bodyEnd: '#4c1d95',
            atmosColor: 'rgba(216, 180, 254, 0.12)', hasRings: true,
            ringColor: 'rgba(216, 180, 254, 0.15)', ringWidth: 0.18, hasBands: false
        },
        {
            x: 450, y: 250, z: 700, r: 13,
            bodyStart: '#fdba74', bodyMid: '#c2410c', bodyEnd: '#1c0a00',
            atmosColor: 'rgba(253, 186, 116, 0.06)', hasRings: false, hasBands: false
        },
        {
            x: -200, y: 420, z: 350, r: 26,
            bodyStart: '#f472b6', bodyMid: '#db2777', bodyEnd: '#31004a',
            atmosColor: 'rgba(244, 114, 182, 0.10)', hasRings: true,
            ringColor: 'rgba(244, 114, 182, 0.12)', ringWidth: 0.14, hasBands: true,
            bandColors: ['#db2777', '#9d174d', '#701a75', '#4a044e', '#31004a']
        }
    ];

    let asteroids = [];
    let comets = [];
    let shootingStars = [];
    let shootingStarTimer = 0;
    let targetYaw = 0, targetPitch = 0;
    let yaw = 0, pitch = 0;
    let time = 0;

    function resize() {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }

    function initStars() {
        stars = [];
        for (let i = 0; i < numStars; i++) {
            const colorIdx = Math.random() < 0.25 ? 0 : Math.floor(Math.random() * starColors.length);
            stars.push({
                x: Math.random() * 4000 - 2000,
                y: Math.random() * 4000 - 2000,
                z: Math.random() * 1000,
                color: starColors[colorIdx],
                twinklePhase: Math.random() * Math.PI * 2,
                twinkleSpeed: 0.5 + Math.random() * 2.5,
                baseSize: 0.3 + Math.random() * 1.4
            });
        }
        for (let i = 0; i < 8; i++) {
            stars.push({
                x: Math.random() * 3000 - 1500,
                y: Math.random() * 3000 - 1500,
                z: 800 + Math.random() * 200,
                color: starColors[Math.floor(Math.random() * starColors.length)],
                twinklePhase: Math.random() * Math.PI * 2,
                twinkleSpeed: 0.3 + Math.random() * 1.0,
                baseSize: 2.0 + Math.random() * 1.5,
                isBright: true
            });
        }
        stars.push({
            x: 700, y: -550, z: 920,
            color: '#fffbf0', isFlare: true,
            twinklePhase: 0, twinkleSpeed: 0.8, baseSize: 4
        });
    }

    function initAsteroids() {
        asteroids = [];
        for (let i = 0; i < 28; i++) {
            let vertices = [];
            const numVerts = Math.floor(Math.random() * 4) + 5;
            for (let j = 0; j < numVerts; j++) {
                vertices.push(0.6 + Math.random() * 0.8);
            }
            asteroids.push({
                x: Math.random() * 2500 - 1250,
                y: Math.random() * 2500 - 1250,
                z: Math.random() * 1000,
                r: Math.random() * 6 + 2,
                vertices: vertices,
                angle: Math.random() * Math.PI * 2,
                spinSpeed: (Math.random() - 0.5) * 0.012,
                speedZ: Math.random() * 0.3 + 0.1,
                shade: 0.12 + Math.random() * 0.15
            });
        }
    }

    function initComets() {
        comets = [
            { x: -1000, y: -700, z: 800, dx: 1.2, dy: 0.8, dz: -0.12, tailLen: 70 },
            { x: 1100, y: 600, z: 700, dx: -1.5, dy: -0.7, dz: -0.08, tailLen: 55 }
        ];
    }

    window.addEventListener('mousemove', (e) => {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        targetYaw = (e.clientX - cx) * 0.00018;
        targetPitch = (e.clientY - cy) * 0.00018;
    });

    function project(x, y, z) {
        const fov = 420;
        const cosY = Math.cos(yaw), sinY = Math.sin(yaw);
        const cosP = Math.cos(pitch), sinP = Math.sin(pitch);
        let rx = x * cosY - z * sinY;
        let rz = x * sinY + z * cosY;
        let ry = y * cosP - rz * sinP;
        let rz2 = y * sinP + rz * cosP;
        if (rz2 <= 20) return null;
        return {
            sx: (rx / rz2) * fov + W / 2,
            sy: (ry / rz2) * fov + H / 2,
            scale: fov / rz2,
            depth: rz2
        };
    }

    function drawFrame() {
        time += 0.016;
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, W, H);

        yaw += (targetYaw - yaw) * 0.035;
        pitch += (targetPitch - pitch) * 0.035;

        // Draw Parallax Grid
        const currentStyle = getComputedStyle(document.body);
        const activeColor1 = currentStyle.getPropertyValue('--v1').trim() || '#7c3aed';
        ctx.strokeStyle = activeColor1;
        ctx.lineWidth = 0.2;
        ctx.globalAlpha = 0.06;
        
        ctx.beginPath();
        const gridSpacing = 80;
        const gridOffset = (time * 12) % gridSpacing;
        for (let x = gridOffset; x < W; x += gridSpacing) {
            ctx.moveTo(x, 0); ctx.lineTo(x, H);
        }
        for (let y = gridOffset; y < H; y += gridSpacing) {
            ctx.moveTo(0, y); ctx.lineTo(W, y);
        }
        ctx.stroke();
        ctx.globalAlpha = 1.0;

        // Draw Nebulae
        nebulae.forEach(n => {
            const p = project(n.x, n.y, n.z);
            if (!p) return;
            const r = n.radius * p.scale;
            const radGrad = ctx.createRadialGradient(p.sx, p.sy, 0, p.sx, p.sy, r);
            radGrad.addColorStop(0, n.color1);
            radGrad.addColorStop(0.5, n.color2);
            radGrad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = radGrad;
            ctx.beginPath();
            ctx.arc(p.sx, p.sy, r, 0, Math.PI * 2);
            ctx.fill();
        });

        // Twinkle and Draw Stars
        stars.forEach(s => {
            const p = project(s.x, s.y, s.z);
            if (!p) return;

            const size = s.baseSize * p.scale;
            if (size <= 0.05) return;

            const twinkle = Math.sin(time * s.twinkleSpeed + s.twinklePhase) * 0.35 + 0.65;
            ctx.fillStyle = s.color;
            ctx.globalAlpha = twinkle;

            if (s.isFlare) {
                // Cross flare
                ctx.strokeStyle = s.color;
                ctx.lineWidth = 0.5 * p.scale;
                ctx.beginPath();
                ctx.moveTo(p.sx - size * 6, p.sy); ctx.lineTo(p.sx + size * 6, p.sy);
                ctx.moveTo(p.sx, p.sy - size * 6); ctx.lineTo(p.sx, p.sy + size * 6);
                ctx.stroke();
                
                const grad = ctx.createRadialGradient(p.sx, p.sy, 0, p.sx, p.sy, size * 2);
                grad.addColorStop(0, '#ffffff');
                grad.addColorStop(0.3, '#fde68a');
                grad.addColorStop(1, 'transparent');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(p.sx, p.sy, size * 2, 0, Math.PI * 2);
                ctx.fill();
            } else if (s.isBright) {
                ctx.beginPath();
                ctx.arc(p.sx, p.sy, size, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillRect(p.sx - size / 2, p.sy - size / 2, size, size);
            }
        });
        ctx.globalAlpha = 1.0;

        // Comets
        comets.forEach(c => {
            c.x += c.dx; c.y += c.dy; c.z += c.dz;
            if (c.x > 1800 || c.x < -1800 || c.y > 1800 || c.y < -1800) {
                c.x = Math.random() * 2000 - 1000;
                c.y = Math.random() * 2000 - 1000;
                c.z = 700 + Math.random() * 200;
            }
            const p = project(c.x, c.y, c.z);
            if (!p) return;

            const size = 1.8 * p.scale;
            const tail = project(c.x - c.dx * c.tailLen, c.y - c.dy * c.tailLen, c.z - c.dz * c.tailLen);
            if (tail) {
                const grad = ctx.createLinearGradient(p.sx, p.sy, tail.sx, tail.sy);
                grad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
                grad.addColorStop(0.15, 'rgba(168, 85, 247, 0.15)');
                grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
                ctx.strokeStyle = grad;
                ctx.lineWidth = size;
                ctx.beginPath();
                ctx.moveTo(p.sx, p.sy);
                ctx.lineTo(tail.sx, tail.sy);
                ctx.stroke();
            }
        });

        // Planets
        planets.forEach(pl => {
            const p = project(pl.x, pl.y, pl.z);
            if (!p) return;
            const r = pl.r * p.scale;

            // Planet body sphere gradient
            const grad = ctx.createRadialGradient(p.sx - r*0.3, p.sy - r*0.3, r*0.1, p.sx, p.sy, r);
            grad.addColorStop(0, pl.bodyStart);
            grad.addColorStop(0.5, pl.bodyMid);
            grad.addColorStop(1, pl.bodyEnd);
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(p.sx, p.sy, r, 0, Math.PI * 2);
            ctx.fill();

            // Atmosphere glow
            const atmos = ctx.createRadialGradient(p.sx, p.sy, r, p.sx, p.sy, r * 1.25);
            atmos.addColorStop(0, pl.atmosColor);
            atmos.addColorStop(1, 'transparent');
            ctx.fillStyle = atmos;
            ctx.beginPath();
            ctx.arc(p.sx, p.sy, r * 1.25, 0, Math.PI * 2);
            ctx.fill();

            // Draw planetary rings
            if (pl.hasRings) {
                ctx.save();
                ctx.translate(p.sx, p.sy);
                ctx.rotate(0.3); // tilt
                ctx.scale(2.2, 0.42); // squish
                
                const ringG = ctx.createRadialGradient(0, 0, r, 0, 0, r * 2.2);
                ringG.addColorStop(0, 'transparent');
                ringG.addColorStop(0.5, pl.ringColor);
                ringG.addColorStop(1, 'transparent');
                ctx.strokeStyle = ringG;
                ctx.lineWidth = r * pl.ringWidth;
                
                ctx.beginPath();
                ctx.arc(0, 0, r * 1.5, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            }
        });

        requestAnimationFrame(drawFrame);
    }

    window.addEventListener('resize', () => { resize(); initStars(); });
    resize();
    initStars();
    initAsteroids();
    initComets();
    drawFrame();
})();

// ══════════════════════════════════════════════════════════
// ── 2. PANEL COLLAPSE TOGGLE ──
// ══════════════════════════════════════════════════════════
function togglePanel(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.toggle('collapsed');
    const btn = el.querySelector('.fp-collapse');
    if (btn) btn.textContent = el.classList.contains('collapsed') ? '+' : '−';
}
window.togglePanel = togglePanel;

// ══════════════════════════════════════════════════════════
// ── 3. CLOCK AND DATE ──
// ══════════════════════════════════════════════════════════
(function() {
    const pad = (n) => String(n).padStart(2, '0');
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

    function tick() {
        const clock = document.getElementById('liveClock');
        if (!clock) return;
        const now = new Date();
        clock.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
        
        const dateEl = document.getElementById('liveDate');
        if (dateEl) {
            dateEl.textContent = `${days[now.getDay()]} ${pad(now.getDate())} ${months[now.getMonth()]} ${now.getFullYear()}`;
        }
    }
    setInterval(tick, 1000);
    tick();
})();

// ══════════════════════════════════════════════════════════
// ── 4. SYSTEM THEME CONTROLLERS ──
// ══════════════════════════════════════════════════════════
(function() {
    const themeButtons = document.querySelectorAll('.theme-btn');
    themeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            themeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            document.body.classList.remove('theme-violet', 'theme-amber', 'theme-emerald', 'theme-cyber');

            const theme = btn.getAttribute('data-theme');
            if (theme) {
                document.body.classList.add(`theme-${theme}`);
                const logBox = document.getElementById('consoleLog');
                if (logBox) {
                    const p = document.createElement('p');
                    p.className = 'le init';
                    p.innerText = `> Calibration updated: ${theme.toUpperCase()} scheme loaded.`;
                    logBox.appendChild(p);
                    logBox.scrollTop = logBox.scrollHeight;
                }
            }
        });
    });
})();

// ══════════════════════════════════════════════════════════
// ── 5. REMINDERS WIDGET (localStorage persistence) ──
// ══════════════════════════════════════════════════════════
(function() {
    const STORAGE_KEY = 'jarvis_reminders';
    const MAX_VISIBLE = 3;

    const input     = document.getElementById('reminderInput');
    const addBtn    = document.getElementById('reminderAddBtn');
    const listEl    = document.getElementById('reminderList');
    const emptyEl   = document.getElementById('reminderEmpty');

    if (!input || !addBtn || !listEl || !emptyEl) return;

    function loadReminders() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        } catch {
            return [];
        }
    }

    function saveReminders(reminders) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
    }

    function renderReminders() {
        const reminders = loadReminders();
        listEl.innerHTML = '';

        const visible = reminders.slice(-MAX_VISIBLE);

        if (visible.length === 0) {
            emptyEl.style.display = 'flex';
            return;
        }

        emptyEl.style.display = 'none';

        visible.forEach((rem, idx) => {
            const actualIdx = reminders.length - MAX_VISIBLE + idx;
            const realIdx = actualIdx < 0 ? idx : actualIdx;

            const item = document.createElement('div');
            item.className = 'reminder-item';

            const text = document.createElement('span');
            text.className = 'reminder-text';
            text.textContent = rem.text;
            text.title = rem.text;

            const delBtn = document.createElement('button');
            delBtn.className = 'reminder-delete-btn';
            delBtn.innerHTML = '🗑️';
            delBtn.title = 'Delete reminder';
            delBtn.addEventListener('click', () => {
                deleteReminder(realIdx);
            });

            item.appendChild(text);
            item.appendChild(delBtn);
            listEl.appendChild(item);
        });
    }

    function addReminder() {
        const text = input.value.trim();
        if (!text) return;

        const reminders = loadReminders();
        reminders.push({
            text: text,
            created: Date.now()
        });
        saveReminders(reminders);
        input.value = '';
        renderReminders();

        const logBox = document.getElementById('consoleLog');
        if (logBox) {
            const p = document.createElement('p');
            p.className = 'le init';
            p.innerText = `> Reminder saved: "${text.substring(0, 40)}${text.length > 40 ? '...' : ''}"`;
            logBox.appendChild(p);
            logBox.scrollTop = logBox.scrollHeight;
        }
    }

    function deleteReminder(index) {
        const reminders = loadReminders();
        if (index >= 0 && index < reminders.length) {
            reminders.splice(index, 1);
            saveReminders(reminders);
            renderReminders();
        }
    }

    addBtn.addEventListener('click', addReminder);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addReminder();
        }
    });

    renderReminders();
})();
