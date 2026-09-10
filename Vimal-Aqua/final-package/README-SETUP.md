# Vimal Pets World — Android App

This is a **Trusted Web Activity (TWA)** — an official Google-supported way to
wrap `https://vimal27.in/` as a real Android app. The app does not contain a
copy of your website; it opens your live site full-screen, with no browser
address bar. That means **you never rebuild the app when you update your
website** — only if you change the app's identity (icon, name, package) would
you rebuild.

## 1. Add this to your GitHub repo

Your existing repo (`VimalM27/vimalaqua`) already deploys the website via
Vercel. Add the Android project alongside it, without touching your website
code:

```
your-repo/
├── (existing website files — unchanged)
├── android-app/              ← copy this whole folder here
│   ├── app/
│   ├── build.gradle
│   ├── settings.gradle
│   └── ...
└── .github/
    └── workflows/
        └── build-apk.yml     ← copy this file here (repo root, not inside android-app)
```

Commit and push both. GitHub Actions will automatically build a **debug APK**
on every push that touches `android-app/**` — no setup needed for this part.

## 2. Get your first APK

After pushing:
1. Go to your repo on GitHub → **Actions** tab.
2. Open the latest "Build Android APK" run.
3. Download the `vimal-pets-world-debug-apk` artifact — that's your
   installable `.apk`. Share it directly (WhatsApp, Drive link, your site)
   for people to sideload and test.

Android will show an "unknown source" warning on install since it isn't from
the Play Store yet — that's expected for a sideloaded APK.

## 3. Make it open with no browser bar at all (important)

Right now Android will still show a small address bar until it can verify you
actually own vimal27.in. To remove it completely, upload the included
`assetlinks.json` to your website at exactly this path:

```
https://vimal27.in/.well-known/assetlinks.json
```

(Create a `.well-known` folder at your site's root containing that file,
then redeploy the website as normal.) Once that URL is live, reinstall the
app and the address bar disappears — it'll look completely native.

## 4. Play Store (optional, $25 one-time)

The debug APK above is fine for testing/sharing but Play Store requires a
**signed release build**.

- A signing keystore (`release.keystore`) is already generated for you in
  this folder, along with `release-keystore-base64.txt`.
- ⚠️ **This keystore's password (`vimalpets123`) is a placeholder for
  getting started — do not ship to production with it.** Before a real Play
  Store submission, generate your own keystore with a strong unique password
  (`keytool -genkeypair ...`, same command structure as this one) and keep it
  private — never commit a production keystore to a public repo.
- To enable the signed build workflow: in your GitHub repo → Settings →
  Secrets and variables → Actions, add these **secrets**:
  - `SIGNING_KEY` — contents of `release-keystore-base64.txt`
  - `KEY_ALIAS` — `vimalpets`
  - `KEY_STORE_PASSWORD` — `vimalpets123` (or your new password)
  - `KEY_PASSWORD` — `vimalpets123` (or your new password)
  Then add a repo **variable** named `ENABLE_RELEASE_BUILD` set to `true`.
  Next push will produce a signed `vimal-pets-world-release-apk` artifact —
  upload that to Play Console.
- Register a Google Play Developer account (one-time $25) at
  https://play.google.com/console/signup, create a new app, and upload the
  signed APK (or let Play App Signing take over key management, which Google
  recommends for new apps).

## 5. Building locally instead (optional)

If you have Android Studio installed, just open the `android-app` folder as
a project — Studio will regenerate the Gradle wrapper automatically and you
can hit Run to test on an emulator/device, or Build → Generate Signed Bundle
/ APK for a release build.

## App details

- Package name: `com.vimal27.petsworld`
- App name: Vimal Pets World
- Loads: https://vimal27.in/
- Icon/splash: generated from your existing `icon.png`
- Theme colors: matched to your site (`#071A3D` navy, `#00B4D8` aqua accent)
