(() => {
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
  function update() {
    const dark = systemTheme.matches;
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#181417' : '#fff8f3');
  }
  update();
  systemTheme.addEventListener('change', update);
})();
