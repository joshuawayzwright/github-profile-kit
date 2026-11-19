const test = require('node:test');
const assert = require('node:assert/strict');
const K = require('../lib.js');
const social = key => K.SOCIALS.find(s => s.key === key);

test('shields path escapes dashes, underscores, spaces and @', () => {
  assert.equal(K.shieldsPart('joshuawright-solo'), 'joshuawright--solo');
  assert.equal(K.shieldsPart('Get in touch'), 'Get_in_touch');
  assert.equal(K.shieldsPart('a_b'), 'a__b');
  assert.equal(K.shieldsPart('@me'), '%40me');
});

test('badge URL uses cleaned colours and falls back on bad input', () => {
  const u = K.badgeUrl('LinkedIn', 'me', '#0087ff', 'linkedin', 'nope');
  assert.equal(u, 'https://img.shields.io/badge/LinkedIn-me-0087FF?style=for-the-badge&logo=linkedin&logoColor=white&labelColor=0A0A0A');
});

test('resolveSocial accepts handles and full URLs, and strips tracking', () => {
  assert.deepEqual(K.resolveSocial(social('tiktok'), '@joshwrightwayz'), { url: 'https://www.tiktok.com/@joshwrightwayz', handle: 'joshwrightwayz' });
  assert.deepEqual(
    K.resolveSocial(social('linkedin'), 'https://www.linkedin.com/in/joshuawright-solo?utm_source=share_via'),
    { url: 'https://www.linkedin.com/in/joshuawright-solo', handle: 'joshuawright-solo' });
  assert.equal(K.resolveSocial(social('x'), ''), null);
  assert.equal(K.resolveSocial(social('x'), 'https://x.com/a"onmouseover="b'), null);
});

test('projects parse with optional link and description; unsafe links are rejected', () => {
  const r = K.parseProjects('Jarvis | https://github.com/me/jarvis | AI agent\nNotes\nBad | javascript:alert(1) | x');
  assert.equal(r.projects.length, 3);
  assert.equal(r.projects[0].description, 'AI agent');
  assert.equal(r.projects[1].url, '');
  assert.equal(r.projects[2].url, '');
  assert.match(r.errors[0], /Project 3/);
});

test('README contains header, badges, about, projects and skills', () => {
  const r = K.buildReadme({
    name: 'Joshua Wright', tagline: 'Practical tools', location: 'Gold Coast',
    socials: { linkedin: 'joshuawright-solo', tiktok: '@joshwrightwayz' },
    website: 'https://thesoloserviceprovider.com.au/', email: 'me@example.com',
    intro: 'G\'day.', about: 'Building SOLO AI\nStudying CS',
    projects: 'Jarvis | https://github.com/me/jarvis | AI agent', skills: 'JavaScript, Python, Kotlin'
  });
  assert.deepEqual(r.errors, []);
  assert.equal(r.badgeCount, 4);
  assert.match(r.markdown, /^<div align="center">\n\n# Joshua Wright/);
  assert.match(r.markdown, /href="https:\/\/www\.tiktok\.com\/@joshwrightwayz"/);
  assert.match(r.markdown, /Website-thesoloserviceprovider\.com\.au/);
  assert.match(r.markdown, /## About me\n\nG'day\.\n\nRight now I'm:\n\n- Building SOLO AI\n- Studying CS/);
  assert.match(r.markdown, /- \*\*\[Jarvis\]\(https:\/\/github\.com\/me\/jarvis\)\*\*: AI agent/);
  assert.match(r.markdown, /`JavaScript` · `Python` · `Kotlin`/);
});

test('user text cannot inject HTML or break Markdown', () => {
  const r = K.buildReadme({ name: '<script>x</script>', about: '[click](javascript:1)' });
  assert.ok(!r.markdown.includes('<script>'));
  assert.ok(r.markdown.includes('\\<script\\>'));
  assert.ok(r.markdown.includes('\\[click\\]'));
});

test('bad website and email are reported, not added', () => {
  const r = K.buildReadme({ website: 'http://insecure.example', email: 'not-an-email' });
  assert.equal(r.badgeCount, 0);
  assert.equal(r.errors.length, 2);
});

test('stats card only for a clean username', () => {
  assert.match(K.buildReadme({ statsFor: 'joshuawayzwright' }).markdown, /username=joshuawayzwright&/);
  assert.match(K.buildReadme({ statsFor: 'a b"c' }).markdown, /username=abc&/);
});
