# EC-Tools 🛠️

A clean, crisp minimalist personal developer portal and resource navigator built with HTML5, CSS (Bootstrap 5 + custom design system), and JavaScript.

Designed to easily navigate your tools, access official documentation, and reference practical *"How to Use in Future Projects"* notes.

---

## 🚀 Features

- **Categorized Directory**:
  - 💻 **Tech Stacks**: HTML5, CSS3, JavaScript (ES6+), React, Python, Node.js
  - ⚡ **Frameworks**: Bootstrap 5, Tailwind CSS
  - 🗄️ **Database**: MySQL, Supabase
  - ☁️ **Deployment Tools**: Render, Vercel
  - 🐙 **Version Control**: GitHub
  - 🧠 **Open Source Skills**: Superpowers, Ponytail, Wayfinder, Taste, Claude Skills, Graphify
  - 📦 **Open Source Tools**: Redis, Brevo
  - 🌐 **Online Platforms**: React Bits, Figma, Untitled UI
- **Dedicated README Manuals Per Tool**: Clicking any tool card navigates to `manuals/<tool-id>.html`—a dedicated README-style user manual explaining what the tool/skill is, how it helps with projects, and how to use it right away.
- **Practical Notes Per Tool**: Dedicated *"💡 How to Use in Future Projects"* block with cheat-sheet tips, recommended setups, and architectural guidance.
- **Real-Time Live Search**: Instant filtering across tool names, categories, descriptions, tags, and how-to notes (shortcut: press `/`).
- **Dynamic Tag Cloud**: Quick one-click tag filtering (e.g. `#frontend`, `#ai-skills`, `#database`).
- **Copy Documentation Link**: One-click URL copy button on every card with toast feedback.
- **Read-Only & Tamper-Proof**: Safe for public deployment on **GitHub Pages** — visitors cannot edit, delete, or alter your workflow page.
- **Zero-Dependency & Offline Ready**: Works directly by double-clicking `index.html` (via `data/tools.js`) or when hosted statically.

---

## 🌐 Deploy to GitHub Pages

1. Push your repository to GitHub:

   ```bash
   git add .
   git commit -m "Deploy EC-Tools to GitHub Pages"
   git push origin main
   ```

2. In your GitHub repository:
   - Go to **Settings** > **Pages** (under "Code and automation").
   - Under **Build and deployment** > **Source**, choose **Deploy from a branch**.
   - Select **Branch**: `main`, Folder: `/ (root)`.
   - Click **Save**.
3. Your site will be live at `https://<your-username>.github.io/EC-Tools/` in under a minute!

---

## ✏️ How to Add or Update Tools (For the Author)

Since the site is cleanly decoupled from client-side tampering, you manage your tools safely directly through Git:

1. Open [`data/tools.json`](data/tools.json) (and [`data/tools.js`](data/tools.js)).
2. Add your new tool entry:

   ```json
   {
     "id": "tool-id",
     "name": "Tool Name",
     "category": "Tech Stacks",
     "url": "https://example.com/docs",
     "description": "Short summary of what it does.",
     "howToUse": "Your practical tips and cheat-sheet commands.",
     "tags": ["frontend", "tool"]
   }
   ```

3. Commit and push: GitHub Pages updates your live site automatically!

---

## 📂 Project Structure

```text
EC-Tools/
├── index.html            # Main semantic dashboard with responsive sidebar & cards
├── css/
│   └── styles.css        # Crisp minimalist documentation styling & custom tokens
├── js/
│   └── app.js            # Controller for search, category/tag filtering & link copy
├── data/
│   ├── tools.json        # Clean JSON dataset of tools and documentation links
│   └── tools.js          # Direct-load dataset for zero-CORS local & static execution
├── manuals/
│   └── *.html            # 24 dedicated README-style user manual pages per tool
└── test/
    ├── tools.test.js     # Schema, required tools, and HTML/CSS validation tests
    └── logic.test.js     # Search, filter, and state manipulation unit tests
```

---

## 🧪 Running Automated Tests

Run the built-in test suites using Node.js:

```bash
node --test test/*.test.js
```
