/* Gabarit Braise — PRESTIGE.
   Comportements repris de prestige.impact-nva.fr (bascule jour/nuit, en-tête,
   menu, apparitions, curseur avant/après), plus ce qu'un site client ajoute :
   compteur d'appels, formulaire en mode démo, bouton d'appel flottant.
   Aucun marqueur ici : le mode du site est lu sur la balise <html>. */
document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  var root = document.documentElement;
  var estDemo = root.getAttribute('data-mode') === 'demo';
  var mouvementReduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Jour / nuit ----------
     Le thème de départ est posé dans <head> (morceaux/tete.html), selon
     l'heure. Ici, seulement le bouton : il bascule et retient le choix sur
     l'appareil du visiteur. Rien n'est envoyé nulle part. */
  var bascule = document.getElementById('theme-toggle');
  var meta = document.querySelector('meta[name="theme-color"]');
  var couleurBarre = function () {
    if (meta) meta.setAttribute('content', root.getAttribute('data-theme') === 'jour' ? '#F4F2EA' : '#0A0F0C');
  };
  couleurBarre();
  if (bascule) {
    bascule.addEventListener('click', function () {
      var suivant = root.getAttribute('data-theme') === 'jour' ? 'nuit' : 'jour';
      root.setAttribute('data-theme', suivant);
      couleurBarre();
      try { localStorage.setItem('theme-site', suivant); } catch (e) { /* stockage indisponible */ }
    });
  }

  /* ---------- En-tête : sous le bandeau de démo, puis condensé ---------- */
  var entete = document.querySelector('.site-header');
  var bandeau = document.querySelector('.bandeau-demo');
  var poserBandeau = function () {
    var h = bandeau && bandeau.offsetParent !== null ? bandeau.offsetHeight : 0;
    root.style.setProperty('--bandeau', h + 'px');
  };
  poserBandeau();
  window.addEventListener('resize', poserBandeau);
  if (entete) {
    var auDefilement = function () { entete.classList.toggle('scrolled', window.scrollY > 12); };
    auDefilement();
    window.addEventListener('scroll', auDefilement, { passive: true });
  }

  /* La page en cours est marquée dans le menu. */
  var page = document.body.getAttribute('data-page');
  var courant = document.querySelector('.nav-links a[data-lien="' + page + '"]');
  if (courant) courant.setAttribute('aria-current', 'page');

  /* ---------- Menu mobile ---------- */
  var boutonMenu = document.getElementById('nav-toggle');
  var liens = document.getElementById('nav-links');
  if (boutonMenu && liens) {
    var fermer = function () {
      liens.classList.remove('open');
      root.classList.remove('menu-ouvert');
      boutonMenu.setAttribute('aria-expanded', 'false');
      boutonMenu.setAttribute('aria-label', 'Ouvrir le menu');
    };
    boutonMenu.addEventListener('click', function () {
      var ouvert = liens.classList.toggle('open');
      root.classList.toggle('menu-ouvert', ouvert);
      boutonMenu.setAttribute('aria-expanded', String(ouvert));
      boutonMenu.setAttribute('aria-label', ouvert ? 'Fermer le menu' : 'Ouvrir le menu');
    });
    liens.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', fermer); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') fermer(); });
  }

  /* ---------- Apparitions au défilement ---------- */
  var aReveler = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !mouvementReduit) {
    var io = new IntersectionObserver(function (entrees, obs) {
      entrees.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });
    aReveler.forEach(function (el) { io.observe(el); });
  } else {
    aReveler.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ---------- Curseur avant / après (gauche ↔ droite) ---------- */
  document.querySelectorAll('.ba-slider').forEach(function (curseur, index) {
    var range = curseur.querySelector('.ba-range');
    if (!range) return;
    var cible = 50, actuel = 50, anim = null;
    var appliquer = function (v) { curseur.style.setProperty('--cut', v + '%'); };
    var pas = function () {
      actuel += (cible - actuel) * 0.16;
      if (Math.abs(cible - actuel) < 0.05) { actuel = cible; appliquer(actuel); anim = null; return; }
      appliquer(actuel);
      anim = requestAnimationFrame(pas);
    };
    var viser = function (v) {
      cible = Math.min(100, Math.max(0, v));
      if (mouvementReduit) { actuel = cible; appliquer(actuel); return; }
      if (!anim) anim = requestAnimationFrame(pas);
    };
    /* Dès que le visiteur touche le curseur, l'invite automatique s'arrête. */
    var touche = false;
    range.addEventListener('input', function () { touche = true; viser(parseFloat(range.value)); });
    range.addEventListener('pointerdown', function () { touche = true; });
    /* Au clavier, une flèche déplace de 5 % (le pas fin de 0,1 % sert au
       glisser, il serait imperceptible à la flèche). */
    range.addEventListener('keydown', function (e) {
      var sens = (e.key === 'ArrowRight' || e.key === 'ArrowUp') ? 1 : (e.key === 'ArrowLeft' || e.key === 'ArrowDown') ? -1 : 0;
      if (!sens) return;
      e.preventDefault();
      touche = true;
      var v = Math.min(100, Math.max(0, parseFloat(range.value) + sens * 5));
      range.value = v;
      viser(v);
    });

    /* Petite invite au premier passage : le curseur bouge une fois tout seul. */
    if (!mouvementReduit && 'IntersectionObserver' in window) {
      var invite = new IntersectionObserver(function (entrees, obs) {
        if (!entrees[0].isIntersecting) return;
        obs.disconnect();
        var base = 250 + index * 200;
        /* Corrigé le 08/11/2026 : l'ancienne version (celle du site officiel)
           restait bloquée à 66 %, car elle vérifiait que le curseur était
           encore au milieu — ce qu'il n'était plus après le premier pas. */
        [[base, 66], [base + 600, 38], [base + 1200, 50]].forEach(function (etape) {
          setTimeout(function () {
            if (!touche) { viser(etape[1]); range.value = etape[1]; }
          }, etape[0]);
        });
      }, { threshold: 0.5 });
      invite.observe(curseur);
    }
  });

  /* ---------- Compteur d'appels ----------
     Un appui sur un numéro prévient n8n, et rien d'autre : pas de cookie,
     aucune donnée personnelle, aucun identifiant de visiteur. Pour un
     paysagiste, l'appel EST la demande : sans ce signal, personne ne sait
     si le site sert à quelque chose (leçon MAC PRESTA).
     Vide (COMPTEUR_URL non fourni) = rien ne part. */
  var compteur = root.getAttribute('data-compteur');
  if (compteur) {
    document.addEventListener('click', function (e) {
      var lien = e.target.closest ? e.target.closest('a[href^="tel:"]') : null;
      if (!lien) return;
      try {
        var corps = JSON.stringify({ evenement: 'appel', site: root.getAttribute('data-domaine') || '', page: location.pathname });
        if (navigator.sendBeacon) navigator.sendBeacon(compteur, new Blob([corps], { type: 'application/json' }));
      } catch (err) { /* un compteur en panne ne doit jamais bloquer un appel */ }
    }, true);
  }

  /* ---------- Formulaire de contact ---------- */
  var form = document.querySelector('.contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      /* En démonstration, le formulaire ne part nulle part : on le dit
         au visiteur au lieu de perdre son message. */
      if (estDemo || !form.getAttribute('action')) {
        e.preventDefault();
        var note = form.querySelector('.retour-envoi');
        if (!note) {
          note = document.createElement('p');
          note.className = 'retour-envoi form-status';
          note.setAttribute('role', 'status');
          form.appendChild(note);
        }
        note.textContent = 'Formulaire désactivé sur cette démonstration. Sur le site définitif, '
          + 'chaque demande arrive directement chez vous, avec ses photos.';
        return;
      }
      var bouton = form.querySelector('button[type="submit"]');
      if (bouton) { bouton.disabled = true; bouton.textContent = 'Envoi en cours…'; }
    });
  }

  /* ---------- Bouton d'appel flottant (téléphone) ----------
     Il apparaît une fois le haut de page dépassé, pour ne pas doubler le
     bouton d'appel déjà visible au premier écran. */
  var appel = document.querySelector('.appel-flottant');
  if (appel) {
    /* Il n'apparaît qu'une fois le bouton d'appel du haut de page sorti de
       l'écran : jamais deux numéros visibles en même temps. */
    var premier = document.querySelector('.hero-actions .tel-mobile');
    var montrer = function () {
      var seuil = premier ? premier.getBoundingClientRect().bottom + window.scrollY : 420;
      appel.classList.toggle('est-visible', window.scrollY > seuil);
    };
    montrer();
    window.addEventListener('scroll', montrer, { passive: true });
  }

  /* ---------- Année courante dans le pied de page ---------- */
  var annee = String(new Date().getFullYear());
  document.querySelectorAll('[data-annee]').forEach(function (el) { el.textContent = annee; });
});
