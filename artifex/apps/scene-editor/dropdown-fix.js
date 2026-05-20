(() => {
  document.addEventListener('click', (event) => {
    const importMenu = document.getElementById('importMenu');
    if (!importMenu) return;

    const importToggle = event.target.closest && event.target.closest('#importToggle');
    const clickedInsideMenu = event.target.closest && event.target.closest('#importMenu');

    if (importToggle) {
      event.preventDefault();
      importMenu.classList.toggle('is-open');
      return;
    }

    if (!clickedInsideMenu) {
      importMenu.classList.remove('is-open');
    }
  }, true);
})();
