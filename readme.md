# ARC — Architecture Relationship Compiler

ARC is a developer CLI tool that analyzes your codebase and visualizes how files are connected.
It helps you understand dependencies, explore unfamiliar projects, and reason about architecture quickly.

---

## 🚀 Why ARC?

When working with large codebases, understanding how files interact becomes difficult.

ARC solves this by:

- Automatically analyzing file dependencies
- Generating visual graphs of relationships
- Producing readable summaries of your architecture

Instead of manually tracing imports, ARC gives you a **clear structural overview instantly**.

---

## ⚙️ Installation

Install globally using npm:

```bash
npm install -g @me-mayank/arc
```

Or run directly without installing:

```bash
npx @me-mayank/arc . --backend
```

---

## 📌 Usage

Run ARC inside your project directory:

```bash
arc . --backend
```

---

## 🧠 Modes

### 🔹 Backend Mode (Stable)

Analyzes file-level dependencies and generates:

- Dependency graph
- Readable report
- Project structure
- Metadata

```bash
arc . --backend
```

---

### 🔹 Frontend Mode (Experimental)

Analyzes:

- Component relationships
- Basic routing structure

```bash
arc . --frontend
```

---

### 🔹 Full Mode

Runs both backend and frontend analysis:

```bash
arc . --full
```

---

## 📂 Output Files

After execution, ARC generates:

- **PNG Graph** → Visual dependency graph
- **DOT File** → Graph structure for customization
- **Text Report** → Readable dependency summary
- **Structure File** → Project folder structure
- **Metadata JSON** → Machine-readable analysis

---

## ⚠️ Graphviz Requirement

ARC uses Graphviz to generate PNG graphs.

If Graphviz is not installed:

- PNG generation will be skipped
- Other outputs will still work

Install Graphviz:

**macOS**

```bash
brew install graphviz
```

**Linux**

```bash
sudo apt install graphviz
```

**Windows**

```bash
winget install Graphviz.Graphviz
```

---

## 🧩 Example Workflow

```bash
cd your-project
arc . --backend
```

You will get:

- Visual graph of dependencies
- Text summary
- Project structure overview

---

## 🛠️ When to Use ARC

ARC is useful for:

- Exploring unfamiliar codebases
- Debugging dependency issues
- Understanding project architecture
- Onboarding into new projects

---

## ⚠️ Notes

- Backend analysis is stable and recommended
- Frontend analysis is experimental
- Large projects may produce dense graphs

---

## 👨‍💻 Author

**Mayank Tripathi**

GitHub: https://github.com/me-mayank

---

## ⭐ Support

If you find ARC useful, consider starring the repository and sharing it.

---
