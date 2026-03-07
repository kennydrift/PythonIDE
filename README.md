# Browser Python IDE

<p align="center">
  
![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python&logoColor=white)
![Pyodide](https://img.shields.io/badge/Pyodide-0.23.4-purple)
![WebAssembly](https://img.shields.io/badge/WebAssembly-WASM-orange?logo=webassembly)
![Editor](https://img.shields.io/badge/Editor-CodeMirror-green)
![Runs In](https://img.shields.io/badge/Runs%20In-Browser-black)
![License](https://img.shields.io/badge/License-MIT-lightgrey)

[Python](https://www.python.org/) IDE running natively in the browser using [Pyodide](https://pyodide.org/en/stable/) and [CodeMirror](https://codemirror.net/)

---

# Overview

This project is a [Python](https://www.python.org/downloads/release/python-3110/) IDE which runs in your brower using [Pyodide](https://pyodide.org/en/stable/usage/packages-in-pyodide.html) and [CodeMirror](https://codemirror.net/), allowing you to:

- Write and execute Python code
- Manage files and folders
- View real-time output in a built-in terminal  

---

# Apps

| App | Version | use |
|------------|--------|------|
| [Python](https://www.python.org/downloads/release/python-3110/) | 3.11 | Runtime |
| [Pyodide](https://pyodide.org/en/stable/usage/packages-in-pyodide.html) | 0.23.4 | Runs Python in WebAssembly |
| [CodeMirror](https://codemirror.net/) | 5.65.13 | Code editor |

---

# Features

| Feature | Description |
|---------|------------|
| Python Runtime | Executes Python 3.11 code |
| File Explorer | Manage folders and files|
| Syntax Highlighting | Highleted Syntax |
| Terminal | Streams output |
| File Saving | Download files to your device |
| File Loading | Import files from your device |
| Theme Support | Switch between 10 themes |

---

# Editor Themes

| Theme | Description |
|-------|------------|
| Dracula | Dark purple |
| Monokai | Classic dark |
| Material | Material-inspired dark |
| Nord | Arctic color palette |
| Solarized Dark | Low contrast dark |
| Ayu Dark | Minimal dark |
| Gruvbox Dark | Retro dark |
| Tomorrow Night | Balanced dark |
| Oceanic Next | Blue-toned dark |
| One Dark | I dont know |

---

# Limitations

> [IMPORTANT] Some Python functionality is restricted due to the browser environment:

1. Interactive Input: `input()` is not supported
2. No Internet Access: Network libraries like `requests` and `urllib` cannot be used
3. No Package Installation: `micropip` is disabled; PyPI packages cannot be installed
4. No System-Level Access* Modules like `subprocess` or `os.system` are unavailable
5. No Threading: `threading` and `multiprocessing` do not work

---

# Browser Compatibility

| Browser | Minimum Version |
|---------|----------------|
| Chrome | 89+ |
| Firefox | 89+ |
| Edge | 89+ |
| Safari | 15+ |

Requirements: WebAssembly support and Web Workers.

---

# Notes

- The IDE mimics VS Code with tabs, a file tree, and themes.  
- Real-time terminal output is supported via a custom Pyodide streaming setup.  
- All project files exist in browser memory; save them to your device to keep your work.
- Made by me, some parts by ChatGPT, Copilot, and Claude

---

# License

MIT License — feel free to fork or contribute on GitHub.
