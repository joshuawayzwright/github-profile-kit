# GitHub Profile Kit

Fill in a form and get a clean GitHub profile README: a header, social badges, an "About me" section, projects and skills. Copy the Markdown or download `README.md`.

**[Open the app](https://joshuawayzwright.github.io/github-profile-kit/)**

It's the same layout as [my own profile](https://github.com/joshuawayzwright).

## Features

- Badges for LinkedIn, GitHub, X, YouTube, Instagram, TikTok, Threads and Facebook, plus website and email
- Type a handle (`@you`) or paste a full link. Tracking codes like `?utm_source=` are removed.
- Pick your own badge colours
- "About me" intro and a "Right now I'm" list
- Projects (`Name | https://link | description`) and skills
- Optional GitHub stats card (from the third-party [github-readme-stats](https://github.com/anuraghazra/github-readme-stats) service)
- Escapes what you type so it can't break the Markdown or inject HTML, and only accepts `https://` and `mailto:` links

## Use it

1. On GitHub, create a **public** repository with exactly the same name as your username.
2. Add `README.md` and paste in what the kit made.
3. Commit. It appears at the top of your profile.

## Privacy

Everything runs in your browser. No server, accounts, cookies or analytics, and nothing you type is sent anywhere. Badge images load from shields.io only when someone views your finished README on GitHub.

## Run it yourself

```bash
git clone https://github.com/joshuawayzwright/github-profile-kit.git
cd github-profile-kit
python3 -m http.server 8080   # then open http://localhost:8080
```

## Tests

```bash
npm test      # or: node --test "tests/*.test.js"
```

## Licence

[MIT](LICENSE). Made by [Joshua Wright](https://github.com/joshuawayzwright).
