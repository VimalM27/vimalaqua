(function () {
  var f = document.getElementById('f'), err = document.getElementById('err'), go = document.getElementById('go'), p = document.getElementById('p');
  document.getElementById('t').addEventListener('click', function () { var s = p.type === 'password'; p.type = s ? 'text' : 'password'; this.textContent = s ? 'Hide' : 'Show'; });
  f.addEventListener('submit', function (e) {
    e.preventDefault(); err.hidden = true; go.disabled = true; go.textContent = 'Signing in…';
    fetch('/api/admin/login', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: f.username.value, password: p.value }) })
      .then(function (r) { return r.json().then(function (j) { return { s: r.status, j: j }; }); })
      .then(function (x) { if (x.s === 200) { location.replace('/admin'); return; } throw new Error(x.j.error || 'Sign in failed'); })
      .catch(function (ex) { err.textContent = ex.message; err.hidden = false; p.value = ''; p.focus(); go.disabled = false; go.textContent = 'Sign in'; });
  });
})();
