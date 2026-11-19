(function () {
  'use strict';
  var K = window.ProfileKit;
  var $ = function (id) { return document.getElementById(id); };
  var fields = ['name', 'location', 'tagline', 'website', 'email', 'accent', 'labelColor', 'intro', 'about', 'projects', 'skills', 'statsFor'];
  var current = '';

  var socialsBox = $('socials');
  K.SOCIALS.forEach(function (s) {
    var wrap = document.createElement('div');
    var label = document.createElement('label');
    label.htmlFor = 'social-' + s.key;
    label.textContent = s.label;
    var input = document.createElement('input');
    input.id = 'social-' + s.key;
    input.dataset.social = s.key;
    input.autocomplete = 'off';
    wrap.appendChild(label);
    wrap.appendChild(input);
    socialsBox.appendChild(wrap);
  });

  function read() {
    var d = { socials: {} };
    fields.forEach(function (f) { d[f] = $(f).value; });
    socialsBox.querySelectorAll('input').forEach(function (i) { d.socials[i.dataset.social] = i.value; });
    return d;
  }

  function render() {
    var r = K.buildReadme(read());
    current = r.markdown;
    $('output').textContent = current;
    $('errors').textContent = r.errors.join(' ');
  }

  function say(msg) { $('status').textContent = msg; }

  $('form').addEventListener('input', render);
  $('form').addEventListener('submit', function (e) { e.preventDefault(); });
  $('copy').addEventListener('click', function () {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(current).then(function () { say('Markdown copied.'); }, function () { say('Copy blocked: select the text and copy it instead.'); });
    } else { say('Copy isn\'t available here: select the text and copy it instead.'); }
  });
  $('download').addEventListener('click', function () {
    var url = URL.createObjectURL(new Blob([current], { type: 'text/markdown;charset=utf-8' }));
    var a = document.createElement('a');
    a.href = url; a.download = 'README.md';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    say('Downloaded README.md.');
  });
  render();
})();
