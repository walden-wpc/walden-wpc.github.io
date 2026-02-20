// ============================================
// Walden Pond - Canvas 2D Ripple Effect
// 無需任何外部 CDN 依賴
// ============================================

const CONFIG = {
    bgColor: '#faf9f6',
    rippleColor: '#1a1a1a',
    fontSize: 10,
    characters: ' .:-+*=%@#',
};

// Ripple state
const ripples = [];
const MAX_RIPPLES = 8;
const RIPPLE_SPEED = 60;    // px/sec expansion
const RIPPLE_DECAY = 0.008; // strength reduction per frame

let canvas, ctx, animId;
let charCanvas, charCtx;

function init() {
    const container = document.getElementById('walden-container');
    if (!container) return;

    canvas = document.createElement('canvas');
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.cursor = 'crosshair';
    canvas.style.display = 'block';
    container.innerHTML = '';
    container.appendChild(canvas);

    resize();
    window.addEventListener('resize', resize);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('click', onClick);

    // Initial splash
    addRipple(canvas.width / 2, canvas.height / 2, 1.2);

    animate();
}

function resize() {
    if (!canvas) return;
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    ctx = canvas.getContext('2d');
}

let lastTime = 0;
function animate(timestamp = 0) {
    const dt = Math.min((timestamp - lastTime) / 1000, 0.1); // seconds
    lastTime = timestamp;

    // Spawn rain randomly (Zen mode)
    if (Math.random() > 0.994) {
        addRipple(
            Math.random() * canvas.width,
            Math.random() * canvas.height,
            0.4 + Math.random() * 0.6
        );
    }

    // Update ripples
    for (let i = ripples.length - 1; i >= 0; i--) {
        ripples[i].radius += RIPPLE_SPEED * dt;
        ripples[i].strength -= RIPPLE_DECAY;
        if (ripples[i].strength <= 0) ripples.splice(i, 1);
    }

    drawAscii();
    animId = requestAnimationFrame(animate);
}

function drawAscii() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const cols = Math.floor(canvas.width / CONFIG.fontSize);
    const rows = Math.floor(canvas.height / CONFIG.fontSize);
    const numChars = CONFIG.characters.length - 1;

    ctx.font = `${CONFIG.fontSize}px monospace`;
    ctx.textBaseline = 'top';

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const px = col * CONFIG.fontSize + CONFIG.fontSize / 2;
            const py = row * CONFIG.fontSize + CONFIG.fontSize / 2;

            // Sum ripple influences
            let influence = 0;
            for (const r of ripples) {
                const dx = px - r.x;
                const dy = py - r.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                // Wave ring: sin(dist - radius)
                const waveDist = dist - r.radius;
                if (Math.abs(waveDist) < 80) {
                    const envelope = Math.exp(-waveDist * waveDist / 800);
                    influence += Math.sin(dist * 0.15 - r.radius * 0.08) * r.strength * envelope;
                }
            }

            // Map influence [-1, 1] to character
            const normalised = (influence + 1) / 2;
            const charIdx = Math.floor(Math.max(0, Math.min(normalised, 0.999)) * numChars);
            const char = CONFIG.characters[charIdx];

            if (char !== ' ') {
                const opacity = 0.08 + normalised * 0.6;
                ctx.fillStyle = `rgba(26, 26, 26, ${opacity.toFixed(2)})`;
                ctx.fillText(char, col * CONFIG.fontSize, row * CONFIG.fontSize);
            }
        }
    }
}

function addRipple(x, y, strength) {
    ripples.push({ x, y, radius: 0, strength });
    if (ripples.length > MAX_RIPPLES) ripples.shift();
}

let lastMouseRipple = 0;
function onMouseMove(e) {
    const now = Date.now();
    if (now - lastMouseRipple < 200) return; // Throttle: max 5/sec
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    addRipple(
        (e.clientX - rect.left) * scaleX,
        (e.clientY - rect.top) * scaleY,
        0.5 + Math.random() * 0.4
    );
    lastMouseRipple = now;
}

function onClick(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    addRipple(
        (e.clientX - rect.left) * scaleX,
        (e.clientY - rect.top) * scaleY,
        1.5
    );
}

// Auto-start
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
