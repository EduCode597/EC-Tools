# EC-Tools 🛠️

A clean, crisp minimalist personal developer portal and resource navigator built with HTML5, CSS (Bootstrap 5 + custom design system), and JavaScript.

Designed to easily navigate tools, access official documentation, and view practical "How to Use in Future Projects" guides and cheat-sheet notes.

---

## 🚀 Features

- **Categorized Dashboard**:
  - 💻 **Tech Stacks**: HTML5, CSS3, JavaScript (ES6+), React, Python, Node.js
  - ⚡ **Frameworks**: Bootstrap 5, Tailwind CSS
  - 🗄️ **Database**: MySQL, Supabase
  - 🧠 **Open Source Skills**: Superpowers, Ponytail, Wayfinder, Taste, Claude Skills
  - 🌐 **Online Platforms**: React Bits, Figma, Untitled UI
- **Practical Notes Per Tool**: Dedicated *"💡 How to Use in Future Projects"* block with cheat-sheet tips, recommended setups, and architectural guidance.
- **Real-Time Live Search**: Instant filtering across tool names, categories, descriptions, tags, and how-to notes (shortcut: press `/`).
- **Interactive Tag Filters**: Dynamic tag cloud for quick cross-category filtering.
- **In-Browser Tool Manager**: Add or edit tools directly in the browser with full client-side persistence (`localStorage`).
- **Data Management (Export / Import)**: One-click export to `tools.json` to keep your Git repository up to date, plus JSON import and reset options.
- **Zero-Dependency & Offline Ready**: Works directly by double-clicking `index.html` (via `data/tools.js`) or via any local web server.

---

## 📂 Project Structure

```text
EC-Tools/
├── index.html            # Main semantic dashboard with responsive sidebar & modals
├── css/
│   └── styles.css        # Crisp minimalist documentation styling & custom tokens
├── js/
│   └── app.js            # Controller for search, filtering, modals & localStorage
├── data/
│   ├── tools.json        # Clean JSON dataset of tools and documentation links
│   └── tools.js          # Direct-load dataset for zero-CORS local file execution
└── test/
    ├── tools.test.js     # Schema, required tools, and HTML/CSS validation tests
    └── logic.test.js     # Search, filter, and state manipulation unit tests
```

---

## 🏃 Quick Start

### Option 1: Open Directly in Browser
Simply double-click `index.html` in your file explorer. It will load instantly without needing any server.

### Option 2: Run via Local HTTP Server
Using Python:
```bash
python -m http.server 8000
```
Then visit: `http://localhost:8000`

Using Node (e.g. `npx serve`):
```bash
npx serve .
```

---

## 🧪 Running Automated Tests

Run the built-in test suites using Node.js:
```bash
node --test test/*.test.js
```
