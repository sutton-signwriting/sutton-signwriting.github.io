document.querySelector('[data-print]')?.addEventListener('click', () => window.print());

const pageUrl = new URL(window.location.href);
pageUrl.hash = '';
document.querySelectorAll('[data-print-url]').forEach((target) => {
  target.textContent = pageUrl.href;
});

document.querySelectorAll('a[href]').forEach((link) => {
  const href = link.getAttribute('href');
  if (!href || href.startsWith('#')) return;
  try { link.dataset.printHref = new URL(href, document.baseURI).href; } catch {}
});
