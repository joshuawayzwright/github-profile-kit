/* Builds a GitHub profile README in Markdown. Pure functions: no DOM, no network. */
(function (root) {
  'use strict';

  var SOCIALS = [
    { key: 'linkedin', label: 'LinkedIn', logo: 'linkedin', base: 'https://www.linkedin.com/in/' },
    { key: 'github', label: 'GitHub', logo: 'github', base: 'https://github.com/' },
    { key: 'x', label: 'X', logo: 'x', base: 'https://x.com/' },
    { key: 'youtube', label: 'YouTube', logo: 'youtube', base: 'https://www.youtube.com/@' },
    { key: 'instagram', label: 'Instagram', logo: 'instagram', base: 'https://www.instagram.com/' },
    { key: 'tiktok', label: 'TikTok', logo: 'tiktok', base: 'https://www.tiktok.com/@' },
    { key: 'threads', label: 'Threads', logo: 'threads', base: 'https://www.threads.com/@' },
    { key: 'facebook', label: 'Facebook', logo: 'facebook', base: 'https://www.facebook.com/' }
  ];

  function escHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /** Escapes characters that would change Markdown meaning in plain text. */
  function escMd(s) {
    return String(s).replace(/([\\`*_[\]<>|#])/g, '\\$1');
  }

  function cleanColor(c, fallback) {
    var v = String(c || '').replace(/^#/, '');
    return /^[0-9a-fA-F]{6}$/.test(v) ? v.toUpperCase() : fallback;
  }

  /** Text for one part of a shields.io static badge path. */
  function shieldsPart(text) {
    return encodeURIComponent(String(text).replace(/-/g, '--').replace(/_/g, '__').replace(/ /g, '_'));
  }

  function badgeUrl(label, message, color, logo, labelColor) {
    var url = 'https://img.shields.io/badge/' + shieldsPart(label) + '-' + shieldsPart(message) + '-' + cleanColor(color, '0087FF') +
      '?style=for-the-badge';
    if (logo) url += '&logo=' + encodeURIComponent(logo) + '&logoColor=white';
    url += '&labelColor=' + cleanColor(labelColor, '0A0A0A');
    return url;
  }

  function isSafeUrl(u) {
    return /^https:\/\/[^\s<>"]+$/i.test(String(u)) || /^mailto:[^\s<>"]+@[^\s<>"]+$/i.test(String(u));
  }

  /**
   * Accepts a handle ("@sam", "sam") or a full https URL and returns { url, handle }.
   * Tracking query strings are removed from URLs.
   */
  function resolveSocial(social, value) {
    var v = String(value || '').trim();
    if (!v) return null;
    if (/^https?:\/\//i.test(v)) {
      var url = v.replace(/^http:/i, 'https:').split('#')[0].split('?')[0];
      var path = url.replace(/\/+$/, '').split('/');
      var handle = decodeURIComponent(path[path.length - 1] || social.label).replace(/^@/, '');
      return isSafeUrl(url) ? { url: url, handle: handle } : null;
    }
    var h = v.replace(/^@/, '').replace(/[^\w.\-]/g, '');
    if (!h) return null;
    return { url: social.base + h, handle: h };
  }

  function lines(text) {
    return String(text || '').split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
  }

  /** "Name | https://url | description" per line. */
  function parseProjects(text) {
    var projects = [];
    var errors = [];
    lines(text).forEach(function (line, i) {
      var parts = line.split('|').map(function (s) { return s.trim(); });
      var name = parts[0];
      var url = parts[1] || '';
      var desc = parts.slice(2).join(' | ');
      if (!name) { errors.push('Project ' + (i + 1) + ': add a name.'); return; }
      if (url && !isSafeUrl(url)) { errors.push('Project ' + (i + 1) + ': the link must start with https://'); url = ''; }
      projects.push({ name: name, url: url, description: desc });
    });
    return { projects: projects, errors: errors };
  }

  function buildReadme(input) {
    var d = input || {};
    var accent = cleanColor(d.accent, 'D4AF37');
    var labelColor = cleanColor(d.labelColor, '0A0A0A');
    var errors = [];
    var out = [];

    out.push('<div align="center">');
    out.push('');
    out.push('# ' + escMd(d.name || 'Your Name'));
    out.push('');
    if (d.tagline) { out.push('**' + escMd(d.tagline) + '**'); out.push(''); }
    if (d.location) { out.push(escMd(d.location)); out.push(''); }

    var badges = [];
    SOCIALS.forEach(function (s) {
      var r = resolveSocial(s, d.socials && d.socials[s.key]);
      if (!r) return;
      badges.push('<a href="' + escHtml(r.url) + '"><img src="' + escHtml(badgeUrl(s.label, r.handle, accent, s.logo, labelColor)) + '" alt="' + escHtml(s.label) + '" /></a>');
    });
    if (d.website) {
      if (isSafeUrl(d.website)) {
        var host = d.website.replace(/^https:\/\//i, '').replace(/\/.*$/, '');
        badges.push('<a href="' + escHtml(d.website) + '"><img src="' + escHtml(badgeUrl('Website', host, accent, '', labelColor)) + '" alt="Website" /></a>');
      } else errors.push('Website must start with https://');
    }
    if (d.email) {
      if (/^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/.test(d.email)) {
        badges.push('<a href="mailto:' + escHtml(d.email) + '"><img src="' + escHtml(badgeUrl('Email', 'Get in touch', accent, 'gmail', labelColor)) + '" alt="Email" /></a>');
      } else errors.push('Email address doesn\'t look right.');
    }
    if (badges.length) { out.push(badges.join('\n')); out.push(''); }
    out.push('</div>');

    var about = lines(d.about);
    if (d.intro || about.length) {
      out.push('');
      out.push('## About me');
      out.push('');
      if (d.intro) { out.push(escMd(d.intro)); out.push(''); }
      if (about.length) {
        out.push('Right now I\'m:');
        out.push('');
        about.forEach(function (a) { out.push('- ' + escMd(a)); });
      }
    }

    var parsed = parseProjects(d.projects);
    errors = errors.concat(parsed.errors);
    if (parsed.projects.length) {
      out.push('');
      out.push('## Projects');
      out.push('');
      parsed.projects.forEach(function (p) {
        var title = p.url ? '[' + escMd(p.name) + '](' + p.url + ')' : escMd(p.name);
        out.push('- **' + title + '**' + (p.description ? ': ' + escMd(p.description) : ''));
      });
    }

    var skills = String(d.skills || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    if (skills.length) {
      out.push('');
      out.push('## Skills');
      out.push('');
      out.push(skills.map(function (s) { return '`' + s.replace(/`/g, '') + '`'; }).join(' · '));
    }

    if (d.statsFor) {
      var user = String(d.statsFor).replace(/[^\w-]/g, '');
      if (user) {
        out.push('');
        out.push('## GitHub activity');
        out.push('');
        out.push('[![' + escMd(user) + '\'s GitHub stats](https://github-readme-stats.vercel.app/api?username=' + user + '&show_icons=true&hide_border=true)](https://github.com/' + user + ')');
      }
    }

    out.push('');
    return { markdown: out.join('\n'), errors: errors, badgeCount: badges.length };
  }

  var api = {
    SOCIALS: SOCIALS, escHtml: escHtml, escMd: escMd, cleanColor: cleanColor, shieldsPart: shieldsPart,
    badgeUrl: badgeUrl, isSafeUrl: isSafeUrl, resolveSocial: resolveSocial, parseProjects: parseProjects,
    buildReadme: buildReadme
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.ProfileKit = api;
})(this);
