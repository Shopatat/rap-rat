// Rap Rat : minuteur du jeu de société, un fromage que le rat croque jusqu'à la fin du temps.
(() => {
  // Coordinates are in "width units": x in [0,1], y in [0,A] where A = height/width of the cheese.
  const GW = 160;                 // area-tracking grid width
  const DURATIONS = [10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60];
  const $ = id => document.getElementById(id);
  const mk = () => document.createElement('canvas');
  const rnd = (a, b) => a + Math.random() * (b - a);
  const TAU = Math.PI * 2;

  const stage = $('stage'), view = $('view'), vctx = view.getContext('2d');
  const tex = mk(), mask = mk(), inv = mk(), comp = mk();
  let SW = 1024, SH = 1024, U = 1, A = 1, GH = GW, grid = new Uint8Array(GW * GW), cells0 = 1, cells = 1;

  // ---------- settings (per-viewer convenience) ----------
  const store = {
    get(k, d) { try { const v = localStorage.getItem('raprat.' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('raprat.' + k, JSON.stringify(v)); } catch (e) {} }
  };
  let durMin = store.get('dur', 15); if (!DURATIONS.includes(durMin)) durMin = 15;
  let soundOn = store.get('sound', true);
  let showClock = store.get('clock', false);

  // ---------- cheese shape follows the screen ----------
  const MARGIN = .02;
  const dprOf = () => Math.min(window.devicePixelRatio || 1, 3);
  function stageAspect() {
    const r = stage.getBoundingClientRect();
    if (r.width < 10 || r.height < 10) return 1;
    return Math.min(2.5, Math.max(.4, r.height / r.width));
  }
  function pickResolution() {
    const r = stage.getBoundingClientRect();
    // draw at the screen's real pixel density so the cheese stays sharp
    let w = Math.round(Math.max(800, (r.width || 400) * dprOf()));
    if (w * w * A > 5.2e6) w = Math.floor(Math.sqrt(5.2e6 / A));   // keep memory sane on big screens
    return Math.max(640, w);
  }

  // ---------- cheese texture ----------
  // A hole is a smooth, glossy cavity through the slice, seen by an eye above the middle of the cheese:
  // the far opening (dark) slides toward the centre, and the outer wall shows, catching the light.
  // Holes near the middle look almost all dark. No hole is a perfect circle.
  function makeHole(x, y, r) {
    const small = r < 6 * U;
    const cx = SW / 2, cy = SH / 2, half = Math.hypot(SW, SH) / 2;
    const d = Math.hypot(x - cx, y - cy) / half;
    return {
      x, y, r, small,
      dir: Math.atan2(cy - y, cx - x) + rnd(-.08, .08),        // the exit leans toward the centre
      off: Math.min(1, d * (small ? .7 : 1.05)) * rnd(.9, 1.1),
      size: rnd(.8, .95),
      sy: 1, rot: 0,
      wob: [],                                                   // a cheese hole is a burst bubble: a perfect circle
      halo: rnd(.18, .4), haloR: rnd(1.3, 1.65),
      warm: rnd(0, 1), gloss: rnd(.25, .55), spark: !small && Math.random() < .45, sparkA: rnd(-.6, .6)
    };
  }
  // every part of a hole (glow, wall, far opening, edge) follows the same irregular outline
  function holePath(c, h, k, ox = 0, oy = 0, fresh = true) {
    const n = 64;
    if (fresh) c.beginPath();
    for (let i = 0; i <= n; i++) {
      const t = i / n * TAU;
      let m = 1; for (const [f, a, p] of h.wob) m += a * Math.cos(f * t + p);
      const rr = h.r * k * m, x = ox + rr * Math.cos(t), y = oy + rr * Math.sin(t);
      if (i === 0) c.moveTo(x, y); else c.lineTo(x, y);
    }
    c.closePath();
  }
  function drawHalo(c, h) {
    // the glow hugs the hole's own outline (the hole itself is painted over the solid part)
    c.save(); c.translate(h.x, h.y); c.rotate(h.rot); c.scale(1, h.sy);
    c.shadowColor = `rgba(252,214,124,${h.halo + .15})`; c.shadowBlur = h.r * (h.haloR - 1) * 1.6 * Math.min(1, h.sy);
    c.fillStyle = 'rgba(250,208,118,.9)'; holePath(c, h, 1); c.fill();
    c.restore();
  }
  function drawHole(c, h) {
    const r = h.r, a = h.dir - h.rot, dx = Math.cos(a), dy = Math.sin(a);
    const lw = Math.max(1, 1.1 * U);
    c.save(); c.translate(h.x, h.y); c.rotate(h.rot); c.scale(1, h.sy);
    c.save();
    holePath(c, h, 1); c.clip();
    if (h.small) {
      c.fillStyle = '#1a0b02'; c.fillRect(-r, -r, 2 * r, 2 * r);
      const g = c.createRadialGradient(-dx * r * .4, -dy * r * .4, 0, 0, 0, r);
      g.addColorStop(0, 'rgba(150,80,22,.8)'); g.addColorStop(1, 'rgba(150,80,22,0)');
      c.fillStyle = g; c.fillRect(-r, -r, 2 * r, 2 * r);
    } else {
      // inner wall: lit on the outer side, falling into shade under the rim on the centre side
      const w = h.warm;
      const wg = c.createLinearGradient(-dx * r, -dy * r, dx * r, dy * r);
      wg.addColorStop(0, `rgb(${236 + 10 * w | 0},${164 + 18 * w | 0},${66 + 10 * w | 0})`);
      wg.addColorStop(.5, `rgb(${204 + 8 * w | 0},${122 + 10 * w | 0},${38 + 6 * w | 0})`);
      wg.addColorStop(1, 'rgb(112,52,10)');
      c.fillStyle = wg; c.fillRect(-r, -r, 2 * r, 2 * r);
      // wet-looking gloss along the lit wall
      c.save();
      c.translate(-dx * r * .52, -dy * r * .52); c.rotate(a); c.scale(.45, 1);
      const gl = c.createRadialGradient(0, 0, 0, 0, 0, r * .62);
      gl.addColorStop(0, `rgba(255,238,186,${h.gloss})`); gl.addColorStop(1, 'rgba(255,238,186,0)');
      c.fillStyle = gl; c.beginPath(); c.arc(0, 0, r * .62, 0, TAU); c.fill();
      c.restore();
      // the opening on the far side of the slice
      const ex = dx * r * h.off, ey = dy * r * h.off;
      c.save();
      c.shadowColor = 'rgba(20,8,1,.85)'; c.shadowBlur = r * .14;
      c.fillStyle = 'rgb(5,2,0)'; holePath(c, h, h.size, ex, ey); c.fill();
      c.restore();
      // shadow cast by the rim on the centre side
      const sh = c.createRadialGradient(-dx * r * .3, -dy * r * .3, r * .8, -dx * r * .3, -dy * r * .3, r * 1.3);
      sh.addColorStop(0, 'rgba(60,24,4,0)'); sh.addColorStop(1, 'rgba(60,24,4,.6)');
      c.fillStyle = sh; c.fillRect(-r, -r, 2 * r, 2 * r);
      if (h.spark) {
        const t = a + Math.PI + h.sparkA, sx = Math.cos(t) * r * .78, sy = Math.sin(t) * r * .78;
        c.fillStyle = 'rgba(255,251,236,.9)';
        c.beginPath(); c.ellipse(sx, sy, r * .075, r * .04, t + Math.PI / 2, 0, TAU); c.fill();
      }
    }
    c.restore();
    // the cut edge, lit the same way as the wall: on the centre side the surface drops into shadow,
    // so the lip shows as a bright line; on the outer side it rolls softly into the lit wall
    const lip = c.createLinearGradient(dx * r, dy * r, -dx * r, -dy * r);
    lip.addColorStop(0, 'rgba(255,234,166,.8)'); lip.addColorStop(.55, 'rgba(255,234,166,.25)'); lip.addColorStop(1, 'rgba(255,234,166,0)');
    holePath(c, h, 1 + lw / r * .7); c.strokeStyle = lip; c.lineWidth = lw * 1.3; c.stroke();
    const crease = c.createLinearGradient(dx * r, dy * r, -dx * r, -dy * r);
    crease.addColorStop(0, 'rgba(70,28,2,.45)'); crease.addColorStop(.6, 'rgba(110,50,10,.18)'); crease.addColorStop(1, 'rgba(150,76,20,.3)');
    holePath(c, h, 1 - lw / r * .5); c.strokeStyle = crease; c.lineWidth = lw; c.stroke();
    c.restore();
  }

  function paintTexture() {
    const c = tex.getContext('2d');
    c.globalCompositeOperation = 'source-over';
    const big = Math.max(SW, SH);
    const cx = SW * rnd(.45, .55), cy = SH * rnd(.44, .54);
    const g = c.createRadialGradient(cx, cy, big * .02, SW * .5, SH * .5, big * .7);
    g.addColorStop(0, '#e8ad44'); g.addColorStop(.35, '#dc9234'); g.addColorStop(.7, '#cd7a2b'); g.addColorStop(1, '#bb6524');
    c.fillStyle = g; c.fillRect(0, 0, SW, SH);
    for (let i = 0; i < 160 * Math.max(A, 1 / A); i++) {
      const x = Math.random() * SW, y = Math.random() * SH, r = rnd(20, 110) * U;
      const light = Math.random() < .55;
      const m = c.createRadialGradient(x, y, 0, x, y, r);
      m.addColorStop(0, light ? 'rgba(244,190,80,.08)' : 'rgba(196,96,24,.03)');
      m.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = m; c.fillRect(x - r, y - r, 2 * r, 2 * r);
    }
    const img = c.getImageData(0, 0, SW, SH), d = img.data;
    for (let i = 0; i < d.length; i += 4) { const n = (Math.random() - .5) * 6; d[i] += n; d[i + 1] += n * .8; d[i + 2] += n * .4; }
    c.putImageData(img, 0, 0);

    const holes = [];
    const specs = [[9, 22, 31], [20, 13, 21], [14, 7, 12], [8, 3, 5.5]];
    for (const [n0, a, b] of specs) {
      const n = Math.round(n0 * (Math.max(SW, SH) / Math.min(SW, SH)));
      let placed = 0, tries = 0;
      while (placed < n && tries < 6000) {
        tries++;
        const r = rnd(a, b) * U;
        const x = r * .2 + Math.random() * (SW - r * .4), y = r * .2 + Math.random() * (SH - r * .4);
        if (holes.every(h => Math.hypot(h.x - x, h.y - y) > h.r + r + Math.max(16 * U, (h.r + r) * .9))) { holes.push(makeHole(x, y, r)); placed++; }
      }
    }
    // holes go on their own layer, softened a touch like the TV picture
    const layer = document.createElement('canvas'); layer.width = SW; layer.height = SH;
    const lc = layer.getContext('2d');
    for (const h of holes) drawHalo(lc, h);
    for (const h of holes) drawHole(lc, h);
    c.drawImage(layer, 0, 0);
    layer.width = layer.height = 0;   // free the scratch layer
    return holes;
  }

  function resetCheese() {
    A = stageAspect();
    SW = pickResolution();
    SH = Math.round(SW * A); U = Math.min(SW, SH) / 1024; GH = Math.max(1, Math.round(GW * A));
    for (const c of [tex, mask, inv, comp]) { c.width = SW; c.height = SH; }
    grid = new Uint8Array(GW * GH); grid.fill(1); cells0 = cells = GW * GH;
    paintTexture();
    const m = mask.getContext('2d');
    m.globalCompositeOperation = 'source-over';
    m.clearRect(0, 0, SW, SH); m.fillStyle = '#fff'; m.fillRect(0, 0, SW, SH);
    compose();
  }

  // ---------- compositing: texture clipped by mask + dark rim along bites ----------
  function compose() {
    const c = comp.getContext('2d');
    c.globalCompositeOperation = 'source-over';
    c.clearRect(0, 0, SW, SH);
    c.drawImage(tex, 0, 0);
    c.globalCompositeOperation = 'destination-in';
    c.drawImage(mask, 0, 0);

    const ic = inv.getContext('2d');
    ic.globalCompositeOperation = 'source-over';
    ic.clearRect(0, 0, SW, SH); ic.fillStyle = '#000'; ic.fillRect(0, 0, SW, SH);
    ic.globalCompositeOperation = 'destination-out';
    ic.drawImage(mask, 0, 0);

    const OFF = SW * 3;
    c.globalCompositeOperation = 'source-atop';
    c.shadowOffsetX = OFF; c.shadowOffsetY = 0;
    c.shadowColor = 'rgba(70,24,0,.55)'; c.shadowBlur = SW * .03;
    c.drawImage(inv, -OFF, 0);
    c.shadowColor = 'rgba(40,12,0,.8)'; c.shadowBlur = SW * .009;
    c.drawImage(inv, -OFF, 0);
    c.shadowColor = 'rgba(0,0,0,0)'; c.shadowBlur = 0; c.shadowOffsetX = 0;
    c.globalCompositeOperation = 'source-over';
  }

  // ---------- display: full screen in play, shrunk above the controls otherwise ----------
  let dimmed = false, resTop = 0, resBot = 0, wantTop = 0, wantBot = 0;
  function measureReserve() {
    wantTop = wantBot = 0;
    if (state !== 'idle' && state !== 'ended') return;
    const sr = stage.getBoundingClientRect(), dpr = dprOf();
    const bar = state === 'idle' ? $('idleBar') : $('endBar');
    if (!bar.hidden) wantBot = Math.max(0, sr.bottom - bar.getBoundingClientRect().top) * dpr;
    if (!$('header').hidden) wantTop = Math.max(0, $('header').getBoundingClientRect().bottom + 8 - sr.top) * dpr;
  }
  function draw() {
    const w = view.width, h = view.height;
    vctx.setTransform(1, 0, 0, 1, 0, 0);
    vctx.fillStyle = '#060403'; vctx.fillRect(0, 0, w, h);
    const m = Math.min(w, h) * MARGIN;
    const top = Math.max(m, resTop), bot = Math.max(m, resBot);
    const aw = w - 2 * m, ah = Math.max(10, h - top - bot);
    const s = Math.min(aw / SW, ah / SH);
    const dw = SW * s, dh = SH * s;
    vctx.imageSmoothingEnabled = true; vctx.imageSmoothingQuality = 'high';
    vctx.globalAlpha = dimmed ? .45 : 1;
    vctx.drawImage(comp, (w - dw) / 2, top + (ah - dh) / 2, dw, dh);
    vctx.globalAlpha = 1;
  }
  let reshapeT = null;
  function fit() {
    const r = stage.getBoundingClientRect(), dpr = dprOf();
    view.width = Math.max(1, Math.round(r.width * dpr)); view.height = Math.max(1, Math.round(r.height * dpr));
    measureReserve(); resTop = wantTop; resBot = wantBot;
    draw();
    if (state === 'idle') {          // before a game starts, reshape the cheese to the new screen
      clearTimeout(reshapeT);
      reshapeT = setTimeout(() => { if (state === 'idle' && Math.abs(stageAspect() - A) > .04) { resetCheese(); draw(); } }, 200);
    }
  }

  // ---------- bites ----------
  function shapeTemplate() {
    // a rat bites with its two front teeth: two long, straight incisor marks side by side,
    // pushed straight into the cheese, rounded at the tip, one usually a little longer;
    // now and then the pair leans a bit. The rim of each mark is softly wavy.
    const out = [], pair = Math.random() < .92;
    const tilt = Math.random() < .8 ? rnd(-.25, .25) : rnd(-.6, .6);
    const w = .5;                                          // half-width of one tooth (tooth width = R)
    const lenA = rnd(.95, 1.45), lenB = lenA + rnd(-.45, .45) * (Math.random() < .75 ? 1 : .3);
    const teeth = pair ? [{ u: -w * rnd(.9, 1), len: lenA }, { u: w * rnd(.9, 1), len: Math.max(.7, lenB) }]
                       : [{ u: 0, len: rnd(1, 1.4) }];
    const ct = Math.cos(tilt), st = Math.sin(tilt);
    const put = (u, v, r) => out.push({ u: u * ct - v * st, v: u * st + v * ct, r });
    for (const t of teeth) {
      const tt = rnd(-.08, .08), c2 = Math.cos(tt), s2 = Math.sin(tt);
      const loc = (x, y, r) => put(t.u + x * c2 - y * s2, x * s2 + y * c2, r);
      const top = .7, vc = -(t.len - w);                   // the mark runs from outside the edge to its rounded tip
      for (let y = top; y >= vc; y -= w * .45) loc(0, y, w * .86);
      loc(0, vc, w * .86);
      // soft waves along both sides and around the tip
      const rb0 = w * rnd(.3, .38), step = rb0 * 1.25;
      const edge = [];
      for (let y = top; y > vc; y -= step) { edge.push([-w, y, 1, 0]); edge.push([w, y, -1, 0]); }
      const n = Math.max(4, Math.round(Math.PI * w / step));
      for (let k = 0; k <= n; k++) {
        const a = Math.PI + k / n * Math.PI;                 // lower half circle: the tip
        const ex = Math.cos(a) * w, ey = vc + Math.sin(a) * w;
        edge.push([ex, ey, -Math.cos(a), -Math.sin(a)]);
      }
      for (const [x, y, mx, my] of edge) {
        const rb = rb0 * rnd(.88, 1.12), d = rb * rnd(.9, 1.05);
        loc(x + mx * d, y + my * d, rb);
      }
    }
    return out;
  }
  function realize(tpl, px, py, nx, ny, R, push) {
    const tx = -ny, ty = nx, cx = px + nx * R * push, cy = py + ny * R * push;
    return tpl.map(o => ({ x: cx + tx * o.u * R + nx * o.v * R, y: cy + ty * o.u * R + ny * o.v * R, r: o.r * R }));
  }
  function forCellsIn(circles, fn) {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const c of circles) { x0 = Math.min(x0, c.x - c.r); y0 = Math.min(y0, c.y - c.r); x1 = Math.max(x1, c.x + c.r); y1 = Math.max(y1, c.y + c.r); }
    const i0 = Math.max(0, Math.floor(x0 * GW)), i1 = Math.min(GW - 1, Math.ceil(x1 * GW));
    const j0 = Math.max(0, Math.floor(y0 * GW)), j1 = Math.min(GH - 1, Math.ceil(y1 * GW));
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
      const idx = j * GW + i; if (!grid[idx]) continue;
      const x = (i + .5) / GW, y = (j + .5) / GW;
      for (const c of circles) { const dx = x - c.x, dy = y - c.y; if (dx * dx + dy * dy <= c.r * c.r) { fn(idx); break; } }
    }
  }
  function countRemoval(circles) { let n = 0; forCellsIn(circles, () => n++); return n; }

  // Pick a spot on the cheese's edge. Spots far from the middle are much more likely,
  // so the rat works from the outside in and the last morsel ends up near the centre.
  function pickEdge() {
    const edge = [], wts = []; let total = 0;
    const mx = .5, my = A / 2;
    for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) {
      const idx = j * GW + i;
      if (!grid[idx]) continue;
      if (i === 0 || j === 0 || i === GW - 1 || j === GH - 1 || !grid[idx - 1] || !grid[idx + 1] || !grid[idx - GW] || !grid[idx + GW]) {
        const dx = Math.abs((i + .5) / GW - mx) / .5, dy = Math.abs((j + .5) / GW - my) / (A / 2);
        const d = Math.max(dx, dy) - .2 * Math.min(dx, dy);   // middles of the sides first, corners a bit later
        const w = Math.pow(d, 4) + .015;
        edge.push(idx); wts.push(w); total += w;
      }
    }
    if (!edge.length) return null;
    let pick = Math.random() * total, k = 0;
    while (k < edge.length - 1 && (pick -= wts[k]) > 0) k++;
    const idx = edge[k], i = idx % GW, j = (idx / GW) | 0;
    let nx = 0, ny = 0;
    for (let dj = -5; dj <= 5; dj++) for (let di = -5; di <= 5; di++) {
      const a = i + di, b = j + dj;
      if (a < 0 || b < 0 || a >= GW || b >= GH || !grid[b * GW + a]) { nx += di; ny += dj; }
    }
    const px = (i + .5) / GW, py = (j + .5) / GW;
    let rx = px - mx, ry = py - my; const rl = Math.hypot(rx, ry) || 1; rx /= rl; ry /= rl;
    const l = Math.hypot(nx, ny);
    if (l > 1e-6) { nx = nx / l + rx * .45; ny = ny / l + ry * .45; } else { nx = rx; ny = ry; }
    const l2 = Math.hypot(nx, ny) || 1;
    return { x: px, y: py, nx: nx / l2, ny: ny / l2 };
  }

  function applyBite(circles) {
    const m = mask.getContext('2d');
    m.globalCompositeOperation = 'destination-out';
    m.fillStyle = '#000';
    m.beginPath();
    for (const c of circles) { m.moveTo(c.x * SW + c.r * SW, c.y * SW); m.arc(c.x * SW, c.y * SW, c.r * SW, 0, TAU); }
    m.fill();
    m.globalCompositeOperation = 'source-over';
    forCellsIn(circles, idx => { grid[idx] = 0; cells--; });
  }

  function clearAll() {
    const m = mask.getContext('2d'); m.globalCompositeOperation = 'source-over'; m.clearRect(0, 0, SW, SH);
    grid.fill(0); cells = 0;
  }

  function bite(k, total) {
    if (k === total - 1) {        // last bite: swallow whatever is left
      let sx = 0, sy = 0, n = 0;
      for (let idx = 0; idx < grid.length; idx++) if (grid[idx]) { sx += idx % GW; sy += (idx / GW) | 0; n++; }
      if (n) {
        const cx = (sx / n + .5) / GW, cy = (sy / n + .5) / GW; let md = 0;
        for (let idx = 0; idx < grid.length; idx++) if (grid[idx]) md = Math.max(md, Math.hypot((idx % GW + .5) / GW - cx, (((idx / GW) | 0) + .5) / GW - cy));
        applyBite(realize(shapeTemplate(), cx, cy, 1, 0, md / .6 + .02, 0));
      }
      clearAll();
      return;
    }
    const target = cells0 * (1 - (k + 1) / total), needed = cells - target;
    const e = pickEdge(); if (!e) return;
    // bite size is the one measured on the show (about 1.7 % of the slice per bite, centred on the edge),
    // scaled to the cheese's area; pacing may only nudge it, so every bite looks like the TV one
    const R0 = .092 * Math.sqrt(A / .75), late = k > total * .9;
    const tpl = shapeTemplate(), PUSH = .05, RMIN = R0 * .8, RMAX = R0 * (late ? 1.8 : 1.25);
    let R = RMIN;
    if (needed > 0) {
      let lo = RMIN, hi = RMAX;
      if (countRemoval(realize(tpl, e.x, e.y, e.nx, e.ny, hi, PUSH)) <= needed) R = hi;
      else {
        for (let it = 0; it < 11; it++) { const mid = (lo + hi) / 2; if (countRemoval(realize(tpl, e.x, e.y, e.nx, e.ny, mid, PUSH)) >= needed) hi = mid; else lo = mid; }
        R = hi;
      }
    }
    applyBite(realize(tpl, e.x, e.y, e.nx, e.ny, R, PUSH));
  }

  // ---------- sound ----------
  let ac = null, noise = null;
  function ensureAudio() {
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    if (!ac) {
      ac = new AC();
      noise = ac.createBuffer(1, Math.floor(ac.sampleRate * .6), ac.sampleRate);
      const d = noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    if (ac.state === 'suspended') ac.resume().catch(() => {});
  }
  function crunch(big) {
    if (!soundOn || !ac) return;
    const t0 = ac.currentTime + .01, master = ac.createGain();
    master.gain.value = big ? 1 : .85; master.connect(ac.destination);
    const n = big ? 8 : 4 + Math.floor(Math.random() * 2);
    let t = t0;
    for (let i = 0; i < n; i++) {
      const src = ac.createBufferSource(); src.buffer = noise;
      const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1100 + Math.random() * 2900; bp.Q.value = .9;
      const g = ac.createGain(), peak = Math.max(.08, (.95 - i * .1) * (.6 + Math.random() * .4));
      g.gain.setValueAtTime(.0001, t);
      g.gain.exponentialRampToValueAtTime(peak, t + .004);
      g.gain.exponentialRampToValueAtTime(.0001, t + .04 + Math.random() * .05);
      src.connect(bp); bp.connect(g); g.connect(master);
      src.start(t, Math.random() * .4, .12);
      t += .026 + Math.random() * .032;
    }
    const o = ac.createOscillator(), og = ac.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(150, t0); o.frequency.exponentialRampToValueAtTime(55, t0 + .12);
    og.gain.setValueAtTime(.0001, t0); og.gain.exponentialRampToValueAtTime(.5, t0 + .008); og.gain.exponentialRampToValueAtTime(.0001, t0 + .14);
    o.connect(og); og.connect(master); o.start(t0); o.stop(t0 + .16);
  }

  // ---------- screen stays awake ----------
  let wake = null;
  async function keepAwake() { try { if (navigator.wakeLock && !wake) { wake = await navigator.wakeLock.request('screen'); wake.addEventListener('release', () => { wake = null; }); } } catch (e) { wake = null; } }
  function letSleep() { try { if (wake) wake.release(); } catch (e) {} wake = null; }
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && state === 'running') keepAwake(); });

  // ---------- game flow ----------
  let state = 'idle', elapsed = 0, last = 0, times = [], next = 0, duration = durMin * 60;

  // The bite count is always the one of the 15-minute show (a bite every 10–15 s), so every bite
  // keeps the size seen on TV; a longer timer just spaces the same bites further apart.
  const BITES = 72;
  function schedule(D) {
    const ints = []; let s = 0;
    for (let i = 0; i < BITES; i++) { const v = rnd(.8, 1.2); ints.push(v); s += v; }
    const k = (D - .5) / s, out = [.5]; let t = .5;
    for (const v of ints) { t += v * k; out.push(t); }
    out[out.length - 1] = D;
    return out;
  }

  function fmt(sec) { sec = Math.max(0, Math.ceil(sec)); return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0'); }
  function setBanner(html) { const b = $('banner'); if (html) { b.innerHTML = '<div>' + html + '</div>'; b.hidden = false; } else b.hidden = true; }
  function jolt() { view.classList.remove('jolt'); void view.offsetWidth; view.classList.add('jolt'); }

  // controls that appear on touch, then hide again
  let hideT = null;
  function hideControls() { clearTimeout(hideT); $('runBar').classList.add('away'); stage.classList.add('nocursor'); }
  function showControls() {
    if (state !== 'running' && state !== 'paused') return;
    $('runBar').classList.remove('away'); stage.classList.remove('nocursor');
    clearTimeout(hideT);
    if (state === 'running') hideT = setTimeout(() => { if (state === 'running') hideControls(); }, 4000);
  }

  function render() {
    $('idleBar').hidden = state !== 'idle';
    $('runBar').hidden = !(state === 'running' || state === 'paused');
    $('endBar').hidden = state !== 'ended';
    $('header').hidden = state !== 'idle';
    $('pauseBtn').textContent = state === 'paused' ? 'Reprendre' : 'Pause';
    $('clock').hidden = !(showClock && (state === 'running' || state === 'paused'));
    $('clock').textContent = fmt(duration - elapsed);
    $('durOut').textContent = durMin + ' min';
    $('durMinus').disabled = durMin === DURATIONS[0];
    $('durPlus').disabled = durMin === DURATIONS[DURATIONS.length - 1];
    $('soundBtn').textContent = 'Son : ' + (soundOn ? 'oui' : 'non');
    $('soundBtn').setAttribute('aria-pressed', String(soundOn));
    $('clockBtn').textContent = 'Chrono : ' + (showClock ? 'visible' : 'caché');
    $('clockBtn').setAttribute('aria-pressed', String(showClock));
    if (state !== 'running') stage.classList.remove('nocursor');
    dimmed = state === 'paused';
    measureReserve();
    draw();
  }

  function start() {
    ensureAudio();
    duration = durMin * 60; times = schedule(duration); next = 0; elapsed = 0; last = Date.now();
    state = 'running'; setBanner(''); keepAwake(); render(); hideControls();
  }
  function pause() { if (state !== 'running') return; state = 'paused'; letSleep(); setBanner('Pause'); render(); showControls(); }
  function resume() { if (state !== 'paused') return; ensureAudio(); state = 'running'; last = Date.now(); setBanner(''); keepAwake(); render(); hideControls(); }
  function end() { state = 'ended'; letSleep(); hideControls(); setBanner('Plus de fromage !<small>Le rat a tout mangé.</small>'); render(); }
  function toIdle() { state = 'idle'; elapsed = 0; letSleep(); setBanner(''); if (Math.abs(stageAspect() - A) > .01 || cells < cells0) resetCheese(); render(); }

  let prevNow = performance.now();
  function tick(now) {
    const dt = Math.min(.1, (now - prevNow) / 1000); prevNow = now;
    if (Math.abs(resTop - wantTop) > .5 || Math.abs(resBot - wantBot) > .5) {   // ease the cheese between sizes
      const f = 1 - Math.exp(-dt * 9);
      resTop += (wantTop - resTop) * f; resBot += (wantBot - resBot) * f;
      if (Math.abs(resTop - wantTop) <= .5) resTop = wantTop;
      if (Math.abs(resBot - wantBot) <= .5) resBot = wantBot;
      draw();
    }
    if (state === 'running') {
      const wall = Date.now(); elapsed += (wall - last) / 1000; last = wall;
      let bit = false, final = false;
      while (next < times.length && elapsed >= times[next]) {
        bite(next, times.length); bit = true; if (next === times.length - 1) final = true; next++;
      }
      if (bit) { compose(); draw(); jolt(); crunch(final); }
      $('clock').textContent = fmt(duration - elapsed);
      if (next >= times.length) end();
    }
    requestAnimationFrame(tick);
  }

  // ---------- controls ----------
  stage.addEventListener('pointerdown', showControls);
  stage.addEventListener('mousemove', () => { if (state === 'running' && $('runBar').classList.contains('away')) showControls(); });
  $('runBar').addEventListener('pointerdown', showControls);
  $('startBtn').addEventListener('click', start);
  $('againBtn').addEventListener('click', toIdle);
  $('pauseBtn').addEventListener('click', () => state === 'paused' ? resume() : pause());
  let armed = null;
  $('restartBtn').addEventListener('click', () => {
    const b = $('restartBtn');
    if (armed) { clearTimeout(armed); armed = null; b.textContent = 'Recommencer'; b.classList.remove('warn'); toIdle(); return; }
    b.textContent = 'Sûr ? Retouche'; b.classList.add('warn');
    armed = setTimeout(() => { armed = null; b.textContent = 'Recommencer'; b.classList.remove('warn'); }, 3000);
  });
  $('durMinus').addEventListener('click', () => { const i = DURATIONS.indexOf(durMin); if (i > 0) { durMin = DURATIONS[i - 1]; store.set('dur', durMin); render(); } });
  $('durPlus').addEventListener('click', () => { const i = DURATIONS.indexOf(durMin); if (i < DURATIONS.length - 1) { durMin = DURATIONS[i + 1]; store.set('dur', durMin); render(); } });
  $('soundBtn').addEventListener('click', () => { soundOn = !soundOn; store.set('sound', soundOn); if (soundOn) { ensureAudio(); crunch(false); } render(); });
  $('clockBtn').addEventListener('click', () => { showClock = !showClock; store.set('clock', showClock); render(); });
  if (document.fullscreenEnabled) {
    $('fsBtn').hidden = false;
    $('fsBtn').addEventListener('click', () => {
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      else document.documentElement.requestFullscreen().catch(() => {});
    });
  }
  document.addEventListener('keydown', e => {
    if (e.code !== 'Space' || e.target.tagName === 'BUTTON') return;
    e.preventDefault();
    if (state === 'idle') start(); else if (state === 'running') pause(); else if (state === 'paused') resume();
  });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { measureReserve(); });

  // test hook: jump ahead in the current game
  window.RapRat = { skip(sec) { if (state === 'running' || state === 'paused') elapsed += sec; } };

  resetCheese(); render();
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
  new ResizeObserver(fit).observe(stage);
  requestAnimationFrame(tick);
})();
