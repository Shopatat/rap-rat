// La voix du rat : quand il parle, ce qu'il dit, et comment.
//
// Le parti pris (décidé avec Fabien le 12/11/2026) : on ne le voit jamais, il parle peu, bas,
// la bouche pleine, sur un ton d'ennui. Il ne travaille pas pour les joueurs — il est chez lui,
// il mange, et les joueurs sont une nuisance qui l'amuse modérément. Il ne félicite jamais.
//
// Trois registres, aux poids très inégaux :
//   commentaire — n'interrompt rien, n'exige rien. C'est là que vit la présence.
//   consigne    — il s'adresse à un joueur et lui donne une contrainte qu'il emporte, pas une
//                 épreuve à faire tout de suite. Le jeu continue, mais ça s'accumule.
//   stop        — le seul qui bloque. Deux ou trois par partie, pas plus : s'il arrive souvent,
//                 il ne vaut plus rien.
//
// Il ne désigne jamais les joueurs par leur prénom (une voix enregistrée ne peut pas), mais par
// la position et par les piques : « celui qui tient le téléphone », « le plus vieux ». C'est plus
// drôle que les prénoms, ça vise toujours quelqu'un, et la liste s'enregistre une fois pour toutes.
//
// Ce fichier ne dessine rien et ne connaît pas la partie : il donne un plan de paroles
// (planifier) et sait en dire une (dire). L'appli (js/app.js) et l'Atelier du rat
// (outils/atelier-rat.html) partagent ce même moteur, pour qu'il n'y ait jamais deux rythmes.
window.RatVoix = (() => {
  // où sont les enregistrements, quel que soit le dossier de la page qui charge ce script
  const BASE = (() => {
    const s = document.currentScript && document.currentScript.src;
    try { return new URL('../sons/rat/', s || location.href).href; } catch (e) { return 'sons/rat/'; }
  })();

  // ---------- les réglages (curseurs de l'Atelier du rat) ----------
  const R0 = {
    nombre: 18,        // 4 à 60 : combien de paroles sur la partie. En 15 min, l'écart minimum et
                       // le silence de la fin n'en laissent tenir que 16 : une toutes les 45 s.
    ecart: 45,         // 10 à 120 s : jamais deux paroles plus rapprochées que ça
    attente: 25,       // 0 à 180 s : il se tait au début, le temps que la partie démarre
    silence: 120,      // 0 à 300 s : plus un mot pendant les dernières secondes. Le silence de la
                       // fin fait plus d'effet que n'importe quelle réplique.
    courbe: 1,         // 0 à 2 : 0 = aussi présent du début à la fin, 2 = trois fois plus à la fin
    partConsigne: 22,  // % des paroles qui sont des consignes
    partStop: 14,      // % qui sont des stop — deux ou trois par partie de 15 min...
    stopMax: 3,        // ... mais jamais plus que ça, et jamais dans le premier tiers
    apresCroc: 40,     // % des paroles collées juste après une morsure (il parle la bouche pleine)
    ouverture: true,   // une réplique quand la trappe se ferme
    finale: false,     // une réplique quand tout est mangé. Coupée : ça s'éteint, c'est tout.
    graine: 0          // 0 = au hasard ; sinon la même partie redonne les mêmes paroles aux mêmes instants
  };
  let R = Object.assign({}, R0);

  // ---------- les répliques ----------
  // id : le nom du fichier à enregistrer (sons/rat/<id>.wav), donné par l'Atelier du son.
  // r  : le registre — o ouverture, c commentaire, g consigne, s stop, f finale.
  // q  : la fenêtre où elle peut tomber, en avancement de la partie (0 = au début, 1 = à la fin).
  // t  : le texte. Les « … » sont des silences à tenir à l'enregistrement : c'est là que c'est drôle.
  const REPLIQUES = [
    { id: 'o1', r: 'o', q: [0, 0], t: 'Vous êtes assis chez moi.' },
    { id: 'o2', r: 'o', q: [0, 0], t: 'Servez-vous. J’ai déjà commencé.' },
    { id: 'o3', r: 'o', q: [0, 0], t: 'Je vous ai vus arriver.' },

    { id: 'c01', r: 'c', q: [0, .5], t: 'Ah. Vous êtes encore là.' },
    { id: 'c02', r: 'c', q: [0, 1], t: 'Continuez. Ça m’occupe.' },
    { id: 'c03', r: 'c', q: [0, 1], t: 'Je vous entends réfléchir. C’est lent.' },
    { id: 'c04', r: 'c', q: [0, 1], t: 'Vous jouez vraiment comme ça ?' },
    { id: 'c05', r: 'c', q: [0, 1], t: 'Celui qui tient le téléphone triche.' },
    { id: 'c06', r: 'c', q: [0, 1], t: 'Quelqu’un a touché à mon fromage ?' },
    { id: 'c07', r: 'c', q: [0, 1], t: 'Mmh. Pas mal. … Enfin. Pour vous.' },
    { id: 'c08', r: 'c', q: [0, 1], t: 'J’ai connu mieux. J’ai connu pire. … Surtout mieux.' },
    { id: 'c09', r: 'c', q: [0, 1], t: 'Le plus vieux a l’air perdu.' },
    { id: 'c10', r: 'c', q: [.2, 1], t: 'Vous sentez le fromage. … Tous.' },
    { id: 'c11', r: 'c', q: [.3, 1], t: 'Ne vous retournez pas.' },
    { id: 'c12', r: 'c', q: [0, 1], t: '… Pardon. Vous disiez ?' },
    { id: 'c13', r: 'c', q: [.2, 1], t: 'Il y en a un qui va perdre. … Je sais lequel.' },
    { id: 'c14', r: 'c', q: [0, 1], t: 'Personne ne gagne, ici. Vous attendez, c’est tout.' },
    { id: 'c15', r: 'c', q: [0, 1], t: 'J’aime bien celui qui ne dit rien. … Il m’inquiète.' },
    { id: 'c16', r: 'c', q: [.4, 1], t: 'Vous avez l’air fatigués.' },
    { id: 'c17', r: 'c', q: [0, 1], t: 'Je ne vous juge pas. … Enfin. Un peu.' },
    { id: 'c18', r: 'c', q: [0, 1], t: 'C’était mieux avant vous.' },
    { id: 'c19', r: 'c', q: [0, 1], t: 'Quelqu’un compte les points ? … Non ? Tant mieux.' },
    { id: 'c20', r: 'c', q: [.2, 1], t: 'Si ça vous ennuie, vous pouvez partir. … Personne ne partira.' },
    { id: 'c21', r: 'c', q: [.35, .75], t: 'Il m’en reste la moitié. À vous, moins.' },
    { id: 'c22', r: 'c', q: [.3, 1], t: 'Vous accélérez ? … C’est pour moi ?' },
    { id: 'c23', r: 'c', q: [.6, 1], t: 'Je mange plus vite que vous ne jouez.' },
    { id: 'c24', r: 'c', q: [.7, 1], t: 'Ça sent la fin.' },
    { id: 'c25', r: 'c', q: [.75, 1], t: 'Je vais bientôt avoir faim. … Vraiment faim.' },

    { id: 'g01', r: 'g', q: [0, .9], t: 'Toi. Celui qui parle le plus. Tu ne dis plus un mot. … Jusqu’à ce que je revienne.' },
    { id: 'g02', r: 'g', q: [0, .9], t: 'Le téléphone. Passe-le à ta droite. … Maintenant.' },
    { id: 'g03', r: 'g', q: [.2, .9], t: 'Celui qui est le mieux placé en rend un. … Je ne dirai pas quoi.' },
    { id: 'g04', r: 'g', q: [0, .9], t: 'À partir de maintenant, vous vous appelez tous Robert.' },
    { id: 'g05', r: 'g', q: [0, .9], t: 'Le plus jeune décide pour tout le monde. … Un tour.' },
    { id: 'g06', r: 'g', q: [0, .9], t: 'Plus personne ne touche la table avec les mains.' },
    { id: 'g07', r: 'g', q: [0, .9], t: 'Vous ne dites plus « oui ». … Jamais.' },
    { id: 'g08', r: 'g', q: [0, .9], t: 'Celui qui a commencé ne joue plus. Un tour. … Il regarde.' },
    { id: 'g09', r: 'g', q: [.2, .9], t: 'Choisissez quelqu’un. … Il me remercie. À voix haute.' },
    { id: 'g10', r: 'g', q: [0, .9], t: 'Le dernier qui a ri saute son tour.' },
    { id: 'g11', r: 'g', q: [.2, .9], t: 'Tout le monde change de place. … Vous n’êtes pas d’accord. Je sais.' },
    { id: 'g12', r: 'g', q: [.2, .9], t: 'Celui qui gagne parle de lui à la troisième personne. … À partir de tout de suite.' },
    { id: 'g13', r: 'g', q: [.3, .9], t: 'Interdit de prononcer mon nom. … Vous le prononcerez.' },
    { id: 'g14', r: 'g', q: [.3, .9], t: 'Debout. Tous. … Vous jouez debout, maintenant.' },
    { id: 'g15', r: 'g', q: [.4, .9], t: 'Désignez le plus mauvais. À trois. … Un, deux… non. Je ne compte pas pour vous.' },
    { id: 'g16', r: 'g', q: [.3, .9], t: 'Celui qui tient le téléphone décide qui perd un tour. … Son vis-à-vis décidera ensuite.' },

    { id: 's1', r: 's', q: [.3, 1], t: 'Stop. … … Non. Rien. Continuez.' },
    { id: 's2', r: 's', q: [.35, 1], t: 'Stop. Quelqu’un a menti. … Vous savez qui.' },
    { id: 's3', r: 's', q: [.35, 1], t: 'Stop. Celui qui bouge perd son tour.' },
    { id: 's4', r: 's', q: [.4, 1], t: 'Stop. … Je prends une bouchée. Pour le dérangement.' },
    { id: 's5', r: 's', q: [.35, 1], t: 'Stop. Silence. Dix secondes. … J’écoute.' },
    { id: 's6', r: 's', q: [.4, 1], t: 'Stop. Regardez-vous. … Oui, comme ça. … Bien. Continuez.' },

    { id: 'f1', r: 'f', q: [1, 1], t: 'C’est fini. Il n’y a plus rien.' }
  ];
  const NOMS = { o: 'ouverture', c: 'commentaire', g: 'consigne', s: 'stop', f: 'finale' };

  // Ses répliques retouchées dans l'Atelier du rat (même origine, donc l'appli les voit aussi).
  // La vraie façon de les garder reste l'export de l'atelier, collé ici dans REPLIQUES.
  let LISTE = REPLIQUES;
  function relire() {
    try {
      const b = localStorage.getItem('rat.repliques');
      if (b) { const l = JSON.parse(b); if (Array.isArray(l) && l.length) LISTE = l; }
      const g = localStorage.getItem('rat.reglages');
      if (g) Object.assign(R, JSON.parse(g));
    } catch (e) {}
  }
  relire();

  // ---------- un hasard qu'on peut rejouer ----------
  function alea(graine) {
    if (!graine) return Math.random;
    let s = graine >>> 0 || 1;
    return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
  }

  // ---------- le plan de paroles ----------
  // duree en secondes, crocs = les instants des morsures (pour qu'il parle la bouche pleine).
  // Rend une liste { t, r, id, texte, son } triée dans le temps.
  function planifier(duree, opts = {}) {
    const crocs = opts.crocs || [], rr = alea(R.graine);
    const t0 = Math.min(R.attente, duree * .5);
    const t1 = Math.max(t0, duree - R.silence);
    const plan = [], pris = new Set();
    const tire = (reg, u) => {                       // une réplique du registre, jamais deux fois
      const bons = LISTE.filter(x => x.r === reg && !pris.has(x.id) && u >= x.q[0] - 1e-9 && u <= x.q[1] + 1e-9);
      const pool = bons.length ? bons : LISTE.filter(x => x.r === reg && !pris.has(x.id));
      if (!pool.length) return null;
      const x = pool[Math.floor(rr() * pool.length)];
      pris.add(x.id);
      return x;
    };
    const pose = (t, x) => { if (x) plan.push({ t, r: x.r, id: x.id, texte: x.t, son: BASE + x.id + '.wav' }); };

    if (R.ouverture) pose(1.2, tire('o', 0));

    const N = Math.max(0, Math.round(R.nombre));
    if (N && t1 > t0) {
      // la densité monte avec l'avancement : discret au début, plus présent à mesure que la
      // tranche se réduit (courbe 0 = plat, 2 = trois fois plus présent à la fin)
      const M = 240, cum = [0];
      for (let i = 0; i < M; i++) cum.push(cum[i] + 1 + R.courbe * (i + .5) / M);
      const tot = cum[M];
      const quand = u => {                           // u dans [0,1] -> instant, selon la densité
        const cible = u * tot;
        let i = 1; while (i < M && cum[i] < cible) i++;
        const f = (cible - cum[i - 1]) / ((cum[i] - cum[i - 1]) || 1);
        return t0 + (t1 - t0) * (i - 1 + f) / M;
      };
      const ts = [];
      for (let i = 0; i < N; i++) ts.push(quand(Math.min(1, (i + .15 + rr() * .7) / N)));
      ts.sort((a, b) => a - b);
      // l'écart minimum, en poussant vers la fin ; ce qui dépasse la fenêtre est abandonné
      const gardes = [];
      for (const t of ts) {
        let v = t;
        if (gardes.length && v - gardes[gardes.length - 1] < R.ecart) v = gardes[gardes.length - 1] + R.ecart;
        if (v > t1) break;
        gardes.push(v);
      }
      // Il parle souvent juste après une morsure, la bouche pleine. Le décalage n'est accepté
      // que s'il laisse l'écart minimum de part et d'autre : sinon le collage rapprochait deux
      // paroles (mesuré : 34 s au lieu des 45 s réglées).
      const colle = gardes.slice();
      for (let i = 0; i < colle.length; i++) {
        if (rr() * 100 >= R.apresCroc || !crocs.length) continue;
        let best = colle[i], d = 1e9;
        for (const c of crocs) { const e = Math.abs(c - colle[i]); if (e < d) { d = e; best = c; } }
        if (d > 6) continue;
        const v = Math.min(t1, best + .35);
        if (i > 0 && v - colle[i - 1] < R.ecart) continue;
        if (i < colle.length - 1 && colle[i + 1] - v < R.ecart) continue;
        colle[i] = v;
      }

      // les registres : les stop d'abord (rares, jamais dans le premier tiers, bien espacés),
      // puis les consignes, le reste en commentaires. Le compte n'est pas arrondi au plus proche
      // mais tiré au sort autour, sinon une partie de 15 min donnait toujours exactement
      // 1 stop et 4 consignes — un mélange qui sentait le calcul.
      const n = colle.length, reg = new Array(n).fill('c');
      const part = p => { const x = n * p / 100; return Math.floor(x) + (rr() < x - Math.floor(x) ? 1 : 0); };
      const nS = Math.min(Math.round(R.stopMax), part(R.partStop));
      const tard = [];
      for (let i = 0; i < n; i++) if ((colle[i] - t0) / ((t1 - t0) || 1) > .33) tard.push(i);
      for (let k = 0; k < nS && tard.length; k++) {
        const j = tard[Math.floor(rr() * tard.length)];
        reg[j] = 's';
        const loin = Math.max(2, Math.floor(n / (nS + 1)));
        for (let i = tard.length - 1; i >= 0; i--) if (Math.abs(tard[i] - j) < loin) tard.splice(i, 1);
      }
      const nG = part(R.partConsigne), libres = [];
      for (let i = 0; i < n; i++) if (reg[i] === 'c') libres.push(i);
      for (let k = 0; k < nG && libres.length; k++) reg[libres.splice(Math.floor(rr() * libres.length), 1)[0]] = 'g';

      for (let i = 0; i < n; i++) {
        const u = (colle[i] - t0) / ((t1 - t0) || 1);
        pose(colle[i], tire(reg[i], u) || tire('c', u));
      }
    }
    if (R.finale) pose(duree, tire('f', 1));
    plan.sort((a, b) => a.t - b.t);
    charger(plan);
    return plan;
  }

  // ---------- le son ----------
  // Une vraie voix enregistrée (Atelier du son), jamais de synthèse : du texte lu par une machine
  // sonnerait comme un jouet, et c'est exactement ce qu'on cherche à éviter. Tant qu'un fichier
  // manque, le rat se tait — l'appli reste donc muette jusqu'aux enregistrements. La voix de
  // dépannage sert à juger le rythme dans l'atelier, elle ne tourne jamais dans l'appli.
  let ac = null, secoursOn = false, volume = 1;
  const bufs = new Map();
  function audio(c) { if (c) ac = c; return ac; }
  function charger(plan) {
    if (!ac) return;
    for (const p of plan) {
      if (bufs.has(p.id)) continue;
      bufs.set(p.id, null);
      fetch(p.son).then(r => r.ok ? r.arrayBuffer() : Promise.reject())
        .then(b => ac.decodeAudioData(b)).then(b => { bufs.set(p.id, b); }).catch(() => { bufs.set(p.id, false); });
    }
  }
  function dire(p, o = {}) {
    if (o.texte) o.texte(p);                        // l'atelier affiche la réplique, l'appli non
    if (o.son === false) return false;
    const b = bufs.get(p.id);
    if (ac && b) {
      const s = ac.createBufferSource(), g = ac.createGain();
      s.buffer = b; g.gain.value = volume;
      s.connect(g); g.connect(ac.destination); s.start(ac.currentTime + .005);
      return true;
    }
    if (secoursOn && window.speechSynthesis) {      // atelier seulement
      const u = new SpeechSynthesisUtterance(p.texte.replace(/…/g, '...'));
      u.lang = 'fr-FR'; u.rate = .92; u.pitch = .55; u.volume = volume;
      const v = speechSynthesis.getVoices().filter(x => /^fr/i.test(x.lang));
      if (v.length) u.voice = v[0];
      speechSynthesis.cancel(); speechSynthesis.speak(u);
      return 'secours';
    }
    return false;
  }

  return {
    planifier, dire, audio, charger,
    stop() { try { if (window.speechSynthesis) speechSynthesis.cancel(); } catch (e) {} },
    secours(on) { secoursOn = !!on; },
    volume(v) { if (v != null) volume = v; return volume; },
    pret: id => { const b = bufs.get(id); return b ? 'oui' : b === false ? 'non' : '…'; },
    chemin: id => BASE + id + '.wav',
    nom: r => NOMS[r] || r,
    reglages(o) { if (o) Object.assign(R, o); return Object.assign({}, R); },
    actuels: () => Object.assign({}, R),
    parDefaut: () => Object.assign({}, R0),
    repliques: () => LISTE.map(x => Object.assign({}, x)),
    dEntree: () => REPLIQUES.map(x => Object.assign({}, x)),
    garder(l) { LISTE = l; try { localStorage.setItem('rat.repliques', JSON.stringify(l)); } catch (e) {} },
    oublier() { LISTE = REPLIQUES; try { localStorage.removeItem('rat.repliques'); localStorage.removeItem('rat.reglages'); } catch (e) {} },
    garderReglages() { try { localStorage.setItem('rat.reglages', JSON.stringify(R)); } catch (e) {} },
    relire
  };
})();
