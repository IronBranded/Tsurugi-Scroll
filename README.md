# Tsurugi Scroll

> **Multi DFIR · Malware Analysis · Threat Hunting — tool reference map**
> Based on **Tsurugi Linux [LAB] — Tools Listing 26.03**

A static site (plain HTML, CSS and JavaScript, no build step, no dependencies) that maps **1,098 tools** from the Tsurugi Linux LAB distribution into a searchable, filterable reference. Each tool category lives in its own data module, so a category can be updated without touching the rest of the site.

---

<h3 align="center">
  <a href="https://ironbranded.github.io/Tsurugi-Scroll/" target="_blank" rel="noopener noreferrer">
    🟢 OPEN THE SCROLL 🟢
  </a>
</h3>

---

## Features

| Feature | Description |
|---|---|
| **1,098 tools** | 561 from the Tsurugi LAB 2024.1 tools document, 537 added from the 26.03 web listing |
| **26 categories** | Imaging · Memory · Malware · Network · Artifacts · OSINT · Mobile · Cloud · and more |
| **85 subcategories** | In 14 categories: NTFS, Registry, Zeek / Bro, Android, WhatsApp, Cryptocurrency, OCR, etc. |
| **DFIR scenarios** | 542 tools carry a forensic use case. The 26.03 additions do not have one yet (see [Data Source](#data-source)) |
| **Investigation runbooks** | 6 step-by-step SOPs linking tools into complete workflows; every step opens its tool |
| **Filters** | Inside a category: subcategory, type (CLI / GUI / …) and evidence type chips, each with a live count, plus a filter box |
| **Evidence types** | Disk Image · Memory Dump · PCAP · Registry Hive · Browser Artifacts · Mobile Backup · Log Files · Email · Office Documents |
| **Global search** | Searches name, purpose, category, subcategory and DFIR scenario across all categories; results grouped by category |
| **Tool modal** | Purpose, scenario, a quick-reference block you can copy, evidence types, up to 4 related tools from the same subcategory, and prev/next through the current list |
| **OSS / COMM badges** | Open-source vs commercial badge on every card and modal |
| **Bookmarks** | Star any tool; kept in your browser (`localStorage`) and exportable as a Markdown list from the ★ panel |
| **Recently Viewed** | The last 10 tools you opened, in the second tab of the ★ panel |
| **Shareable links** | The URL keeps the current tab, runbook and search (`#tab=Memory&q=volatility`) |
| **Dark / light mode** | 🌙 button or `T`; remembered between visits |
| **Works offline** | Open `index.html` straight from disk; only the web fonts need a connection |

---

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `/` | Focus the search box |
| `↑` `↓` | Move between tool cards (or search results) |
| `Enter` | Open the focused tool or search result |
| `←` `→` | Previous / next tool while a tool modal is open |
| `S` | Star / unstar the focused card, or the tool in the open modal |
| `C` | Copy the quick-reference block of the open modal |
| `B` | Toggle the bookmarks / recently viewed panel |
| `T` | Toggle dark / light mode |
| `?` | Show the keyboard shortcuts |
| `Esc` | Close the modal, panel or search results |

---

## Tool Coverage

| Category | Tools | Notable |
|---|---|---|
| Artifacts | 182 | RegRipper · AnalyzeMFT · chainsaw · bulk_extractor · hindsight · readpst |
| Network | 154 | Wireshark · zeek · tcpdump · NetworkMiner · nmap · suricata |
| Malware | 99 | radare2 · yara · olevba · binwalk · peepdf · CyberChef |
| OSINT | 82 | Maltego · Sherlock · The Harvester · Maigret · spiderfoot |
| Mobile | 73 | adb · iLEAPP · mvt-android · mvt-ios · whapa · Andriller CLI |
| System Tools | 64 | GParted · Htop · BleachBit · Terminator · ciphey |
| Mounting | 57 | dislocker · VeraCrypt CLI · ewfmount · xmount · affuse |
| AI & Vision | 42 | tesseract · Facerec Web GUI · alpr · Object detection GUI |
| Timeline | 41 | log2timeline · psort · Timesketch Launcher · mactime · Velociraptor |
| Passwords | 34 | hashcat · John the Ripper · hydra · ophcrack |
| Office & Docs | 28 | LibreOffice · csvlook · in2csv · xlsx2csv |
| + 15 more | 242 | Steganography 27 · Image Formats 25 · Multimedia 23 · Tunnels & Remote 23 · Virtual & Crypto 22 · Diff Tools 21 · Data Recovery 18 · NFC 17 · Hashing 14 · Imaging 11 · Reporting 11 · Memory 10 · Secure Delete 8 · Cloud 7 · Fuzzy Hashing 5 |

Counts are per category. 17 tools are listed in two categories (for example `exiftool` in Artifacts and Steganography), as in the source document.

---

## Runbooks

| # | Title | Investigation Type | Evidence | Steps |
|---|---|---|---|---|
| 1 | 💾 Disk Acquisition & Chain of Custody | All Investigations | Disk Image | 5 |
| 2 | 🧠 Memory Forensics Investigation | Malware · Ransomware | Memory Dump | 6 |
| 3 | ☠️ Malware Static Triage | Malware | Disk Image · Memory Dump | 7 |
| 4 | 🔐 Ransomware Incident Response | Ransomware | Disk Image · Memory Dump · Log Files · Registry Hive | 7 |
| 5 | 🕵️ Insider Threat / Data Exfiltration | Insider Threat | Disk Image · Log Files · Browser Artifacts · Email | 6 |
| 6 | 🎣 Phishing / Email Investigation | Fraud · Network Intrusion | Email · Office Documents | 6 |

Each step has a tool, an action and an analyst note. Tool names are clickable and open the tool modal.

---

## Data Source

The data comes from two Tsurugi sources:

1. **Tsurugi Linux [LAB] 2024.1 tools document.** 561 tools were extracted from its tables with `python-docx`: name, type (CLI / GUI), purpose and DFIR scenario. Evidence types and open-source status were then filled in per category and subcategory.
2. **[Tools listing 26.03](https://tsurugi-linux.org/documentation_tsurugi_linux_tools_listing_2026.php)** on tsurugi-linux.org. That page lists **names only**. 537 tools from it were added:
   - their **purposes were written by hand**; 41 of them have no purpose yet;
   - their **DFIR scenarios are intentionally empty** until they are written; the modal simply omits the section.

Spellings follow the listing, including `ztreamdump` and `idevicecenterrecovery`. A few tools from the 2024.1 document are not on the 26.03 page and are kept on purpose: `log2timeline` (the page lists PLASO), `hindsight`, `pdfid`, `hydra` (the page lists XHydra) and `NetworkMiner`.

---

## Project Structure

```
index.html                  page markup; loads the files below
assets/css/style.css        all styles (dark/light themes, phone layout, print)
assets/js/app.js            app logic; loads a category's data file when it is first needed
data/manifest.js            categories (icon, colour, description), tab groups,
                            subcategories, evidence types
data/runbooks.js            the investigation runbooks
data/counts.js              per-category counts and total (generated, do not edit)
data/tools/<category>.js    one module per category, e.g. data/tools/memory.js
scripts/build-data.js       validates every module and regenerates data/counts.js
```

Data files are plain `<script>` files rather than JSON, so the site also works when opened from disk (`file://`), where browsers block `fetch`. The home page needs only `manifest.js`, `counts.js` and `runbooks.js`; a category module is loaded when you open its tab, and all of them load on the first search, runbook or bookmark view.

### Third-party resources

The only external request is **Google Fonts** (JetBrains Mono, Cinzel, Inter), linked from `index.html`. Without a connection the page falls back to system fonts. There are no CDN scripts and no analytics.

---

## Editing the Data

Each category module looks like this:

```js
window.TS_DATA=window.TS_DATA||{};
window.TS_DATA["Memory"]=[
{n:'aeskeyfind',t:'CLI',p:'Scan memory dumps for AES key schedules and possible AES keys',s:'Locate AES keys in a RAM capture to decrypt disk volumes or intercepted ciphertext used by the attacker.',c:'Memory',sub:'',ev:['Memory Dump'],oss:true},
// … one line per tool
];
```

| Key | Meaning | Required |
|---|---|---|
| `n` | Tool name, shown and searched as written | yes |
| `t` | Type: `CLI`, `GUI`, `Web/GUI`, … | yes |
| `c` | Category; must be the module's own category | yes |
| `p` | Purpose (`''` if unknown) | yes |
| `ev` | Evidence types, from `EV_TYPES` in `data/manifest.js` (may be `[]`) | yes |
| `s` | DFIR scenario (`''` if none yet) | no |
| `sub` | Subcategory, from `SUBCATS` in `data/manifest.js` (`''` for none) | no |
| `oss` | `true` open-source, `false` commercial | no |

**Add, edit or remove a tool:** edit `data/tools/<category>.js`, then run

```bash
node scripts/build-data.js
```

It checks every module (syntax, required keys, category, subcategory and evidence values, duplicates, runbook links) and rewrites `data/counts.js` and the tool count in `index.html`. Nothing is written if there are errors. Use `node scripts/build-data.js --check` to validate without writing; it exits with an error if anything is invalid or out of date. Node.js 16 or later is required, nothing else.

**Add a category:** add it to `CAT` and to a tab group in `TAB_GROUPS` in `data/manifest.js` (and to `SUBCATS` if it has subcategories), create `data/tools/<name>.js` with the file name the script asks for (`"Office & Docs"` → `office-and-docs.js`), then run the script.

---

## Usage

### Online

The site is published with GitHub Pages at **https://ironbranded.github.io/Tsurugi-Scroll/**. In the repository's Settings → Pages, set **Source: Deploy from a branch**, branch **`main`**, folder **`/ (root)`**; each merge into `main` is then published within a few minutes. All paths are relative, so the `/Tsurugi-Scroll/` sub-path needs no configuration, and there is nothing to build.

### Locally

Windows (PowerShell):

```powershell
git clone https://github.com/IronBranded/Tsurugi-Scroll.git
Set-Location Tsurugi-Scroll
Start-Process .\index.html        # opens in your default browser
```

macOS / Linux:

```bash
git clone https://github.com/IronBranded/Tsurugi-Scroll.git
cd Tsurugi-Scroll
open index.html        # macOS
xdg-open index.html    # Linux
```

No server is needed. To serve it the way GitHub Pages does, run `python -m http.server 8000` in the folder and open http://localhost:8000/.

---

## Changelog

### 26.03 — current

- **Data:** completed the Tools listing 26.03 merge: added `Remotedesktop Connect` and `Remote Desktop Client` (Tunnels & Remote), the only names on the listing with no entry; renamed `stegosuit` to `stegosuite` to match the listing. 1,098 tools.
- **Removed** the 3D Knowledge Nebula (`nebula.html`) and its buttons. It loaded three.js and 3d-force-graph from CDNs; the site now has no third-party scripts.
- **Added** `scripts/build-data.js`, which validates the category modules and regenerates `data/counts.js` (it replaces the `modularize.py` that `counts.js` referred to but which was never in the repository).
- **Fixed** `S` inside the tool modal starring an unrelated tool, and the top bar running off-screen on phones.
- **README** rewritten from the code: real counts, data sources, shortcuts, structure, hosting.

### 26.03 merge and modular split

- Merged the Tools listing 26.03 names into the 2024.1 data: 535 tools added (561 → 1,096), purposes hand-written, scenarios left empty.
- Split the single `index.html` into `assets/` and one data module per category under `data/tools/`.

### 2024.1

- First version: 561 tools from the Tsurugi Linux [LAB] 2024.1 tools document, 26 categories, 6 runbooks.

---

## Acknowledgements

- **[Tsurugi Linux](https://tsurugi-linux.org/)**, the DFIR-focused Linux distribution that is the source of the tool list
- Built for the DFIR community as a quick-reference companion to the Tsurugi LAB environment

---

## License

This reference is an independent community project. Tool names, the 2024.1 purposes and the DFIR scenarios come from the Tsurugi Linux project documentation; the purposes of the 26.03 additions were written for this project. Tsurugi Linux is developed by its respective authors. See [TSURUGI](https://tsurugi-linux.org/) for licensing details.
