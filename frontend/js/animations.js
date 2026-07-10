// Waveform animations, neural graph visualizer, and 3D tilting parallax

// ══════════════════════════════════════════════════════════
// ── 1. 3D INTERACTIVE TILTING (Parallax Hologram) ──
// ══════════════════════════════════════════════════════════
(function() {
    const stage = document.getElementById('stage');
    const reactor = document.querySelector('.reactor-stage');
    if (!stage || !reactor) return;

    stage.style.perspective = '1400px';
    reactor.style.transformStyle = 'preserve-3d';

    let lastX = 0, lastY = 0;
    let targetX = 0, targetY = 0;

    window.addEventListener('mousemove', (e) => {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        targetX = (cx - e.clientX) / 20;
        targetY = (cy - e.clientY) / -20;
    });

    function updateTilt() {
        lastX += (targetX - lastX) * 0.06;
        lastY += (targetY - lastY) * 0.06;
        reactor.style.transform = `rotateY(${lastX}deg) rotateX(${lastY}deg)`;
        requestAnimationFrame(updateTilt);
    }
    updateTilt();
})();

// ══════════════════════════════════════════════════════════
// ── 2. ROLLING NEURAL GRAPH (Real-time Canvas activity) ──
// ══════════════════════════════════════════════════════════
(function() {
    const canvas = document.getElementById('neuralCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W = canvas.width = canvas.parentElement.clientWidth;
    let H = canvas.height = canvas.parentElement.clientHeight;

    window.addEventListener('resize', () => {
        if (canvas.parentElement) {
            W = canvas.width = canvas.parentElement.clientWidth;
            H = canvas.height = canvas.parentElement.clientHeight;
        }
    });

    let offset = 0;
    function drawNeuralGraph() {
        ctx.clearRect(0, 0, W, H);

        const currentStyle = getComputedStyle(document.body);
        const activeColor2 = currentStyle.getPropertyValue('--v2').trim() || '#a855f7';
        const activeColor3 = currentStyle.getPropertyValue('--v3').trim() || '#d8b4fe';

        const waves = [
            { amp: 11, freq: 0.035, speed: 0.05, color: activeColor2 + 'cc', lw: 1.2 },
            { amp: 7, freq: 0.055, speed: -0.07, color: activeColor3 + '88', lw: 0.8 },
            { amp: 15, freq: 0.018, speed: 0.03, color: activeColor2 + '33', lw: 1.8 }
        ];

        waves.forEach(w => {
            ctx.strokeStyle = w.color;
            ctx.lineWidth = w.lw;
            ctx.beginPath();
            for (let x = 0; x < W; x++) {
                const y = H / 2 + Math.sin(x * w.freq + offset * w.speed) * w.amp;
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        });

        offset += 1;
        requestAnimationFrame(drawNeuralGraph);
    }
    drawNeuralGraph();
})();

// ══════════════════════════════════════════════════════════
// ── 3. WAVEFORM + CHIP STATE SYNC ──
// ══════════════════════════════════════════════════════════
const waveformEl = document.getElementById('waveform');
const chipDotEl  = document.getElementById('chipDot');
const chipLblEl  = document.getElementById('chipLabel');
const micDotEl   = document.getElementById('micDot');

export function applyState(state) {
    if (!waveformEl) return;
    waveformEl.classList.remove('active','listening','speaking');
    if (chipDotEl) chipDotEl.className = 'chip-dot';

    if (state === 'listening') {
        waveformEl.classList.add('active','listening');
        if (chipDotEl) chipDotEl.classList.add('mic');
        if (chipLblEl) chipLblEl.textContent = 'LISTENING';
        if (micDotEl) { micDotEl.style.background='#a855f7'; micDotEl.style.boxShadow='0 0 8px #a855f7'; }
    } else if (state === 'speaking') {
        waveformEl.classList.add('active','speaking');
        if (chipDotEl) chipDotEl.classList.add('spk');
        if (chipLblEl) chipLblEl.textContent = 'SPEAKING';
        if (micDotEl) { micDotEl.style.background='#f472b6'; micDotEl.style.boxShadow='0 0 8px #f472b6'; }
    } else if (state === 'thinking') {
        if (chipDotEl) chipDotEl.classList.add('think');
        if (chipLblEl) chipLblEl.textContent = 'THINKING';
    } else {
        waveformEl.classList.remove('active','listening','speaking');
        if (chipDotEl) chipDotEl.className = 'chip-dot';
        if (chipLblEl) chipLblEl.textContent = 'STANDBY';
        if (micDotEl) { micDotEl.style.background='#6b4f8a'; micDotEl.style.boxShadow='none'; }
    }
}

// Sync states by polling coreStatus text content
setInterval(() => {
    const txt = (document.getElementById('coreStatus')?.textContent || '').toUpperCase();
    if (txt.includes('LISTENING'))      applyState('listening');
    else if (txt.includes('SPEAKING'))  applyState('speaking');
    else if (txt.includes('THINKING'))  applyState('thinking');
    else                                applyState('idle');
}, 300);

// Mic active indicator class trigger
const micBtnEl = document.getElementById('micBtn');
setInterval(() => {
    if (!micBtnEl) return;
    const txt = (document.getElementById('statusText')?.textContent || '');
    if (txt.includes('LISTENING')) micBtnEl.classList.add('mic-on');
    else micBtnEl.classList.remove('mic-on');
}, 500);

// Initialize HUD online indicator
setTimeout(() => {
    if (chipDotEl) chipDotEl.classList.add('on');
    if (chipLblEl) chipLblEl.textContent = 'ONLINE';
}, 1500);
window.applyState = applyState;
