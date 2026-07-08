// ===== Scroll progress bar =====
const progress = document.querySelector('.scroll-progress');
const nav = document.getElementById('nav');

function onScroll(){
  const h = document.documentElement.scrollHeight - window.innerHeight;
  const scrolled = window.scrollY;
  progress.style.width = (scrolled / h * 100) + '%';

  // Nav background
  nav.classList.toggle('scrolled', scrolled > 60);

  // Parallax
  document.querySelectorAll('[data-parallax]').forEach(el => {
    const speed = parseFloat(el.dataset.parallax);
    const rect = el.getBoundingClientRect();
    const offset = (rect.top + rect.height / 2 - window.innerHeight / 2);
    el.style.transform = `translateY(${-offset * speed}px)`;
  });
}

let ticking = false;
window.addEventListener('scroll', () => {
  if(!ticking){
    requestAnimationFrame(() => { onScroll(); ticking = false; });
    ticking = true;
  }
}, {passive:true});
onScroll();

// ===== Reveal on scroll =====
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      entry.target.classList.add('in');
      revealObserver.unobserve(entry.target);
    }
  });
}, {threshold:0.15, rootMargin:'0px 0px -60px 0px'});

document.querySelectorAll('.reveal, .reveal-left').forEach(el => revealObserver.observe(el));

// ===== Animated counters =====
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);
      const duration = 1600;
      const start = performance.now();
      function tick(now){
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(eased * target) + (el.dataset.suffix || '');
        if(p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      counterObserver.unobserve(el);
    }
  });
}, {threshold:0.6});

document.querySelectorAll('[data-count]').forEach(el => counterObserver.observe(el));

// ===== Menu tabs =====
const tabs = document.querySelectorAll('.menu__tab');
const panels = document.querySelectorAll('.menu__panel');
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.tab;
    tabs.forEach(t => t.classList.toggle('is-active', t === tab));
    panels.forEach(p => p.classList.toggle('is-active', p.dataset.panel === target));
  });
});

// ===== Reservation → WhatsApp =====
// ⚠️ Remplace ce numéro par le vrai numéro WhatsApp du restaurant
// Format international sans "+" ni espaces. Ex. Côte d'Ivoire : 225 07 XX XX XX XX
const WHATSAPP_NUMBER = '2250700000000';

document.getElementById('reserveForm')?.addEventListener('submit', function(e){
  e.preventDefault();
  const nom      = document.getElementById('r-nom').value.trim();
  const tel      = document.getElementById('r-tel').value.trim();
  const date     = document.getElementById('r-date').value;
  const heure    = document.getElementById('r-heure').value;
  const couverts = document.getElementById('r-couverts').value;

  // Date au format lisible
  let dateFr = date;
  if(date){
    try { dateFr = new Date(date + 'T00:00').toLocaleDateString('fr-FR', {weekday:'long', day:'numeric', month:'long', year:'numeric'}); } catch(_){}
  }

  const message =
    `Bonjour L'Endroit ! Je souhaite réserver une table.\n\n` +
    `• Nom : ${nom}\n` +
    `• Téléphone : ${tel}\n` +
    `• Date : ${dateFr}\n` +
    `• Heure : ${heure}\n` +
    `• Nombre de convives : ${couverts}\n\n` +
    `Merci de me confirmer la disponibilité.`;

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
});
