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
  const tex = mk(), mask = mk(), inv = mk(), comp = mk(), face = mk();
  // EPAISSEUR : la hauteur de la paroi, en part de la hauteur de l'écran (réglable dans l'atelier)
  let EPAISSEUR = .022, nTrous = 0;

  // ---------- le style de la pâte (piloté par l'Atelier des fromages) ----------
  // Les valeurs par défaut sont la tranche telle qu'elle est depuis la v32 : lisse et propre.
  // Fabien la trouve trop propre par rapport aux captures, où la pâte est marbrée, sombre sur
  // les bords, et adoucie par la bande. Ces réglages servent à s'en approcher.
  const STYLE0 = {
    teinte: 0,        // -40 à 40, degrés de décalage de la couleur
    chaleur: 1,       // 0 à 2, saturation
    clair: 1,         // .6 à 1.4, clarté d'ensemble
    marbrures: 1,     // 0 à 4, force des grandes plages claires et sombres
    taille: 1,        // .4 à 2.5, leur taille
    nombre: 1,        // .3 à 4, combien
    taches: 0,        // 0 à 1, plaques brun-rouge en plus
    vignette: 0,      // 0 à 1, les bords qui plongent dans le brun
    grain: 0,         // 0 à 1, grain de la bande
    lignes: 0,        // 0 à 1, lignes de balayage
    flou: 0,          // 0 à 1, l'image adoucie
    bave: 0,          // 0 à 1, la couleur qui bave horizontalement
    graine: 0         // 0 = au hasard ; sinon la même tranche revient à l'identique
  };
  let STYLE = Object.assign({}, STYLE0);

  // la couleur de base, décalée en teinte, en saturation et en clarté
  function teinter(hex, S) {
    let r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    if (S.teinte) {
      const a = S.teinte * Math.PI / 180, co = Math.cos(a), si = Math.sin(a);
      const nr = r * (.213 + co * .787 - si * .213) + g * (.715 - co * .715 - si * .715) + b * (.072 - co * .072 + si * .928);
      const ng = r * (.213 - co * .213 + si * .143) + g * (.715 + co * .285 + si * .140) + b * (.072 - co * .072 - si * .283);
      const nb = r * (.213 - co * .213 - si * .787) + g * (.715 - co * .715 + si * .715) + b * (.072 + co * .928 + si * .072);
      r = nr; g = ng; b = nb;
    }
    const l = .299 * r + .587 * g + .114 * b;
    r = l + (r - l) * S.chaleur; g = l + (g - l) * S.chaleur; b = l + (b - l) * S.chaleur;
    const q = v => Math.max(0, Math.min(255, Math.round(v * S.clair)));
    return `rgb(${q(r)},${q(g)},${q(b)})`;
  }
  let SW = 1024, SH = 1024, U = 1, A = 1, GH = GW, grid = new Uint8Array(GW * GW), cells0 = 1, cells = 1;

  // ---------- settings (per-viewer convenience) ----------
  const store = {
    get(k, d) { try { const v = localStorage.getItem('raprat.' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('raprat.' + k, JSON.stringify(v)); } catch (e) {} }
  };
  let durMin = store.get('dur', 15); if (!DURATIONS.includes(durMin)) durMin = 15;
  let soundOn = store.get('sound', true);

  // ---------- cheese shape follows the screen ----------
  // 0 : la tranche touche les bords de l'écran, pas de liseré noir autour
  const MARGIN = 0;
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
  function makeHole(x, y, r, RA = Math.random, rr = rnd) {
    const small = r < 6 * U;
    const cx = SW / 2, cy = SH / 2, half = Math.hypot(SW, SH) / 2;
    const d = Math.hypot(x - cx, y - cy) / half;
    return {
      x, y, r, small,
      dir: Math.atan2(cy - y, cx - x) + rr(-.08, .08),        // the exit leans toward the centre
      off: Math.min(1, d * (small ? .7 : 1.05)) * rr(.9, 1.1),
      size: rr(.8, .95),
      sy: 1, rot: 0,
      wob: [],                                                   // a cheese hole is a burst bubble: a perfect circle
      // le halo clair autour du trou : sur l'émission, les gros trous sont des cratères dont le
      // pourtour se soulève et accroche la lumière ; le bord du trou, lui, reste net
      halo: small ? rr(.14, .28) : rr(.34, .56), haloR: small ? rr(1.25, 1.5) : rr(1.45, 1.85),
      warm: rr(0, 1), gloss: rr(.25, .55), spark: !small && RA() < .45, sparkA: rr(-.6, .6)
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

  // La pâte. Avec une graine, la même tranche revient à l'identique : c'est ce qui permet de
  // comparer deux styles sur exactement le même fromage, mêmes trous, mêmes marbrures.
  function paintTexture() {
    const S = STYLE;
    const RA = S.graine ? alea(S.graine) : Math.random;
    const rr = (a, b) => a + RA() * (b - a);
    const c = tex.getContext('2d');
    c.filter = 'none'; c.globalAlpha = 1;
    c.globalCompositeOperation = 'source-over';
    const big = Math.max(SW, SH);
    const cx = SW * rr(.45, .55), cy = SH * rr(.44, .54);
    const g = c.createRadialGradient(cx, cy, big * .02, SW * .5, SH * .5, big * .7);
    for (const [t, col] of [[0, '#e8ad44'], [.35, '#dc9234'], [.7, '#cd7a2b'], [1, '#bb6524']]) g.addColorStop(t, teinter(col, S));
    c.fillStyle = g; c.fillRect(0, 0, SW, SH);
    // Les grandes ondulations de la surface. Sur les gros plans elles sont bien plus marquées
    // que sur notre tranche : la pâte est marbrée par larges plages, pas uniforme.
    const nM = Math.round(18 * Math.max(A, 1 / A) * S.nombre);
    for (let i = 0; i < nM; i++) {
      const x = RA() * SW, y = RA() * SH, r = rr(180, 460) * U * S.taille;
      const light = RA() < .5;
      const m = c.createRadialGradient(x, y, 0, x, y, r);
      m.addColorStop(0, light ? `rgba(248,196,92,${(.13 * S.marbrures).toFixed(3)})` : `rgba(150,62,12,${(.09 * S.marbrures).toFixed(3)})`);
      m.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = m; c.fillRect(x - r, y - r, 2 * r, 2 * r);
    }
    // Des plaques brun-rouge, comme les zones sombres des gros plans.
    if (S.taches > 0) {
      const nT = Math.round(10 * Math.max(A, 1 / A) * S.taches);
      for (let i = 0; i < nT; i++) {
        const x = RA() * SW, y = RA() * SH, r = rr(90, 300) * U * S.taille;
        const m = c.createRadialGradient(x, y, 0, x, y, r);
        m.addColorStop(0, `rgba(126,44,6,${(.22 * S.taches).toFixed(3)})`);
        m.addColorStop(.6, `rgba(150,62,12,${(.10 * S.taches).toFixed(3)})`);
        m.addColorStop(1, 'rgba(0,0,0,0)');
        c.fillStyle = m; c.fillRect(x - r, y - r, 2 * r, 2 * r);
      }
    }
    // Les bords qui plongent dans le brun.
    if (S.vignette > 0) {
      const v = c.createRadialGradient(SW / 2, SH / 2, big * .25, SW / 2, SH / 2, big * .72);
      v.addColorStop(0, 'rgba(90,30,2,0)');
      v.addColorStop(1, `rgba(90,30,2,${(.55 * S.vignette).toFixed(3)})`);
      c.fillStyle = v; c.fillRect(0, 0, SW, SH);
    }

    // Les trous : moins nombreux et plus gros qu'avant, groupés vers le milieu, rares près des
    // bords. Aucun ne touche le bord de la tranche : Fabien n'en veut pas (voir CLAUDE.md).
    const holes = [];
    const specs = [[10, 22, 34], [5, 15, 21], [10, 8, 12], [7, 3.5, 6]];
    for (const [n0, a, b] of specs) {
      const n = Math.round(n0 * (Math.max(SW, SH) / Math.min(SW, SH)));
      let placed = 0, tries = 0;
      while (placed < n && tries < 9000) {
        tries++;
        const r = rr(a, b) * U, m = r * 1.6 + 8 * U;
        const x = m + RA() * (SW - 2 * m), y = m + RA() * (SH - 2 * m);
        const nx = (x - SW / 2) / (SW / 2), ny = (y - SH / 2) / (SH / 2);
        if (RA() > Math.exp(-(nx * nx + ny * ny) / (2 * .6 * .6))) continue;   // vers le milieu
        if (holes.every(h => Math.hypot(h.x - x, h.y - y) > h.r + r + Math.max(10 * U, (h.r + r) * .45))) { holes.push(makeHole(x, y, r, RA, rr)); placed++; }
      }
    }
    const layer = mk(); layer.width = SW; layer.height = SH;
    const lc = layer.getContext('2d');
    for (const h of holes) drawHalo(lc, h);
    for (const h of holes) drawHole(lc, h);
    c.drawImage(layer, 0, 0);
    layer.width = layer.height = 0;   // free the scratch layer
    nTrous = holes.length;

    finirImage(c, S);
    return holes;
  }

  // Ce que la cassette ajoute par-dessus l'image : la couleur qui bave, l'image adoucie,
  // les lignes de balayage, le grain. Toujours en dernier, après les trous.
  function finirImage(c, S) {
    const copie = () => { const t = mk(); t.width = SW; t.height = SH; t.getContext('2d').drawImage(tex, 0, 0); return t; };
    if (S.bave > 0) {
      const d = Math.max(1, S.bave * .018 * SW), t = copie();
      c.clearRect(0, 0, SW, SH);
      c.globalAlpha = 1; c.drawImage(t, 0, 0);
      c.globalAlpha = .28;
      for (const k of [-1, 1, -.5, .5]) c.drawImage(t, k * d, 0);
      c.globalAlpha = 1;
      t.width = t.height = 0;
    }
    if (S.flou > 0) {
      const t = copie();
      c.clearRect(0, 0, SW, SH);
      c.filter = `blur(${(S.flou * .006 * Math.min(SW, SH)).toFixed(2)}px)`;
      c.drawImage(t, 0, 0);
      c.filter = 'none';
      t.width = t.height = 0;
    }
    if (S.lignes > 0) {
      const pas = Math.max(1, Math.round(SH / 480));
      c.fillStyle = `rgba(0,0,0,${(.16 * S.lignes).toFixed(3)})`;
      for (let y = 0; y < SH; y += pas * 2) c.fillRect(0, y, SW, pas);
    }
    // un tramage d'un seul niveau pour que les grands dégradés ne fassent pas d'escaliers sur
    // l'écran, et le grain de la bande par-dessus si on en veut
    const amp = .5 + S.grain * 26;
    const img = c.getImageData(0, 0, SW, SH), d2 = img.data;
    for (let i = 0; i < d2.length; i += 4) { const n = (Math.random() - .5) * amp; d2[i] += n; d2[i + 1] += n; d2[i + 2] += n; }
    c.putImageData(img, 0, 0);
  }

  function resetCheese() {
    A = stageAspect();
    SW = pickResolution();
    SH = Math.round(SW * A); U = Math.min(SW, SH) / 1024; GH = Math.max(1, Math.round(GW * A));
    for (const c of [tex, mask, inv, comp, face]) { c.width = SW; c.height = SH; }
    grid = new Uint8Array(GW * GH); grid.fill(1); cells0 = cells = GW * GH;
    foyers = []; derniers = [];      // nouvelle tranche, nouveaux foyers
    paintTexture();
    const m = mask.getContext('2d');
    m.globalCompositeOperation = 'source-over';
    m.clearRect(0, 0, SW, SH); m.fillStyle = '#fff'; m.fillRect(0, 0, SW, SH);
    compose();
  }

  // ---------- compositing: texture clipped by mask + dark rim along bites ----------
  // La tranche n'est pas un décalque : c'est une dalle épaisse aux bords arrondis (voir plus bas).
  // Essayé avant : une paroi décalée sous la silhouette (v30). Elle faisait déborder une bande
  // ambrée sous les morsures, qu'on ne voit nulle part sur l'émission — retirée.
  function compose() {
    const f = face.getContext('2d');
    f.globalCompositeOperation = 'source-over';
    f.clearRect(0, 0, SW, SH);
    f.drawImage(tex, 0, 0);
    f.globalCompositeOperation = 'destination-in';
    f.drawImage(mask, 0, 0);

    const ic = inv.getContext('2d');
    ic.globalCompositeOperation = 'source-over';
    ic.clearRect(0, 0, SW, SH); ic.fillStyle = '#000'; ic.fillRect(0, 0, SW, SH);
    ic.globalCompositeOperation = 'destination-out';
    ic.drawImage(mask, 0, 0);

    // L'épaisseur de la tranche, relevée en gros plan sur les captures (`references/relief/`) :
    // la tranche est une dalle épaisse aux bords arrondis. À chaque bord, la face du dessus
    // s'enroule vers le bas : côté lumière (en haut à gauche) le haut de l'arrondi accroche un
    // liseré jaune clair, puis tout le bord plonge dans un brun-rouge chaud avant le noir ; côté
    // ombre (en bas à droite) ce brun-rouge s'étale plus large. Rien ne dépasse de la silhouette,
    // qui reste nette : tout se passe à l'intérieur, comme sur l'émission.
    // Technique : dessiné très à gauche, l'inverse du masque ne laisse que son ombre, décalée pile
    // en place — une ombre projetée vers l'intérieur du fromage, qu'on oriente à volonté.
    const OFF = SW * 3, T = Math.max(2, SH * EPAISSEUR);
    const ombre = (dx, dy, couleur, flou) => {
      f.shadowOffsetX = OFF + dx; f.shadowOffsetY = dy; f.shadowColor = couleur; f.shadowBlur = flou;
      f.drawImage(inv, -OFF, 0);
    };
    f.globalCompositeOperation = 'source-atop';
    ombre(0, 0, 'rgba(90,38,0,.22)', T * 2.6);                         // le bombé de la dalle
    ombre(-T * .5, -T * .5, 'rgba(104,28,4,.8)', T * 1.4);             // l'arrondi côté ombre
    ombre(T * .45, T * .45, 'rgba(255,228,146,.62)', T * .32);         // le liseré côté lumière
    ombre(0, 0, 'rgba(78,20,2,.88)', T * .26);                         // le bord qui plonge
    f.shadowColor = 'rgba(0,0,0,0)'; f.shadowBlur = 0; f.shadowOffsetX = 0; f.shadowOffsetY = 0;
    f.globalCompositeOperation = 'source-over';

    const c = comp.getContext('2d');
    c.globalCompositeOperation = 'source-over';
    c.clearRect(0, 0, SW, SH);
    c.drawImage(face, 0, 0);
  }

  // ---------- display: full screen in play, shrunk above the controls otherwise ----------
  let dimmed = false, resTop = 0, resBot = 0, wantTop = 0, wantBot = 0, cadreVu = null;
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
    cadreVu = { x: (w - dw) / 2, y: top + (ah - dh) / 2, w: dw, h: dh, vw: w, vh: h };
    if (introStart !== null) drawIntro(frozen !== null ? frozen : (performance.now() - introStart) / 1000, (w - dw) / 2, top + (ah - dh) / 2, dw, dh);
    vctx.globalAlpha = 1;
  }
  let reshapeT = null;
  function fit() {
    const r = stage.getBoundingClientRect(), dpr = dprOf();
    view.width = Math.max(1, Math.round(r.width * dpr)); view.height = Math.max(1, Math.round(r.height * dpr));
    measureReserve(); resTop = wantTop; resBot = wantBot;
    draw();
    // en portrait le panneau « tourne ton téléphone » couvre tout : inutile de refaire
    // une tranche debout, on garde celle du paysage et on la retrouve en tournant
    if (state === 'idle' && r.width >= r.height) {   // avant la partie, la tranche épouse l'écran
      clearTimeout(reshapeT);
      reshapeT = setTimeout(() => { if (state === 'idle' && Math.abs(stageAspect() - A) > .04) { resetCheese(); draw(); } }, 200);
    }
  }

  // ---------- bites ----------
  const WAVE = { depth: .08, width: .37, irr: .15 };
  // un hasard qu'on peut rejouer : la même graine redonne le même bord ondulé
  function alea(graine) {
    let s = (graine >>> 0) || 1;
    return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
  }
  // the rat's bite, as on the show: two big round marks fused side by side, a small notch where
  // they meet, the rim only gently rippled. Most bites go straight in; now and then (subtly)
  // the rat bites a little askew, or not quite as deep.
  // tirerForme() tire les quelques nombres qui décrivent un croc, shapeTemplate() en fait les ronds.
  // Tout le hasard du bord ondulé vient de la graine : un croc enregistré dans l'Atelier des
  // morsures (outils/atelier-morsures.html) se rejoue donc à l'identique.
  function tirerForme() {
    const askew = Math.random() < .35;
    const tilt = askew ? (Math.random() < .5 ? -1 : 1) * rnd(.18, .45) : rnd(-.12, .12);
    const shallow = askew && Math.random() < .6 ? rnd(.08, .25) : 0;   // shifts the bite out of the cheese
    // on the show the teeth often push further in, like two fingers reaching into the slice
    const advance = !shallow && Math.random() < .65 ? rnd(.2, .55) : 0;
    const L0 = rnd(.82, .9);
    return { lobes: 2, L: [L0, L0 * rnd(.9, 1.1)], ecart: rnd(.56, .62), tilt, shallow, advance,
      vague: { depth: WAVE.depth, width: WAVE.width, irr: WAVE.irr }, graine: (Math.random() * 4294967296) >>> 0 };
  }
  function shapeTemplate(p = tirerForme()) {
    // une forme dessinée au doigt dans l'Atelier des morsures : un contour fermé, en rayons de
    // croc (u le long du bord, v vers l'extérieur), tourné du biais et poussé de l'avancée
    if (p.contour) {
      const ct = Math.cos(p.tilt || 0), st = Math.sin(p.tilt || 0), dv = (p.shallow || 0) - (p.advance || 0), out = [];
      out.poly = p.contour.map(([u, v]) => [u * ct - v * st, u * st + v * ct + dv]);
      return out;
    }
    const out = [], hasard = alea(p.graine), n = Math.max(1, Math.round(p.lobes || 2));
    const Ls = []; for (let i = 0; i < n; i++) Ls.push(p.L[Math.min(i, p.L.length - 1)]);
    // les ronds côte à côte : chacun à `ecart` × (les deux rayons) de son voisin, le tout centré
    const pos = [0]; for (let i = 1; i < n; i++) pos.push(pos[i - 1] + (Ls[i - 1] + Ls[i]) * p.ecart);
    const mid = (pos[0] + pos[n - 1]) / 2, V = p.vague || WAVE;
    const ct = Math.cos(p.tilt), st = Math.sin(p.tilt);
    for (let i = 0; i < n; i++) {
      const L = Ls[i], q = pos[i] - mid;
      const along = q * ct, depth = q * st + p.shallow - p.advance;
      // rim waves, as set by Fabien in the Atelier des vagues: depth 8 %, width 37 %, irregularity 15 %
      // (each wave is a circle whose cap, of chord `s`, rises `d` above the main circle)
      const d = Math.max(0, V.depth) * L, s = Math.max(.04, V.width) * L;
      out.push({ u: along, v: depth, r: L - d });
      // the tooth goes straight in: keep its full width all the way out to the edge,
      // so no thin strip of cheese is left beside it
      for (let y = depth + L * .2; y < depth + p.advance + p.shallow + L * 1.1; y += L * .2) out.push({ u: along, v: y, r: L - d });
      if (d < 1e-4) continue;                              // bord lisse : pas de vagues
      const k = Math.max(6, Math.round(TAU * L / s)), ph = hasard() * TAU;
      for (let j = 0; j < k; j++) {
        const di = d * (1 + (hasard() - .5) * 1.4 * V.irr), si = s * (1 + (hasard() - .5) * 1.2 * V.irr);
        const rb = (si * si / 4 + di * di) / (2 * di), a = ph + (j + (hasard() - .5) * .6 * V.irr) / k * TAU;
        out.push({ u: along + Math.cos(a) * (L - rb), v: depth + Math.sin(a) * (L - rb), r: rb });
      }
    }
    return out;
  }
  function realize(tpl, px, py, nx, ny, R, push) {
    const tx = -ny, ty = nx, cx = px + nx * R * push, cy = py + ny * R * push;
    const out = tpl.map(o => ({ x: cx + tx * o.u * R + nx * o.v * R, y: cy + ty * o.u * R + ny * o.v * R, r: o.r * R }));
    if (tpl.poly) out.poly = tpl.poly.map(([u, v]) => [cx + tx * u * R + nx * v * R, cy + ty * u * R + ny * v * R]);
    return out;
  }
  function dansPoly(x, y, P) {
    let dedans = false;
    for (let i = 0, j = P.length - 1; i < P.length; j = i++) {
      const [xi, yi] = P[i], [xj, yj] = P[j];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) dedans = !dedans;
    }
    return dedans;
  }
  function forCellsIn(circles, fn) {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const c of circles) { x0 = Math.min(x0, c.x - c.r); y0 = Math.min(y0, c.y - c.r); x1 = Math.max(x1, c.x + c.r); y1 = Math.max(y1, c.y + c.r); }
    const P = circles.poly;
    if (P) for (const [x, y] of P) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
    const i0 = Math.max(0, Math.floor(x0 * GW)), i1 = Math.min(GW - 1, Math.ceil(x1 * GW));
    const j0 = Math.max(0, Math.floor(y0 * GW)), j1 = Math.min(GH - 1, Math.ceil(y1 * GW));
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
      const idx = j * GW + i; if (!grid[idx]) continue;
      const x = (i + .5) / GW, y = (j + .5) / GW;
      let pris = false;
      for (const c of circles) { const dx = x - c.x, dy = y - c.y; if (dx * dx + dy * dy <= c.r * c.r) { pris = true; break; } }
      if (!pris && P && dansPoly(x, y, P)) pris = true;
      if (pris) fn(idx);
    }
  }
  function countRemoval(circles) { let n = 0; forCellsIn(circles, () => n++); return n; }

  // les foyers : les quelques endroits du bord que le rat élargit au lieu de mordre partout
  // (réglables à chaud depuis l'Atelier des foyers, outils/atelier-foyers.html)
  // REGROUPE : à quel point le rat vise ce qui dépasse, pour que la tranche se resserre sur le
  // centre. 1 = le réglage d'origine ; plus haut, le morceau reste rond et centré plus tôt.
  // ETALE : à quel point le rat évite l'endroit qu'il vient de croquer, pour que le pourtour
  // soit rongé uniformément au lieu de partir en paquets.
  let FOYERS = 8, RESTE = 0, PRES = .16, REGROUPE = 1.4, ETALE = .95;
  let foyers = [], derniers = [];

  // Pick a spot on the cheese's edge. Spots far from the middle are much more likely,
  // so the rat works from the outside in and the last morsel ends up near the centre.
  function pickEdge() {
    const edge = [], base = []; let total = 0;
    const mx = .5, my = A / 2;
    // où en est la tranche : le milieu de ce qu'il reste, et s'il en reste peu
    let n = 0;
    for (let idx = 0; idx < grid.length; idx++) if (grid[idx]) n++;
    const fin = n < cells0 * Math.min(.55, .3 * REGROUPE);   // la fin : on resserre et on arrondit
    for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) {
      const idx = j * GW + i;
      if (!grid[idx]) continue;
      if (i === 0 || j === 0 || i === GW - 1 || j === GH - 1 || !grid[idx - 1] || !grid[idx + 1] || !grid[idx - GW] || !grid[idx + GW]) {
        let w;
        if (fin) {
          // Sur la fin, le reste doit fondre en un morceau rond au milieu, pas en ruban déchiqueté.
          // On mord donc ce qui dépasse : loin du milieu de ce qu'il reste, loin du centre de
          // l'écran, et surtout les pointes isolées, qui n'ont presque plus de fromage autour.
          const ex = (i + .5) / GW, ey = (j + .5) / GW;
          const dE = Math.hypot(ex - mx, ey - my);
          let autour = 0, tot = 0;
          for (let b = -4; b <= 4; b += 2) for (let a = -4; a <= 4; a += 2) {
            const u = i + a, v = j + b; tot++;
            if (u >= 0 && v >= 0 && u < GW && v < GH && grid[v * GW + u]) autour++;
          }
          // Relevé sur `references/fin/` : le morceau reste une étoile hérissée jusqu'au bout.
          // Les pointes laissées entre deux morsures ne sont donc PAS mangées en priorité ; au
          // contraire, le rat mord dans la masse, et les piquants restent debout.
          const masse = autour / tot;
          // On ne vise QUE le centre de l'écran, pas le milieu de ce qu'il reste : ce dernier
          // dérive au fil des morsures et le dernier morceau finissait de côté. Le trou du rat,
          // lui, ne bouge pas — c'est là que la dernière bouchée doit se trouver.
          w = Math.pow(dE, 2 + 2 * REGROUPE) * (1 + masse) + .0004;
        } else {
          // Demandé par Fabien : « que ça morde de manière homogène partout et que ça se
          // regroupe bien vers le centre ». On mesure donc chaque bout de bord non pas par sa
          // distance au centre — les coins seraient mangés en premier — mais par ce qu'il lui
          // reste par rapport à la tranche d'origine dans CETTE direction-là. Sur une tranche
          // entière, ce rapport vaut 1 partout : le rat attaque donc le pourtour uniformément.
          // Dès qu'un endroit a été entamé, il descend sous 1 et devient moins intéressant que
          // ce qui dépasse encore : le front avance ensemble et le reste se resserre en rond.
          const ex = (i + .5) / GW, ey = (j + .5) / GW;
          const ux = ex - mx, uy = ey - my, r = Math.hypot(ux, uy) || 1e-6;
          const bord = Math.min(.5 * r / Math.max(Math.abs(ux), 1e-6), (A / 2) * r / Math.max(Math.abs(uy), 1e-6));
          const s = Math.min(1, r / bord);     // 1 sur le bord d'origine, 0 au milieu
          w = Math.pow(s, 4 * REGROUPE) + .002;
          // Ce que Fabien veut depuis le début : « qu'autant que possible ça morde dans un
          // endroit pas déjà mordu ». Le rat se souvient donc de TOUTES ses morsures, pas des
          // six dernières, et on regarde la plus proche : un endroit encore vierge garde tout
          // son poids, un endroit déjà croqué s'effondre. ETALE dit à quel point.
          let dmin = Infinity;
          for (const f of derniers) {
            const dd = (ex - f.x) * (ex - f.x) + (ey - f.y) * (ey - f.y);
            if (dd < dmin) dmin = dd;
          }
          if (dmin < Infinity) w *= 1 - ETALE * Math.exp(-dmin / (PRES * PRES));
          if (w < 1e-6) w = 1e-6;
        }
        edge.push(idx); base.push(w); total += w;
      }
    }
    if (!edge.length) return null;
    // Sur la vidéo, le rat n'attaque pas le bord au hasard : il ouvre quelques foyers et les
    // élargit, si bien qu'au début on voit trois ou quatre taches noires grandir chacune de
    // leur côté. La plupart des crocs tombent donc contre un foyer déjà ouvert.
    let wts = base, fi = -1;
    if (!fin && foyers.length >= FOYERS && Math.random() < RESTE) {   // les foyers s'ouvrent d'abord, tous
      fi = (Math.random() * foyers.length) | 0;
      const f = foyers[fi], near = new Array(edge.length); let t2 = 0;
      for (let k = 0; k < edge.length; k++) {
        const dx = (edge[k] % GW + .5) / GW - f.x, dy = (((edge[k] / GW) | 0) + .5) / GW - f.y;
        const v = base[k] * Math.exp(-(dx * dx + dy * dy) / (PRES * PRES));
        near[k] = v; t2 += v;
      }
      if (t2 > 1e-7) { wts = near; total = t2; }
      else { foyers.splice(fi, 1); fi = -1; }   // ce foyer n'a plus de bord à ronger
    }
    let pick = Math.random() * total, k = 0;
    while (k < edge.length - 1 && (pick -= wts[k]) > 0) k++;
    const idx = edge[k], i = idx % GW, j = (idx / GW) | 0;
    // le foyer ne suit la morsure qu'en partie : il s'élargit sur place au lieu de courir le long du bord
    if (fi >= 0) { foyers[fi].x += ((i + .5) / GW - foyers[fi].x) * .3; foyers[fi].y += ((j + .5) / GW - foyers[fi].y) * .3; }
    else { foyers.push({ x: (i + .5) / GW, y: (j + .5) / GW }); if (foyers.length > FOYERS) foyers.shift(); }
    // la mémoire du rat : tous les endroits déjà croqués, qu'il évitera tant qu'il peut
    derniers.push({ x: (i + .5) / GW, y: (j + .5) / GW });
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
    if (circles.poly) {                 // un contour dessiné, rempli à part (son sens de tracé est quelconque)
      m.beginPath(); circles.poly.forEach(([x, y], i) => i ? m.lineTo(x * SW, y * SW) : m.moveTo(x * SW, y * SW));
      m.closePath(); m.fill();
    }
    m.globalCompositeOperation = 'source-over';
    forCellsIn(circles, idx => { grid[idx] = 0; cells--; });
  }

  function clearAll() {
    const m = mask.getContext('2d'); m.globalCompositeOperation = 'source-over'; m.clearRect(0, 0, SW, SH);
    grid.fill(0); cells = 0;
  }

  // bite size is the one measured on the show (about 1.7 % of the slice per bite, centred on the edge),
  // scaled to the cheese's area; pacing may only nudge it, so every bite looks like the TV one
  const PUSH = .05, baseR = () => .077 * Math.sqrt(A / .75);
  // l'Atelier des morsures peut donner au rat les formes cochées par Fabien ; le jeu, lui, tire les siennes
  let choixForme = null;
  function tailleCroc(tpl, e, k, total) {
    const target = cells0 * (1 - (k + 1) / total), needed = cells - target;
    const R0 = baseR(), late = k > total * .9, RMIN = R0 * .8, RMAX = R0 * (late ? 1.8 : 1.25);
    let R = RMIN;
    if (needed > 0) {
      let lo = RMIN, hi = RMAX;
      if (countRemoval(realize(tpl, e.x, e.y, e.nx, e.ny, hi, PUSH)) <= needed) R = hi;
      else {
        for (let it = 0; it < 11; it++) { const mid = (lo + hi) / 2; if (countRemoval(realize(tpl, e.x, e.y, e.nx, e.ny, mid, PUSH)) >= needed) hi = mid; else lo = mid; }
        R = hi;
      }
    }
    return R;
  }
  // renvoie ce qui a été croqué, pour que l'Atelier des morsures puisse l'enregistrer
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
      return { fin: true };
    }
    const e = pickEdge(); if (!e) return null;
    const p = (choixForme || tirerForme)(), tpl = shapeTemplate(p), R = tailleCroc(tpl, e, k, total);
    applyBite(realize(tpl, e.x, e.y, e.nx, e.ny, R, PUSH));
    return { x: e.x, y: e.y, nx: e.nx, ny: e.ny, R, push: PUSH, forme: p };
  }

  // ---------- sound ----------
  // Le croc est un vrai enregistrement (sons/croc.wav, découpé dans l'Atelier du son).
  // Si le fichier manque, on retombe sur le croc synthétisé.
  let ac = null, noise = null, croc = null, crocTried = false;
  function ensureAudio() {
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    if (!ac) {
      ac = new AC();
      noise = ac.createBuffer(1, Math.floor(ac.sampleRate * .6), ac.sampleRate);
      const d = noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    if (!crocTried) {
      crocTried = true;
      fetch('./sons/croc.wav').then(r => r.ok ? r.arrayBuffer() : Promise.reject())
        .then(b => ac.decodeAudioData(b)).then(b => { croc = b; }).catch(() => { croc = null; });
    }
    if (ac.state === 'suspended') ac.resume().catch(() => {});
  }
  function crunch(big) {
    if (!soundOn || !ac) return;
    if (croc) {
      // deux crocs ne sonnent jamais pareil : un peu plus fort, un peu plus grave au hasard
      const s = ac.createBufferSource(), g = ac.createGain();
      s.buffer = croc;
      s.playbackRate.value = (big ? .93 : 1) * (.95 + Math.random() * .11);
      g.gain.value = (big ? 1 : .82) * (.85 + Math.random() * .3);
      s.connect(g); g.connect(ac.destination); s.start(ac.currentTime + .005);
      return;
    }
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

  // ---------- la musique ----------
  // Elle tourne dès l'ouverture de l'appli, pas seulement pendant une partie, et elle se
  // reboucle toute seule. Pour l'instant c'est le morceau entier tel quel : le raccord n'est
  // pas travaillé, Fabien le reprendra à la maison. C'est un aperçu, pas la version finale.
  // Deux morceaux au choix, le bouton Musique passe de l'un à l'autre puis coupe :
  // le thème complet (3 min 38, ajouté par Fabien le 07/11/2026, par défaut)
  // et l'instrumental (1 min 25, le premier aperçu).
  const MORCEAUX = { theme: { src: 'sons/theme.mp3', nom: 'thème' }, instru: { src: 'sons/instrumental.mp3', nom: 'instru' } };
  const CHOIX = ['theme', 'instru', 'non'];
  const music = $('music');
  // l'ancien réglage « music » (oui / non) est repris : non reste non, oui devient le thème
  let morceau = store.get('morceau', store.get('music', true) ? 'theme' : 'non');
  if (!CHOIX.includes(morceau)) morceau = 'theme';
  function musicPlay() {
    if (!music) return;                       // l'Atelier des foyers n'a pas l'élément
    if (morceau === 'non') { music.pause(); return; }
    const src = MORCEAUX[morceau].src;
    if (music.getAttribute('src') !== src) music.src = src;   // nouveau morceau : il part du début
    music.volume = .6;                        // ignoré par iOS, utile sur l'ordinateur
    const p = music.play();
    if (p && p.catch) p.catch(() => {});      // refusé tant que l'écran n'a pas été touché
  }
  // iOS coupe le son dès qu'on part ailleurs (YouTube, écran verrouillé, appel…) :
  // au retour on relance sans poser de question.
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') musicPlay(); });
  window.addEventListener('pageshow', musicPlay);
  window.addEventListener('focus', musicPlay);
  if (music) music.addEventListener('pause', () => { if (morceau !== 'non' && document.visibilityState === 'visible') setTimeout(musicPlay, 400); });
  // le premier contact avec l'écran débloque la lecture : sans geste, iOS refuse
  for (const ev of ['pointerdown', 'touchstart', 'keydown']) document.addEventListener(ev, musicPlay, { passive: true });
  musicPlay();

  // ---------- screen stays awake ----------
  let wake = null;
  async function keepAwake() { try { if (navigator.wakeLock && !wake) { wake = await navigator.wakeLock.request('screen'); wake.addEventListener('release', () => { wake = null; }); } } catch (e) { wake = null; } }
  function letSleep() { try { if (wake) wake.release(); } catch (e) {} wake = null; }
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && state === 'running') keepAwake(); });

  // ---------- game flow ----------
  let state = 'idle', elapsed = 0, last = 0, times = [], next = 0, duration = durMin * 60, enAtelier = false;

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

  function setBanner(html) { const b = $('banner'); if (html) { b.innerHTML = '<div>' + html + '</div>'; b.hidden = false; } else b.hidden = true; }

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
    $('durOut').textContent = durMin + ' min';
    $('durMinus').disabled = durMin === DURATIONS[0];
    $('durPlus').disabled = durMin === DURATIONS[DURATIONS.length - 1];
    $('soundBtn').textContent = 'Son : ' + (soundOn ? 'oui' : 'non');
    $('soundBtn').setAttribute('aria-pressed', String(soundOn));
    if ($('musicBtn')) {
      $('musicBtn').textContent = 'Musique : ' + (morceau === 'non' ? 'non' : MORCEAUX[morceau].nom);
      $('musicBtn').setAttribute('aria-pressed', String(morceau !== 'non'));
    }
    if (state !== 'running') stage.classList.remove('nocursor');
    dimmed = state === 'paused';
    measureReserve();
    draw();
  }


  // ---------- opening: the trap in the middle swings shut, ripples spread, then the rat starts ----------
  // timings read off the show: the lid closes in about a third of a second, ripples follow at once
  const LID_START = .2, SHUT = .55, END = 1.45;
  let introStart = null, lidTex = null, frozen = null;   // frozen: test hook to look at one moment of the opening
  function makeLid() {
    const n = 256, cv = document.createElement('canvas'); cv.width = cv.height = n;
    const c = cv.getContext('2d'), R = n / 2 - 4;
    c.translate(n / 2, n / 2);
    c.beginPath();
    for (let i = 0; i <= 96; i++) {                         // rim with small notches
      const a = i / 96 * TAU, rr = R * (1 - .035 * Math.max(0, Math.sin(a * 14)) ** 6);
      i ? c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : c.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
    }
    c.closePath(); c.save(); c.clip();
    const g = c.createRadialGradient(-R * .25, -R * .3, R * .1, 0, 0, R * 1.05);
    g.addColorStop(0, '#f8e08a'); g.addColorStop(.6, '#ecc35a'); g.addColorStop(1, '#c9932f');
    c.fillStyle = g; c.fillRect(-n, -n, 2 * n, 2 * n);
    for (let k = 0; k < 7; k++) {
      const hr = rnd(8, 22), a = rnd(0, TAU), d = rnd(0, R - hr - 8), hx = Math.cos(a) * d, hy = Math.sin(a) * d;
      c.fillStyle = 'rgba(150,96,24,.85)'; c.beginPath(); c.arc(hx, hy, hr, 0, TAU); c.fill();
      c.fillStyle = 'rgba(90,50,10,.9)'; c.beginPath(); c.arc(hx - hr * .15, hy - hr * .15, hr * .7, 0, TAU); c.fill();
    }
    c.restore();
    // le bord de la face s'arrondit : un trait sombre à l'extérieur, un liseré clair juste dedans
    c.lineWidth = 5; c.strokeStyle = 'rgba(150,100,30,.8)'; c.stroke();
    c.save(); c.clip(); c.lineWidth = 9; c.strokeStyle = 'rgba(255,240,170,.35)'; c.stroke(); c.restore();
    // La tranche du couvercle, relevée sur l'émission : le couvercle ouvert montre une paroi
    // épaisse, plus claire que sa face, entaillée par les mêmes encoches. On prépare donc sa
    // silhouette en plusieurs teintes, du jaune clair contre la face au jaune brun au fond.
    cv.walls = [];
    for (let k = 0; k < 8; k++) {
      const u = k / 7, w = document.createElement('canvas'); w.width = w.height = n;
      const wc = w.getContext('2d'); wc.drawImage(cv, 0, 0);
      wc.globalCompositeOperation = 'source-in';
      wc.fillStyle = `rgb(${Math.round(246 - 92 * u)},${Math.round(222 - 100 * u)},${Math.round(124 - 86 * u)})`;
      wc.fillRect(0, 0, n, n);
      cv.walls.push(w);
    }
    return cv;
  }
  function drawIntro(t, x0, y0, dw, dh) {
    // la trappe, relevée sur l'émission : le trou et le couvercle font environ 38 % de la hauteur
    // de l'image (26 % avant). Les ondes, elles, gardent leur épaisseur d'origine.
    const c = vctx, cx = x0 + dw / 2, cy = y0 + dh / 2, r = Math.min(dw, dh) * .19, r0 = Math.min(dw, dh) * .13;
    c.save(); c.beginPath(); c.rect(x0, y0, dw, dh); c.clip();
    if (t < SHUT + .3) {
      const k = t < LID_START ? 1 : t < SHUT ? 1 - Math.pow((t - LID_START) / (SHUT - LID_START), 2) : 0;
      const phi = k * 2.3, sx = Math.cos(phi), fade = t > SHUT ? 1 - (t - SHUT) / .3 : 1;
      if (t < SHUT + .02) {                                  // the open hole
        // Relevé sur l'émission : le trou montre l'épaisseur de la dalle. Sa paroi intérieure se
        // voit en bas et à gauche, éclairée ; le haut plonge dans le noir. Autour, le bord de la
        // face s'arrondit vers le trou : clair côté lumière, brun-rouge côté ombre.
        const w = r * .17;
        c.save(); c.beginPath(); c.arc(cx, cy, r, 0, TAU); c.clip();
        const pg = c.createLinearGradient(cx, cy + r, cx, cy - r * .2);
        pg.addColorStop(0, '#e9ac46'); pg.addColorStop(.35, '#b86a1c'); pg.addColorStop(1, '#3a1704');
        c.fillStyle = pg; c.fillRect(cx - r, cy - r, 2 * r, 2 * r);   // la paroi
        const g = c.createRadialGradient(cx + w * .3, cy - w, r * .45, cx + w * .3, cy - w, r);
        g.addColorStop(0, '#030100'); g.addColorStop(.85, '#0c0500'); g.addColorStop(1, '#2a1203');
        c.fillStyle = g; c.beginPath(); c.arc(cx + w * .3, cy - w, r * .97, 0, TAU); c.fill();   // le fond
        c.restore();
        const lg = c.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
        lg.addColorStop(0, 'rgba(255,230,150,.75)'); lg.addColorStop(.5, 'rgba(214,140,48,.25)'); lg.addColorStop(1, 'rgba(92,26,2,.8)');
        c.lineWidth = r * .1; c.strokeStyle = lg;
        c.beginPath(); c.arc(cx, cy, r * 1.05, 0, TAU); c.stroke();   // le bord arrondi
      }
      c.save();
      c.globalAlpha = Math.max(0, fade);
      // la tranche du couvercle se voit d'autant plus qu'il pivote : nulle à plat, pleine de profil
      const S = Math.max(.03, Math.abs(sx)), ep = r * .3 * Math.abs(Math.sin(phi));
      c.translate(cx - r + r * sx, cy); c.scale(S, 1);
      const W = lidTex.walls || [];
      for (let k = W.length - 1; k >= 0; k--) c.drawImage(W[k], -r - ep * (k / 7) / S, -r, 2 * r, 2 * r);
      c.drawImage(lidTex, -r, -r, 2 * r, 2 * r);
      if (sx < 0) { c.fillStyle = 'rgba(40,20,0,.22)'; c.beginPath(); c.arc(0, 0, r * .97, 0, TAU); c.fill(); }   // back of the lid, in shade
      c.restore();
    }
    if (t > SHUT - .02) {                                    // ripples spreading from the trap
      const tt = t - SHUT, big = Math.hypot(dw, dh) * .62;
      for (let i = 0; i < 4; i++) {
        const rad = (tt - i * .085) * big * 1.25;
        if (rad <= 0) continue;
        const life = Math.max(0, 1 - rad / big) * Math.min(1, (END - t) / .25);
        if (life <= 0) continue;
        c.beginPath();
        for (let j = 0; j <= 90; j++) {
          const a = j / 90 * TAU, w = rad * (1 + .025 * Math.sin(a * 7 + i * 2 + tt * 9));
          j ? c.lineTo(cx + Math.cos(a) * w, cy + Math.sin(a) * w) : c.moveTo(cx + Math.cos(a) * w, cy + Math.sin(a) * w);
        }
        c.lineWidth = r0 * .34 * (.6 + .4 * life);
        c.strokeStyle = `rgba(206,214,218,${.6 * life})`; c.stroke();
        c.lineWidth *= .35; c.strokeStyle = `rgba(250,250,245,${.5 * life})`; c.stroke();
      }
    }
    c.restore();
  }
  function thud() {
    if (!soundOn || !ac) return;
    const t0 = ac.currentTime + .005, o = ac.createOscillator(), g = ac.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(110, t0); o.frequency.exponentialRampToValueAtTime(45, t0 + .15);
    g.gain.setValueAtTime(.0001, t0); g.gain.exponentialRampToValueAtTime(.7, t0 + .006); g.gain.exponentialRampToValueAtTime(.0001, t0 + .18);
    o.connect(g); g.connect(ac.destination); o.start(t0); o.stop(t0 + .2);
  }

  function start() {
    ensureAudio();
    duration = durMin * 60; times = schedule(duration); next = 0; elapsed = 0; last = Date.now();
    if (!lidTex) lidTex = makeLid();
    introStart = performance.now(); state = 'intro'; setBanner(''); keepAwake(); render(); hideControls();
  }
  function pause() { if (state !== 'running') return; state = 'paused'; letSleep(); setBanner('Pause'); render(); showControls(); }
  function resume() { if (state !== 'paused') return; ensureAudio(); state = 'running'; last = Date.now(); setBanner(''); keepAwake(); render(); hideControls(); }
  function end() { state = 'ended'; letSleep(); hideControls(); setBanner('Plus de fromage !<small>Le rat a tout mangé.</small>'); render(); }
  function toIdle() { introStart = null; state = 'idle'; elapsed = 0; letSleep(); setBanner(''); if (Math.abs(stageAspect() - A) > .01 || cells < cells0) resetCheese(); render(); }

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
    if (introStart !== null && frozen === null) {
      const t = (performance.now() - introStart) / 1000;
      if (state === 'intro' && t >= SHUT) { state = 'running'; elapsed = 0; last = Date.now(); thud(); render(); hideControls(); }
      if (t >= END) introStart = null;
      draw();
    }
    if (state === 'running') {
      const wall = Date.now(); elapsed += (wall - last) / 1000; last = wall;
      let bit = false, final = false;
      while (next < times.length && elapsed >= times[next]) {
        bite(next, times.length); bit = true; if (next === times.length - 1) final = true; next++;
      }
      if (bit) { compose(); draw(); crunch(final); }
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
  if ($('musicBtn')) $('musicBtn').addEventListener('click', () => {
    morceau = CHOIX[(CHOIX.indexOf(morceau) + 1) % CHOIX.length];
    store.set('morceau', morceau); musicPlay(); render();
  });
  if (document.fullscreenEnabled) {
    $('fsBtn').hidden = false;
    $('fsBtn').addEventListener('click', () => {
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      else document.documentElement.requestFullscreen().catch(() => {});
    });
  }
  // l'écran reste figé : pas de pincement pour zoomer (geste propre à iOS)
  for (const g of ['gesturestart', 'gesturechange', 'gestureend']) {
    document.addEventListener(g, e => e.preventDefault(), { passive: false });
  }
  document.addEventListener('keydown', e => {
    if (e.code !== 'Space' || e.target.tagName === 'BUTTON' || enAtelier) return;
    e.preventDefault();
    if (state === 'idle') start(); else if (state === 'running') pause(); else if (state === 'paused') resume();
  });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { measureReserve(); });

  // test hook: jump ahead in the current game
  window.RapRat = { skip(sec) { if (state === 'running' || state === 'paused') elapsed += sec; },
    bites(n, from = 0) { for (let i = 0; i < n; i++) bite(from + i, BITES); compose(); draw(); },
    neuf() { resetCheese(); draw(); },                        // une tranche entière, intacte
    reglages(o) { if (o.foyers != null) FOYERS = o.foyers; if (o.reste != null) RESTE = o.reste; if (o.pres != null) PRES = o.pres; if (o.regroupe != null) REGROUPE = o.regroupe; if (o.etale != null) ETALE = o.etale; if (o.epaisseur != null) { EPAISSEUR = o.epaisseur; compose(); draw(); } },
    crocs: () => BITES,
    trous: () => nTrous,
    actuels: () => ({ foyers: FOYERS, reste: RESTE, pres: PRES, regroupe: REGROUPE, etale: ETALE, epaisseur: EPAISSEUR }),
    ajuste() { fit(); },                                      // recaler la toile sur sa boîte
    // ---- pour l'Atelier des morsures (outils/atelier-morsures.html) ----
    // un croc s'y décrit par { x, y, nx, ny, R, push, forme } : x, y le point du bord visé (en
    // largeurs de tranche), nx, ny la normale vers l'extérieur, R le rayon, forme celle de tirerForme()
    atelier() { enAtelier = true; },
    forme: () => tirerForme(),
    ronds: c => realize(shapeTemplate(c.forme), c.x, c.y, c.nx, c.ny, c.R, c.push == null ? PUSH : c.push),
    croquer(c) {
      const avant = cells;
      if (c.fin) { clearAll(); return avant; }
      applyBite(realize(shapeTemplate(c.forme), c.x, c.y, c.nx, c.ny, c.R, c.push == null ? PUSH : c.push));
      derniers.push({ x: c.x, y: c.y });                     // le rat s'en souviendra s'il prend la suite
      return avant - cells;
    },
    mordre: (k, total = BITES + 1) => bite(k, total),         // le rat mord, comme pendant une partie
    proposer(k, total = BITES + 1) {                          // où il mordrait, sans mordre
      const f0 = foyers.map(o => ({ x: o.x, y: o.y })), d0 = derniers.length;
      const e = pickEdge();
      foyers = f0; derniers.length = d0;
      if (!e) return null;
      const p = (choixForme || tirerForme)();
      return { x: e.x, y: e.y, nx: e.nx, ny: e.ny, R: tailleCroc(shapeTemplate(p), e, k, total), push: PUSH, forme: p };
    },
    efface() {                                                // la tranche entière, mêmes trous
      const m = mask.getContext('2d');
      m.globalCompositeOperation = 'source-over'; m.fillStyle = '#fff'; m.fillRect(0, 0, SW, SH);
      grid.fill(1); cells = cells0; foyers = []; derniers = [];
    },
    redessine() { compose(); draw(); },
    grille: () => ({ grid, GW, GH, A, cells, cells0 }),
    masque: () => mask,
    cadre: () => cadreVu,
    r0: () => baseR(),
    compte: c => countRemoval(realize(shapeTemplate(c.forme), c.x, c.y, c.nx, c.ny, c.R, c.push == null ? PUSH : c.push)),
    son(big) { ensureAudio(); crunch(big); },
    choixForme(fn) { choixForme = typeof fn === 'function' ? fn : null; },   // les formes que le rat a le droit d'utiliser
    // ---- pour l'Atelier des fromages (outils/atelier-fromages.html) ----
    style: () => Object.assign({}, STYLE),
    styleParDefaut: () => Object.assign({}, STYLE0),
    styleSet(o) { Object.assign(STYLE, o); },
    repeins() { paintTexture(); compose(); draw(); },     // même masque : les morsures restent
    toile: () => view,
    freezeIntro(t) { if (!lidTex) lidTex = makeLid(); frozen = t; introStart = 0; draw(); } };

  resetCheese(); render();
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
  new ResizeObserver(fit).observe(stage);
  requestAnimationFrame(tick);
})();
