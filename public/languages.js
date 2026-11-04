// Stable documentation anchors and landing sections survive a language switch.
for (const anchor of document.querySelectorAll('.language-switcher a')) {
  anchor.addEventListener('click', () => {
    const destination = new URL(anchor.href);
    destination.hash = location.hash;
    anchor.href = destination.href;
  });
}
