/* ===================================================================
   Walden — ASCII 視覺系統
   -------------------------------------------------------------------
   兩個模組共用同一組字元梯度，讓首頁的水面和專案卡片說同一種語言：

     1. pond()    首頁 hero 的即時水波
     2. reveal()  專案圖片的「顯影」：從字元解析成照片，hover 再回到字元

   零外部依賴。尊重 prefers-reduced-motion，離開視窗即停止運算。
   =================================================================== */
(function () {
    'use strict';

    /** 由疏到密的字元梯度 —— 整個網站的視覺字母表 */
    var RAMP = ' .:-+*=%@#';
    var INK = '26, 24, 20';
    var MONO = '"Maple Mono", ui-monospace, Consolas, monospace';

    var reduceMotion = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function dpr() {
        return Math.min(window.devicePixelRatio || 1, 2);
    }

    /** 把 canvas 的實體解析度對齊螢幕密度，回傳 CSS 像素尺寸 */
    function fitCanvas(canvas, w, h) {
        var r = dpr();
        canvas.width = Math.max(1, Math.round(w * r));
        canvas.height = Math.max(1, Math.round(h * r));
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        var ctx = canvas.getContext('2d');
        ctx.setTransform(r, 0, 0, r, 0, 0);
        return ctx;
    }

    /* =============================================================
       1. 水面
       ============================================================= */
    function pond(host) {
        var canvas = document.createElement('canvas');
        host.innerHTML = '';
        host.appendChild(canvas);

        var ctx = null;
        var w = 0;
        var h = 0;
        var cell = 10;
        var ripples = [];
        var running = false;
        var rafId = 0;
        var lastTime = 0;

        var MAX_RIPPLES = 9;
        var SPEED = 62;      // px/sec 擴散速度
        var DECAY = 0.22;    // 每秒強度衰減（與時間相關，不再依賴幀率）
        var RAIN = 1.1;      // 每秒自然落下的雨滴數

        function measure() {
            var rect = host.getBoundingClientRect();
            w = Math.round(rect.width);
            h = Math.round(rect.height);
            if (w <= 0 || h <= 0) return false;
            // 格子總數設上限，避免大螢幕上每幀算幾百萬次距離
            cell = 9;
            while ((w / cell) * (h / cell) > 12000) cell += 1;
            ctx = fitCanvas(canvas, w, h);
            return true;
        }

        function addRipple(x, y, strength) {
            ripples.push({ x: x, y: y, radius: 0, strength: strength });
            if (ripples.length > MAX_RIPPLES) ripples.shift();
        }

        function draw() {
            if (!ctx) return;
            ctx.clearRect(0, 0, w, h);
            ctx.font = cell + 'px ' + MONO;
            ctx.textBaseline = 'top';

            var cols = Math.floor(w / cell);
            var rows = Math.floor(h / cell);
            var last = RAMP.length - 1;

            for (var row = 0; row < rows; row++) {
                var py = row * cell + cell / 2;
                for (var col = 0; col < cols; col++) {
                    var px = col * cell + cell / 2;
                    var influence = 0;

                    for (var i = 0; i < ripples.length; i++) {
                        var r = ripples[i];
                        var dx = px - r.x;
                        var dy = py - r.y;
                        var dist = Math.sqrt(dx * dx + dy * dy);
                        var waveDist = dist - r.radius;
                        if (waveDist > -75 && waveDist < 75) {
                            var envelope = Math.exp(-waveDist * waveDist / 1400);
                            /* 相位綁在 waveDist（與波前的距離）上，而不是 dist，
                               否則環擴散時會週期性地整個消失 */
                            influence += Math.cos(waveDist * 0.105) *
                                r.strength * envelope;
                        }
                    }

                    /* 平靜的水面是空白的：只有波紋的起伏會顯出字元。
                       取絕對值，讓波峰與波谷都現形，中間的靜水留白。 */
                    var level = Math.abs(influence);
                    if (level < 0.05) continue;
                    if (level > 1) level = 1;

                    var ch = RAMP[Math.round(level * last)];
                    if (ch === ' ') continue;

                    ctx.fillStyle = 'rgba(' + INK + ', ' +
                        (0.12 + level * 0.78).toFixed(2) + ')';
                    ctx.fillText(ch, col * cell, row * cell);
                }
            }
        }

        function frame(timestamp) {
            var dt = Math.min((timestamp - lastTime) / 1000, 0.1);
            lastTime = timestamp;

            if (Math.random() < dt * RAIN) {
                addRipple(Math.random() * w, Math.random() * h, 0.6 + Math.random() * 0.5);
            }
            for (var i = ripples.length - 1; i >= 0; i--) {
                ripples[i].radius += SPEED * dt;
                ripples[i].strength -= DECAY * dt;
                if (ripples[i].strength <= 0) ripples.splice(i, 1);
            }

            draw();
            rafId = requestAnimationFrame(frame);
        }

        function start() {
            if (running || reduceMotion) return;
            running = true;
            lastTime = performance.now();
            rafId = requestAnimationFrame(frame);
        }

        function stop() {
            running = false;
            cancelAnimationFrame(rafId);
        }

        function pointAt(clientX, clientY) {
            var rect = canvas.getBoundingClientRect();
            return [clientX - rect.left, clientY - rect.top];
        }

        var lastSpawn = 0;
        function onMove(e) {
            var now = Date.now();
            if (now - lastSpawn < 180) return;
            lastSpawn = now;
            var touch = e.touches ? e.touches[0] : e;
            var p = pointAt(touch.clientX, touch.clientY);
            addRipple(p[0], p[1], 0.5 + Math.random() * 0.4);
        }

        function onTap(e) {
            var touch = e.changedTouches ? e.changedTouches[0] : e;
            var p = pointAt(touch.clientX, touch.clientY);
            addRipple(p[0], p[1], 1.5);
        }

        var seeded = false;

        /* 第一次量測可能拿到 0（版面還沒配置、分頁在背景、hero 當下不可見），
           所以量測失敗不能放棄 —— 觀察器會在尺寸出現時再喊一次。 */
        function ensure() {
            if (!measure()) return false;
            if (!seeded) {
                seeded = true;
                addRipple(w / 2, h / 2, 1.2);   // 一滴起始水花，置中
                if (reduceMotion) {
                    // 不動的版本：擴散到一半的定格，仍是同一套字元語言
                    for (var k = 0; k < 90; k++) ripples[0].radius += SPEED / 60;
                    var hero = host.closest('.hero');
                    if (hero) hero.setAttribute('data-still', '');
                }
            }
            return true;
        }

        if (reduceMotion) {
            if (ensure()) draw();
            if (window.ResizeObserver) {
                new ResizeObserver(function () {
                    if (ensure()) draw();
                }).observe(host);
            }
            return;
        }

        canvas.addEventListener('mousemove', onMove);
        canvas.addEventListener('click', onTap);
        // 觸控：全部 passive，絕不攔截頁面捲動
        canvas.addEventListener('touchstart', onTap, { passive: true });
        canvas.addEventListener('touchmove', onMove, { passive: true });

        var visible = true;

        function sync() {
            if (visible && !document.hidden && ensure()) start();
            else stop();
        }

        if (window.ResizeObserver) {
            new ResizeObserver(function () {
                if (ensure() && !running) sync();
                else if (running) draw();
            }).observe(host);
        } else {
            window.addEventListener('resize', sync);
        }

        // 捲出視窗就停止運算（省電、不讓手機發燙）
        if (window.IntersectionObserver) {
            new IntersectionObserver(function (entries) {
                visible = entries[0].isIntersecting;
                sync();
            }, { threshold: 0 }).observe(host);
        }

        document.addEventListener('visibilitychange', sync);
        sync();
    }

    /* =============================================================
       2. 圖片顯影
       ============================================================= */
    var LEVELS = [18, 13, 9, 6];   // 由粗到細的字元格大小
    var HOVER_LEVEL = 10;

    function paintAscii(canvas, img, w, h, cellSize) {
        var cols = Math.max(1, Math.floor(w / cellSize));
        var rows = Math.max(1, Math.floor(h / cellSize));

        var off = document.createElement('canvas');
        off.width = cols;
        off.height = rows;
        var octx = off.getContext('2d', { willReadFrequently: true });
        octx.drawImage(img, 0, 0, cols, rows);

        var data;
        try {
            data = octx.getImageData(0, 0, cols, rows).data;
        } catch (err) {
            return false; // 跨網域圖片會被擋，安靜放棄
        }

        var ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, w, h);
        ctx.font = cellSize + 'px ' + MONO;
        ctx.textBaseline = 'top';

        var last = RAMP.length - 1;
        for (var row = 0; row < rows; row++) {
            for (var col = 0; col < cols; col++) {
                var i = (row * cols + col) * 4;
                // 感知亮度；紙白底配墨黑字，所以越暗的像素用越密的字元
                var lum = (0.2126 * data[i] + 0.7152 * data[i + 1] +
                    0.0722 * data[i + 2]) / 255;
                var ch = RAMP[Math.round((1 - lum) * last)];
                if (ch === ' ') continue;
                ctx.fillStyle = 'rgba(' + INK + ', ' +
                    (0.25 + (1 - lum) * 0.65).toFixed(2) + ')';
                ctx.fillText(ch, col * cellSize, row * cellSize);
            }
        }
        return true;
    }

    function reveal(host) {
        var img = host.querySelector('img');
        if (!img) return;

        var canvas = document.createElement('canvas');
        canvas.className = 'ascii-layer';
        canvas.setAttribute('aria-hidden', 'true');
        host.appendChild(canvas);

        var ctx = null;
        var w = 0;
        var h = 0;
        var ready = false;
        var played = false;

        function size() {
            var rect = host.getBoundingClientRect();
            w = Math.round(rect.width);
            h = Math.round(rect.height);
            if (w <= 0 || h <= 0) return false;
            ctx = fitCanvas(canvas, w, h);
            return true;
        }

        function at(level, opacity) {
            if (!size()) return;
            if (!paintAscii(canvas, img, w, h, level)) {
                ready = false;
                return;
            }
            canvas.style.opacity = opacity;
        }

        function play() {
            if (played || !ready) return;
            if (!size()) return;   // 尺寸還沒出來就先不算，等下次觸發
            played = true;
            if (reduceMotion) return;

            var step = 0;
            canvas.style.transition = 'none';
            at(LEVELS[0], '1');

            var timer = setInterval(function () {
                step++;
                if (step < LEVELS.length) {
                    at(LEVELS[step], '1');
                } else {
                    clearInterval(timer);
                    canvas.style.transition = '';
                    canvas.style.opacity = '0';
                }
            }, 140);
        }

        function onReady() {
            ready = true;
            if (started) play();
        }

        if (img.complete && img.naturalWidth) {
            onReady();
        } else {
            img.addEventListener('load', onReady);
            img.addEventListener('error', function () { canvas.remove(); });
        }

        var started = false;
        if (window.IntersectionObserver) {
            var io = new IntersectionObserver(function (entries) {
                if (!entries[0].isIntersecting) return;
                io.disconnect();
                started = true;
                play();
            }, { threshold: 0.25 });
            io.observe(host);
        } else {
            started = true;
            play();
        }

        // 滑鼠移入時回到字元，移出再解析成照片
        var card = host.closest('a') || host;
        card.addEventListener('mouseenter', function () {
            if (!ready || reduceMotion) return;
            at(HOVER_LEVEL, '0.92');
        });
        card.addEventListener('mouseleave', function () {
            canvas.style.opacity = '0';
        });

        window.addEventListener('resize', function () {
            if (canvas.style.opacity !== '0' && ready) at(HOVER_LEVEL, canvas.style.opacity);
        });
    }

    /* ============================================================= */
    function init() {
        var host = document.getElementById('walden-canvas');
        if (host) pond(host);

        var targets = document.querySelectorAll('[data-ascii-reveal]');
        for (var i = 0; i < targets.length; i++) reveal(targets[i]);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
