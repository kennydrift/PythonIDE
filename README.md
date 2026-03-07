# Browser Python IDE

<p align="center">
  
![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python&logoColor=white)
![Pyodide](https://img.shields.io/badge/Pyodide-0.23.4-purple)
![WebAssembly](https://img.shields.io/badge/WebAssembly-WASM-orange?logo=webassembly)
![Editor](https://img.shields.io/badge/Editor-CodeMirror-green)
![Runs In](https://img.shields.io/badge/Runs%20In-Browser-black)
![License](https://img.shields.io/badge/License-MIT-lightgrey)

[Python](https://www.python.org/) IDE running natively in the browser using [Pyodide](https://pyodide.org/en/stable/) and [CodeMirror](https://codemirror.net/)



# Overview

This project is a [Python](https://www.python.org/downloads/release/python-3110/) IDE which runs in your brower using [Pyodide](https://pyodide.org/en/stable/usage/packages-in-pyodide.html) and [CodeMirror](https://codemirror.net/), allowing you to:

- Write and execute Python code
- Manage files and folders
- View real-time output in a built-in terminal  



## Features

| Feature | Description |
|---------|------------|
| [Python 3.11](https://www.python.org/downloads/release/python-3110/) | Runtime |
| [Pyodide 0.23.4](https://pyodide.org/en/stable/usage/packages-in-pyodide.html) | Runs Python in WebAssembly |
| [CodeMirror 5.65.13](https://codemirror.net/) | Code editor |
| Python Runtime | Executes Python 3.11 code |
| File Explorer | Manage folders and files|
| Syntax Highlighting | Highleted Syntax |
| Terminal | Streams output |
| File Saving | Download files to your device |
| File Loading | Import files from your device |
| Theme Support | Switch between 10 themes |

> [!IMPORTANT]
> ### Some Python functionality is restricted due to the browser environment
> 1. Interactive Input: `input()` is not supported
> 2. No Internet Access: Network libraries like `requests` and `urllib` cannot be used
> 3. No Package Installation: `micropip` is disabled; PyPI packages cannot be installed
> 4. No System-Level Access* Modules like `subprocess` or `os.system` are unavailable
> 5. No Threading: `threading` and `multiprocessing` do not work


## Editor Themes

| Theme | Description |
|---------|------------|
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


## Browser Compatibility

| Browser | Minimum Version |
|---------|----------------|
| Chrome | 89+ |
| Firefox | 89+ |
| Edge | 89+ |
| Safari | 15+ |

> [!WARNING]
> Browsers require WebAssembly support and Web Workers for this project to work



> [!NOTE]
> 1. Interactive Input: `input()` is not supported
> 2. No Internet Access: Network libraries like `requests` and `urllib` cannot be used
> 3. No Package Installation: `micropip` is disabled; PyPI packages cannot be installed
> 4. No System-Level Access* Modules like `subprocess` or `os.system` are unavailable
> 5. No Threading: `threading` and `multiprocessing` do not work



# License

MIT License

