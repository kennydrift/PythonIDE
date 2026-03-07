# Python IDE
browser Python IDE, inspired by VS Code
---

## What it is

The site runs a Python development environment in your browser using [Pyodide](https://pyodide.org), a port of CPython to WebAssembly. Includes syntax highlighting, a file explorer, tabbed editing, and a live output terminal, and file saving.

---

## What It Uses

[Pyodide](https://pyodide.org) v0.23.4 | Runs Python in the browser via WebAssembly 

Python 3.11 | The Python version bundled with Pyodide 0.23.4 

CodeMirror 5.65.13 | Code editor with syntax highlighting 

## What is Pyodide?
Pyodide is CPython compiled to [WebAssembly](https://webassembly.org/), which lets it run directly inside a browser tab. It supports most of the Python standard library and can install many PyPI packages at runtime via `micropip`.

---

## Capabilities

- Run (most of) Python 3.11 entirely in the browser

- Pyodide comes with some packages which can be found [here](https://pyodide.org/en/stable/usage/packages-in-pyodide.html)

- Built-in File explorer with nested folders, create, rename, delete, and drag-and-drop options (inspired by VS code)
  
- Syntax highlighting with multiple themes (Dracula, Monokai, Material, Nord, Solarized Dark, Ayu Dark, Gruvbox Dark, Tomorrow Night, Oceanic Next, One Dark)
  
- Saving/loading files to/from your computer

---

## Limitations (ps, a lot)

- interactive input like `input()` does not work since Pyodide has no real stdin,
- Theres no internet access so `requests`, `urllib`, sockets, etc. will not work.
- Files only exist in memory for the current session; closing or refreshing the tab loses all changes

- No package installation, this build does not include `micropip`, so third-party packages cannot be installed at runtime.

- No `subprocess` or `os.system`

- No threading, Python's `threading` module is not functional in Pyodide

- Startup time, Pyodide (~10MB WebAssembly binary) takes a few seconds to load on first run,

- Memory limits, very large data processing may hit browser memory limits

- Not all stdlib modules work, such as modules that rely on OS-level calls are unavailable or limited

---

## Browser Support

Works in any modern browser that supports WebAssembly and Web Workers,
Chrome 89+
Firefox 89+
Edge 89+
Safari 15+

---
