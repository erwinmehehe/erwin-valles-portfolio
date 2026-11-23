(() => {
  'use strict';
  const root = document.documentElement;
  const rail = document.getElementById('rail');
  const shade = document.getElementById('mobile-backdrop');
  const menu = document.getElementById('mobile-menu');
  const mobile = matchMedia('(max-width:850px)');
  const theme = document.querySelector('[data-theme-toggle]');
  const syncTheme = () => { if (theme) { const dark = root.dataset.theme === 'dark'; theme.setAttribute('aria-pressed', String(dark)); theme.querySelector('span').textContent = dark ? 'Light mode' : 'Dark mode'; } };
  syncTheme();
  theme?.addEventListener('click', () => { root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark'; try { localStorage.setItem('erwin-portfolio-theme', root.dataset.theme); } catch {} syncTheme(); });
  function drawer(open, restore = true) {
    if (!rail) return;
    rail.classList.toggle('is-open', open); shade.classList.toggle('is-open', open);
    menu.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    rail.inert = mobile.matches && !open;
    document.querySelector('main').inert = open;
    document.querySelector('.mobile-top').inert = open;
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) rail.querySelector('.drawer-close')?.focus(); else if (restore) menu.focus();
  }
  if (rail) {
    drawer(false, false);
    menu.addEventListener('click', () => drawer(!rail.classList.contains('is-open')));
    shade.addEventListener('click', () => drawer(false));
    rail.querySelector('.drawer-close').addEventListener('click', () => drawer(false));
    mobile.addEventListener('change', () => drawer(false, false));
    rail.querySelectorAll('nav a').forEach(a => a.addEventListener('click', () => { if (mobile.matches) { drawer(false, false); const target = document.querySelector(a.hash); if (target) { target.setAttribute('tabindex', '-1'); target.focus({preventScroll:true}); } } }));
    document.addEventListener('keydown', e => {
      if (!mobile.matches || !rail.classList.contains('is-open')) return;
      if (e.key === 'Escape') drawer(false);
      if (e.key === 'Tab') { const controls = [...rail.querySelectorAll('a,button')]; const first = controls[0], last = controls.at(-1); if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); } }
    });
    const nav = [...rail.querySelectorAll('nav a')];
    const observer = new IntersectionObserver(entries => { for (const entry of entries) if (entry.isIntersecting) nav.forEach(a => { const active = a.hash === '#' + entry.target.id; a.classList.toggle('is-active', active); if(active) a.setAttribute('aria-current','location'); else a.removeAttribute('aria-current'); }); }, {rootMargin:'-10% 0px -65% 0px'});
    nav.forEach(a => { const section = document.querySelector(a.hash); if(section) observer.observe(section); });
  }
  const cards = [...document.querySelectorAll('[data-archive]')];
  const filters = [...document.querySelectorAll('[data-filter]')];
  const search = document.getElementById('search'); let category = 'All';
  function filter() { const q = search.value.trim().toLowerCase(); let shown = 0; cards.forEach(c => { c.hidden = !(category === 'All' || c.dataset.category === category) || !c.dataset.search.includes(q); if (!c.hidden) shown++; }); document.getElementById('result-count').textContent = `${shown} project${shown === 1 ? '' : 's'}`; document.getElementById('empty').hidden = shown > 0; document.getElementById('reset-projects').hidden = !q && category === 'All'; }
  if (search) { filters.forEach(b => b.addEventListener('click', () => { category = b.dataset.filter; filters.forEach(x => x.setAttribute('aria-pressed', String(x === b))); filter(); })); search.addEventListener('input', filter); document.getElementById('reset-projects').addEventListener('click', () => { search.value = ''; category = 'All'; filters.forEach(x => x.setAttribute('aria-pressed', String(x.dataset.filter === 'All'))); filter(); search.focus(); }); filter(); }
  const dialog = document.getElementById('detail-dialog'); const holder = document.getElementById('detail-holder'); let opener;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function table(rows, title) { if (!rows.length) return ''; return `<section class="detail__small"><h3>${title}</h3><table><thead><tr><th scope="col">Search term</th><th scope="col">Position</th></tr></thead><tbody>${rows.map(r => `<tr><td>${esc(r[0])}</td><td>#${r[1]}</td></tr>`).join('')}</tbody></table></section>`; }
  document.querySelectorAll('[data-open-project]').forEach(a => a.addEventListener('click', e => {
    if (!dialog || typeof dialog.showModal !== 'function' || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    const p = window.ERWIN_PROJECTS.find(p => p.id === a.dataset.openProject); if (!p) return;
    e.preventDefault(); opener = a;
    holder.innerHTML = `<div class="detail__body"><div class="detail__top"><div><p class="detail__context">${esc(p.industry)} · ${esc(p.market)}</p><h2 id="detail-title">${esc(p.name)}</h2><p class="detail__market">${esc(p.domain)}</p></div><button class="detail__close" type="button" aria-label="Close project">×</button></div><p class="detail__summary">${esc(p.summary)}</p><div class="detail__tabular">${table(p.organic,'Organic search positions')}${table(p.local,'Local search positions')}</div><p class="detail__note">November 2026 snapshot. Rankings can change; these figures do not represent traffic or revenue.</p><div class="detail__footer"><a class="detail__link" href="case-studies/${esc(p.id)}/index.html">View project page</a></div></div>`;
    holder.querySelector('button').addEventListener('click', () => dialog.close()); dialog.showModal();
  }));
  dialog?.addEventListener('click', e => { if (e.target === dialog) { const r = dialog.getBoundingClientRect(); if(e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close(); } });
  dialog?.addEventListener('close', () => opener?.focus());
})();
