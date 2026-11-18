/* ---------- Boot ---------- */
BOT_URL = botCanvas().toDataURL();
document.body.insertAdjacentHTML('beforeend', themeBtnHTML('theme-corner', 'themeCorner'));
try { UI.sideMini = localStorage.getItem('cybersity-side-mini') === '1'; } catch(e){}
renderApp();
