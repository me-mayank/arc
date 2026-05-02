# ARC — Architecture Relationship Compiler

ARC is a CLI tool that analyzes your codebase and visualizes how files are connected.

It helps you understand dependencies, explore unfamiliar projects, and reason about architecture quickly.

---

## 🚀 Quick Start

```bash id="1j1q5k"
npm install -g @me-mayank/arc
arc . --backend
```

Or run without installing:

```bash id="t6r3r0"
npx @me-mayank/arc . --backend
```

---

## 📌 What ARC Does

ARC analyzes your project and generates:

- Dependency graphs
- Readable summaries
- Project structure

Instead of manually tracing imports, ARC gives you a **clear architectural overview instantly**.

---

## 🧩 Supported Environments

ARC is currently designed for:

- JavaScript
- Node.js projects
- React (basic frontend support)

> ⚠️ Other languages are not supported yet.

---

## 🤖 Why ARC is Useful with AI

Modern AI tools require relevant code context to generate accurate results.

ARC helps by:

- Identifying only the relevant files and dependencies
- Reducing the amount of code you need to share with AI tools
- Improving the quality of AI-generated responses

Instead of passing large parts of a codebase, ARC lets you provide **focused, structured context**, making AI-assisted development more efficient.

---

## 📌 Usage

```bash id="z5z7wy"
arc <path> [mode]
```

Example:

```bash id="l9c7g2"
arc . --backend
```

---

## 🧠 Modes

### Backend Mode (Stable)

```bash id="r6r1nf"
arc . --backend
```

- File-level dependency analysis
- Graph generation
- Metadata output

---

### Frontend Mode (Experimental)

```bash id="6c7u3g"
arc . --frontend
```

- Component relationships
- Basic route analysis

> ⚠️ Frontend analysis is experimental and may produce incomplete results.

---

### Full Mode

```bash id="g3b2g4"
arc . --full
```

Runs both backend and frontend analysis.

---

## 📂 Output

ARC generates:

- **PNG Graph** — Visual dependency graph (requires Graphviz)
- **DOT File** — Graph structure
- **Text Report** — Readable dependency summary
- **Structure File** — Project directory structure
- **Metadata JSON** — Machine-readable analysis

---

## ⚠️ Graphviz Requirement

Graphviz is required to generate PNG graphs.

If not installed:

- PNG generation is skipped
- Other outputs still work

---

## 📦 Install Graphviz

**macOS**

```bash id="1dx0q4"
brew install graphviz
```

**Linux**

```bash id="o0k5x8"
sudo apt install graphviz
```

**Windows**

```bash id="7lb4tt"
winget install Graphviz.Graphviz
```

---

## 🔍 Verify Installation

```bash id="v6r9ht"
dot -V
```

---

## 🪟 Windows PATH Fix

If `dot` is not recognized after installing Graphviz:

1. Open **System Environment Variables**
2. Click **Environment Variables**
3. Under **System Variables**, select `Path`
4. Click **Edit**
5. Add:

```
C:\Program Files\Graphviz\bin
```

6. Restart your terminal

Then verify again:

```bash id="3p1g6g"
dot -V
```

---

## 🧩 Example Workflow

```bash id="1c3c3p"
cd your-project
arc . --backend
```

You will get:

- Dependency graph
- Text summary
- Project structure

---

## 📄 Documentation

👉 https://bit.ly/arc_docs

---

## 👨‍💻 Author

Mayank Tripathi
https://github.com/me-mayank

---

## ⭐ Support

If you find ARC useful, consider starring the repository.
