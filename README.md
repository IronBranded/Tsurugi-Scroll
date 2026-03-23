# Tsurugi Scroll

> **Multi DFIR · Malware Analysis · Threat Hunting — tool reference map**  
> Based on **Tsurugi Linux [LAB] — Tools Listing 2024.1**

A single self-contained HTML file that maps all **1,156 tools** from the Tsurugi Linux LAB distribution into an interactive, searchable, filterable reference. Open it locally in any browser — no server, no dependencies, no build step.

---

## Screenshot

![Tsurugi Scroll — dark mode home view](.github/screenshot.png)

---

<h3 align="center">
  <a href="https://ironbranded.github.io/Tsurugi-Scroll/" target="_blank" rel="noopener noreferrer">
    🟢 RUN THE SCROLL 🟢
  </a>
</h3>

---
## Features

| Feature | Description |
|---|---|
| **1,156 tools** | All tools from Tsurugi LAB 2024.1, parsed directly from the source document |
| **26 categories** | Imaging · Memory · Malware · Network · Artifacts · OSINT · Mobile · Cloud · and more |
| **50+ subcategories** | Drill into NTFS, Registry, Zeek, Android, WhatsApp, Cryptocurrency, etc. |
| **DFIR Scenarios** | Every tool includes a real-world forensic use case from the Tsurugi documentation |
| **Investigation Runbooks** | 6 step-by-step SOPs linking tools into complete workflows |
| **Evidence Type Filter** | Filter by Disk Image · Memory Dump · PCAP · Registry Hive · Browser Artifacts · Mobile Backup · Log Files · Email · Office Documents |
| **Tool Status Badges** | `OSS` (open-source) vs `COMM` (commercial) badge on every card and modal |
| **Bookmarks** | Star any tool — persisted in `localStorage`, accessible via the ★ panel |
| **Dark / Light mode** | Toggle with the 🌙 button or press `T` |
| **Keyboard navigation** | Full keyboard control — see shortcuts below |
| **Global search** | Searches name, purpose, category, subcategory, and DFIR scenario simultaneously |

---

## Runbooks

| # | Title | Investigation Type | Evidence |
|---|---|---|---|
| 1 | 💾 Disk Acquisition & Chain of Custody | All Investigations | Disk Image |
| 2 | 🧠 Memory Forensics Investigation | Malware · Ransomware | Memory Dump |
| 3 | ☠️ Malware Static Triage | Malware | Disk Image · Memory Dump |
| 4 | 🔐 Ransomware Incident Response | Ransomware | Disk Image · Memory Dump · Log Files · Registry Hive |
| 5 | 🕵️ Insider Threat / Data Exfiltration | Insider Threat | Disk Image · Log Files · Browser Artifacts · Email |
| 6 | 🎣 Phishing / Email Investigation | Fraud · Network Intrusion | Email · Office Documents |

Each runbook contains numbered steps with tool name, action description, and analyst notes — tool names are clickable and open the full tool modal.

---

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `/` | Focus the search box |
| `↑` `↓` | Navigate tool cards |
| `Enter` | Open focused tool modal |
| `S` | Star / unstar focused tool |
| `B` | Toggle bookmarks panel |
| `T` | Toggle dark / light mode |
| `?` | Show keyboard shortcuts help |
| `Esc` | Close modal / clear search |

---

## Usage

```bash
# Clone the repo
git clone https://github.com/your-username/tsurugi-scroll.git
cd tsurugi-scroll

# Open directly — no server needed
open tsurugi-scroll.html          # macOS
xdg-open tsurugi-scroll.html      # Linux
start tsurugi-scroll.html         # Windows
```

Or just download `tsurugi-scroll.html` and open it in any modern browser.

---

## Tool Coverage

| Category | Tools | Notable |
|---|---|---|
| Artifacts | 190 | Registry · NTFS · Browser · Email · Windows Logs · ZFS · XFS · APFS |
| Network | 156 | Wireshark · Zeek · tcpdump · NetworkMiner · nmap |
| Malware | 111 | Radare2 · Ghidra · YARA · oletools · binwalk · peepdf |
| OSINT | 95 | Maltego · Sherlock · theHarvester · Maigret · Shodan |
| Mounting | 57 | dislocker · VeraCrypt · ewfmount · xmount · affuse |
| Mobile | 56 | adb · iLEAPP · mvt-android · whapa · Andriller |
| Passwords | 43 | hashcat · John the Ripper · hydra · ophcrack |
| Timeline | 42 | log2timeline/plaso · Timesketch · Autopsy · mactime |
| AI & Vision | 42 | tesseract · OpenCV face recognition · OCR pipeline |
| Data Recovery | 39 | photorec · testdisk · scalpel · foremost · extundelete |
| Memory | 12 | Volatility3 · avml · WinSuperMem · rsakeyfind |
| + 15 more | … | … |

---

## Data Source

All tool data is extracted directly from the official **Tsurugi Linux [LAB] SCROLL — Tools Listing 2024.1** document using `python-docx`, parsing every table row with:

- Tool name
- Type (CLI / GUI)
- Purpose / description
- DFIR scenario / use case

Evidence type tags and open-source status are enriched programmatically based on category and subcategory.

---

## Structure

```
tsurugi-scroll.html    # Complete self-contained app — open in browser
README.md              # This file
```

The entire application — CSS, data, and JavaScript — is contained in a single HTML file with no external dependencies beyond Google Fonts (loaded from CDN, gracefully degraded if offline).

---

## Categories

Imaging · Image Formats · Hashing · Fuzzy Hashing · Mounting · Timeline · Artifacts · Data Recovery · Memory · Malware · Passwords · Network · Office & Docs · Multimedia · Reporting · Steganography · OSINT · AI & Vision · Mobile · Cloud · Virtual & Crypto · NFC · Secure Delete · Diff Tools · Tunnels & Remote · System Tools

---

## Acknowledgements

- **[Tsurugi Linux](https://tsurugi-linux.org/)** — the DFIR-focused Linux distribution that is the source of all tool data
- Built for the DFIR community as a quick-reference companion to the Tsurugi LAB environment

---

## License

This reference tool is an independent community project. All tool names, descriptions, and usage scenarios are sourced from the Tsurugi Linux project documentation. Tsurugi Linux is developed by its respective authors. See [TSURUGI](https://tsurugi-linux.org/) for licensing details.
