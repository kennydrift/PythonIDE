/* ====================================================
   FILE SYSTEM
   ==================================================== */

let fs = {
  type: "folder",
  children: {
    "src": {
      type: "folder",
      open: true,
      children: {
        "main.py": {
          type: "file",
          content: `import time\nprint("starting")\ntime.sleep(2)\nprint("startup complete")`
        },
        "add.py": {
          type: "file",
          content: `def add(a, b):\n    return a + b\n\nprint(add(2, 3))`
        }
      }
    }
  }
};

let currentFilePath = "src/main.py";

function getNode(path) {
  if (!path) return fs;
  let node = fs;
  for (const p of path.split("/")) {
    if (!node.children || !node.children[p]) return null;
    node = node.children[p];
  }
  return node;
}

function getParentAndKey(path) {
  const parts = path.split("/");
  const key = parts.pop();
  const parentPath = parts.join("/");
  return { parent: getNode(parentPath || ""), key, parentPath };
}

function getAllFilePaths(node = fs, base = "", out = []) {
  if (node.type === "file") { out.push(base); return out; }
  for (const name in node.children || {}) {
    getAllFilePaths(node.children[name], base ? base + "/" + name : name, out);
  }
  return out;
}

/* ====================================================
   TREE RENDERING
   ==================================================== */

function renderTree() {
  const tree = document.getElementById("fileTree");
  tree.innerHTML = "";
  renderChildren(fs, "", tree);
  tree.oncontextmenu = e => {
    if (e.target === tree) { e.preventDefault(); e.stopPropagation(); showContextMenu(e.clientX, e.clientY, null, null); }
  };
}

function renderChildren(node, path, container) {
  if (!node.children) return;
  const entries = Object.entries(node.children);
  entries.sort(([an, a], [bn, b]) => {
    if (a.type === b.type) return an.localeCompare(bn);
    return a.type === "folder" ? -1 : 1;
  });
  for (const [name, child] of entries) {
    const childPath = path ? path + "/" + name : name;
    if (child.type === "folder") {
      renderFolderItem(name, child, childPath, container);
    } else {
      renderFileItem(name, child, childPath, container);
    }
  }
}

function renderFolderItem(name, child, childPath, container) {
  const row = document.createElement("div");
  row.className = "folder";
  row.dataset.path = childPath;

  const chevron = document.createElement("span");
  chevron.style.cssText = "font-size:10px;width:10px;flex-shrink:0;";
  chevron.textContent = child.open === false ? "▸" : "▾";

  const icon = document.createElement("span");
  icon.textContent = child.open === false ? "📁" : "📂";

  const label = document.createElement("span");
  label.textContent = name;
  label.style.overflow = "hidden";
  label.style.textOverflow = "ellipsis";

  row.append(chevron, icon, label);

  row.onclick = () => {
    child.open = child.open === false ? true : false;
    renderTree();
  };

  row.oncontextmenu = e => { e.preventDefault(); e.stopPropagation(); showContextMenu(e.clientX, e.clientY, "folder", childPath); };

  row.draggable = true;
  row.ondragstart = e => { e.dataTransfer.setData("dragPath", childPath); e.dataTransfer.setData("dragType", "folder"); };
  row.ondragover = e => e.preventDefault();
  row.ondrop = e => {
    e.preventDefault();
    const dp = e.dataTransfer.getData("dragPath");
    if (!dp || dp === childPath || childPath.startsWith(dp + "/")) return;
    moveNode(dp, childPath);
  };

  container.appendChild(row);

  const childrenDiv = document.createElement("div");
  childrenDiv.className = "folder-children";
  childrenDiv.style.display = child.open === false ? "none" : "block";
  container.appendChild(childrenDiv);

  renderChildren(child, childPath, childrenDiv);
}

function renderFileItem(name, child, childPath, container) {
  const fileDiv = document.createElement("div");
  fileDiv.className = "file" + (childPath === currentFilePath ? " active" : "");
  fileDiv.textContent = name;
  fileDiv.dataset.path = childPath;
  fileDiv.draggable = true;
  fileDiv.onclick = () => openFile(childPath);
  fileDiv.oncontextmenu = e => { e.preventDefault(); e.stopPropagation(); showContextMenu(e.clientX, e.clientY, "file", childPath); };
  fileDiv.ondragstart = e => { e.dataTransfer.setData("dragPath", childPath); e.dataTransfer.setData("dragType", "file"); };
  container.appendChild(fileDiv);
}

/* ====================================================
   TABS
   ==================================================== */

let openTabs = [];

function ensureTabOpen(path) {
  if (!openTabs.includes(path)) openTabs.push(path);
}

function closeTab(path) {
  const idx = openTabs.indexOf(path);
  if (idx === -1) return;
  openTabs.splice(idx, 1);

  if (currentFilePath === path) {
    const next = openTabs[idx] || openTabs[idx - 1] || null;
    currentFilePath = next;
    if (next) {
      const node = getNode(next);
      if (node) editor.setValue(node.content || "");
    } else {
      editor.setValue("");
    }
    updateRunBtn();
    renderTree();
  }
  renderTabs();
}

function renderTabs() {
  const tabsEl = document.getElementById("tabs");
  tabsEl.innerHTML = "";
  openTabs.forEach(path => {
    const node = getNode(path);
    if (!node || node.type !== "file") return;

    const tab = document.createElement("div");
    tab.className = "tab" + (path === currentFilePath ? " active" : "");
    tab.title = path;

    const name = document.createElement("span");
    name.className = "tab-name";
    name.textContent = path.split("/").pop();

    const closeBtn = document.createElement("button");
    closeBtn.className = "tab-close";
    closeBtn.textContent = "×";
    closeBtn.title = "Close";
    closeBtn.onclick = e => { e.stopPropagation(); closeTab(path); };

    tab.append(name, closeBtn);
    tab.onclick = () => openFile(path);
    tabsEl.appendChild(tab);
  });
}

/* ====================================================
   FILE / FOLDER CRUD
   ==================================================== */

function openFile(path) {
  const node = getNode(path);
  if (!node || node.type !== "file") return;
  if (currentFilePath && currentFilePath !== path) {
    const cur = getNode(currentFilePath);
    if (cur && cur.type === "file") cur.content = editor.getValue();
  }
  currentFilePath = path;
  ensureTabOpen(path);
  editor.setValue(node.content || "");
  editor.clearHistory();
  updateRunBtn();
  renderTree();
  renderTabs();
}

function updateRunBtn() {
  const btn = document.getElementById("runBtn");
  const isPy = currentFilePath && currentFilePath.endsWith(".py");
  if (pyodideReady && !isRunning && isPy) {
    btn.disabled = false;
  } else {
    btn.disabled = true;
  }
}

function addFile(folderPath) {
  const name = prompt("New file name (e.g. utils.py):");
  if (!name || !name.trim()) return;
  const parent = getNode(folderPath || "");
  if (!parent || parent.type !== "folder") return;
  if (!parent.children) parent.children = {};
  if (parent.children[name]) { alert("Already exists."); return; }
  parent.children[name] = { type: "file", content: "" };
  const newPath = folderPath ? folderPath + "/" + name : name;
  currentFilePath = newPath;
  openFile(newPath);
}

function addFolder(folderPath) {
  const name = prompt("New folder name:");
  if (!name || !name.trim()) return;
  const parent = getNode(folderPath || "");
  if (!parent || parent.type !== "folder") return;
  if (!parent.children) parent.children = {};
  if (parent.children[name]) { alert("Already exists."); return; }
  parent.children[name] = { type: "folder", open: true, children: {} };
  renderTree();
}

function renameNode(path) {
  const { parent, key, parentPath } = getParentAndKey(path);
  if (!parent || !parent.children || !parent.children[key]) return;
  const node = parent.children[key];
  const newName = prompt("Rename to:", key);
  if (!newName || !newName.trim() || newName === key) return;
  if (parent.children[newName]) { alert("Name already exists."); return; }
  parent.children[newName] = node;
  delete parent.children[key];
  const oldPrefix = path + "/";
  const newPath = parentPath ? parentPath + "/" + newName : newName;
  const newPrefix = newPath + "/";
  if (node.type === "folder") {
    if (currentFilePath === path || currentFilePath.startsWith(oldPrefix))
      currentFilePath = newPrefix + currentFilePath.slice(oldPrefix.length);
  } else {
    if (currentFilePath === path) currentFilePath = newPath;
  }
  renderTree(); renderTabs();
  if (currentFilePath) openFile(currentFilePath);
}

function deleteNode(path) {
  const { parent, key } = getParentAndKey(path);
  if (!parent || !parent.children || !parent.children[key]) return;
  const node = parent.children[key];
  if (!confirm(`Delete "${key}"${node.type === "folder" ? " and all its contents" : ""}?`)) return;
  delete parent.children[key];
  const oldPrefix = path + "/";
  if (currentFilePath === path || (node.type === "folder" && currentFilePath.startsWith(oldPrefix))) {
    const files = getAllFilePaths();
    currentFilePath = files[0] || null;
    if (currentFilePath) openFile(currentFilePath);
    else { editor.setValue(""); updateRunBtn(); renderTree(); renderTabs(); }
  } else {
    renderTree(); renderTabs();
  }
}

function moveNode(path, targetFolderPath) {
  const { parent, key, parentPath } = getParentAndKey(path);
  if (!parent || !parent.children || !parent.children[key]) return;
  const node = parent.children[key];
  const targetFolder = getNode(targetFolderPath || "");
  if (!targetFolder || targetFolder.type !== "folder") return;
  if (!targetFolder.children) targetFolder.children = {};
  if (targetFolder.children[key]) { alert("Target already has an item with that name."); return; }
  delete parent.children[key];
  targetFolder.children[key] = node;
  const oldPrefix = path + "/";
  const newPath = targetFolderPath ? targetFolderPath + "/" + key : key;
  const newPrefix = newPath + "/";
  if (node.type === "folder") {
    if (currentFilePath === path || currentFilePath.startsWith(oldPrefix))
      currentFilePath = newPrefix + currentFilePath.slice(oldPrefix.length);
  } else {
    if (currentFilePath === path) currentFilePath = newPath;
  }
  renderTree(); renderTabs();
  if (currentFilePath) openFile(currentFilePath);
}

/* ====================================================
   CONTEXT MENU
   ==================================================== */

const ctxMenu = document.getElementById("contextMenu");

function showContextMenu(x, y, type, path) {
  ctxMenu.innerHTML = "";
  const add = (label, fn) => {
    const d = document.createElement("div");
    d.className = "context-item";
    d.textContent = label;
    d.onclick = e => { e.stopPropagation(); hideCtx(); fn(); };
    ctxMenu.appendChild(d);
  };
  const sep = () => { const d = document.createElement("div"); d.className = "context-separator"; ctxMenu.appendChild(d); };

  if (type === "file") {
    add("Rename", () => renameNode(path));
    add("Delete", () => deleteNode(path));
    sep();
    add("Move to folder…", () => {
      const fp = prompt("Destination folder path (blank = root):", "");
      if (fp === null) return;
      const target = getNode(fp || "");
      if (!target || target.type !== "folder") { alert("Folder not found."); return; }
      moveNode(path, fp || "");
    });
  } else if (type === "folder") {
    add("New File", () => addFile(path));
    add("New Folder", () => addFolder(path));
    sep();
    add("Rename", () => renameNode(path));
    add("Delete", () => deleteNode(path));
  } else {
    add("New File", () => addFile(""));
    add("New Folder", () => addFolder(""));
  }

  ctxMenu.style.left = x + "px";
  ctxMenu.style.top = y + "px";
  ctxMenu.style.display = "block";
  const r = ctxMenu.getBoundingClientRect();
  if (r.right > window.innerWidth) ctxMenu.style.left = (x - r.width) + "px";
  if (r.bottom > window.innerHeight) ctxMenu.style.top = (y - r.height) + "px";

  setTimeout(() => document.addEventListener("click", hideCtx, { once: true }), 0);
}

function hideCtx() { ctxMenu.style.display = "none"; }
document.addEventListener("contextmenu", e => { if (!e.target.closest("#contextMenu")) hideCtx(); });

/* ====================================================
   EDITOR
   ==================================================== */

const editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
  mode: "python",
  lineNumbers: true,
  matchBrackets: true,
  autoCloseBrackets: true,
  theme: "dracula",
  indentUnit: 4,
  tabSize: 4,
  indentWithTabs: false,
  lineWrapping: false,
  extraKeys: {
    "Tab": cm => cm.execCommand("indentMore"),
    "Shift-Tab": cm => cm.execCommand("indentLess"),
    "Ctrl-Enter": () => runCode(),
    "Cmd-Enter": () => runCode()
  }
});

/* ====================================================
   THEME SWITCHER
   ==================================================== */

document.getElementById("extensionsBtn").onclick = e => {
  e.stopPropagation();
  const p = document.getElementById("extensionsPanel");
  p.style.display = p.style.display === "block" ? "none" : "block";
};

document.addEventListener("click", e => {
  if (!e.target.closest("#extensionsPanel") && !e.target.closest("#extensionsBtn"))
    document.getElementById("extensionsPanel").style.display = "none";
});

document.querySelectorAll(".theme-option").forEach(opt => {
  opt.onclick = () => {
    editor.setOption("theme", opt.dataset.theme);
    document.querySelectorAll(".theme-option").forEach(o => o.classList.remove("selected"));
    opt.classList.add("selected");
  };
});

/* ====================================================
   PYODIDE — WEB WORKER
   ==================================================== */

let pyodideReady = false;
let isRunning = false;
let pyWorker = null;

const workerCode = `
importScripts("https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js");

let pyodide = null;

async function init() {
  pyodide = await loadPyodide();
  self.postMessage({ type: "ready" });
}

init();

self.onmessage = async function(e) {
  if (e.data.type !== "run") return;

  const { code, files } = e.data;

  for (const [path, content] of Object.entries(files)) {
    const parts = path.split("/");
    let dir = "";
    for (let i = 0; i < parts.length - 1; i++) {
      dir = dir ? dir + "/" + parts[i] : parts[i];
      try { pyodide.FS.mkdir(dir); } catch(ex) {}
    }
    pyodide.FS.writeFile(path, content);
  }

  pyodide.globals.set("_post_stdout", (text) => self.postMessage({ type: "stdout", text }));
  pyodide.globals.set("_post_stderr", (text) => self.postMessage({ type: "stderr", text }));

  pyodide.runPython(\`
import sys

class _StreamingStream:
    def __init__(self, cb):
        self._cb = cb
    def write(self, text):
        if text:
            self._cb(text)
    def flush(self):
        pass
    def isatty(self):
        return False

sys.stdout = _StreamingStream(_post_stdout)
sys.stderr = _StreamingStream(_post_stderr)
\`);

  let error = null;
  try {
    await pyodide.runPythonAsync(code);
  } catch (err) {
    error = err.toString();
  }

  self.postMessage({ type: "done", error });
};
`;

function createWorker() {
  const blob = new Blob([workerCode], { type: "application/javascript" });
  const url = URL.createObjectURL(blob);
  pyWorker = new Worker(url);

  pyWorker.onmessage = e => {
    const msg = e.data;
    if (msg.type === "ready") {
      pyodideReady = true;
      isRunning = false;
      setStatus("ready", "Python ready");
      updateRunBtn();
    } else if (msg.type === "stdout") {
      appendOutput(msg.text, false);
      document.getElementById("output").scrollTop = document.getElementById("output").scrollHeight;
    } else if (msg.type === "stderr") {
      appendOutput(msg.text, true);
      document.getElementById("output").scrollTop = document.getElementById("output").scrollHeight;
    } else if (msg.type === "done") {
      if (msg.error) appendOutput(msg.error, true);
      isRunning = false;
      updateRunBtn();
      document.getElementById("stopBtn").style.display = "none";
      setStatus("ready", "Python ready");
      document.getElementById("output").scrollTop = document.getElementById("output").scrollHeight;
    }
  };

  pyWorker.onerror = err => {
    isRunning = false;
    setStatus("error", "Worker error");
    updateRunBtn();
    document.getElementById("stopBtn").style.display = "none";
    appendOutput("Worker error: " + err.message, true);
  };
}

function setStatus(state, label) {
  const dot = document.getElementById("statusDot");
  const lbl = document.getElementById("statusLabel");
  dot.className = "status-dot " + state;
  lbl.textContent = label;
}

function appendOutput(text, isError) {
  if (!text) return;
  const out = document.getElementById("output");
  const span = document.createElement("span");
  span.className = isError ? "output-error" : "";
  span.textContent = text;
  out.appendChild(span);
}

function collectFiles() {
  const paths = getAllFilePaths();
  const files = {};
  for (const p of paths) {
    const node = getNode(p);
    if (node && node.type === "file") files[p] = node.content || "";
  }
  return files;
}

function runCode() {
  if (!pyodideReady || isRunning) return;
  if (!currentFilePath || !currentFilePath.endsWith(".py")) return;

  const node = getNode(currentFilePath);
  if (!node || node.type !== "file") return;
  node.content = editor.getValue();

  document.getElementById("output").innerHTML = "";
  isRunning = true;
  updateRunBtn();
  document.getElementById("stopBtn").style.display = "inline-block";
  setStatus("running", "Running…");

  const files = collectFiles();

  if (!pyWorker) {
    createWorker();
    const origOnMsg = pyWorker.onmessage;
    pyWorker.onmessage = e => {
      if (e.data.type === "ready") {
        pyodideReady = true;
        pyWorker.onmessage = origOnMsg;
        pyWorker.postMessage({ type: "run", code: node.content, files });
      } else {
        origOnMsg(e);
      }
    };
    return;
  }

  pyWorker.postMessage({ type: "run", code: node.content, files });
}

document.getElementById("runBtn").onclick = runCode;

document.getElementById("stopBtn").onclick = () => {
  if (!isRunning) return;
  if (pyWorker) { pyWorker.terminate(); pyWorker = null; }
  pyodideReady = false;
  isRunning = false;
  setStatus("loading", "Reloading Python…");
  updateRunBtn();
  document.getElementById("stopBtn").style.display = "none";
  appendOutput("\n[Execution stopped]\n", true);
  createWorker();
};

function clearOutput() {
  document.getElementById("output").innerHTML = "";
}

document.getElementById("clearBtn2").onclick = clearOutput;

/* ====================================================
   RESIZE HANDLES
   ==================================================== */

let isVertical = false;
let activeResize = null;
let resizeStartPos = 0;
let resizeStartSize = 0;

const sidebarEl = document.getElementById("sidebar");
const sidebarResizeEl = document.getElementById("sidebarResize");
const resizeHandleEl = document.getElementById("resizeHandle");
const terminalEl = document.getElementById("terminal");

sidebarResizeEl.addEventListener("mousedown", e => {
  activeResize = "sidebar";
  resizeStartPos = e.clientX;
  resizeStartSize = sidebarEl.offsetWidth;
  sidebarResizeEl.classList.add("dragging");
  document.body.style.userSelect = "none";
  e.preventDefault();
});

resizeHandleEl.addEventListener("mousedown", e => {
  activeResize = "terminal";
  resizeStartPos = isVertical ? e.clientX : e.clientY;
  resizeStartSize = isVertical ? terminalEl.offsetWidth : terminalEl.offsetHeight;
  resizeHandleEl.classList.add("dragging");
  document.body.style.userSelect = "none";
  e.preventDefault();
  e.stopPropagation();
});

document.addEventListener("mousemove", e => {
  if (!activeResize) return;
  if (activeResize === "sidebar") {
    const delta = e.clientX - resizeStartPos;
    const newW = Math.max(120, Math.min(600, resizeStartSize + delta));
    sidebarEl.style.width = newW + "px";
  } else if (activeResize === "terminal") {
    if (isVertical) {
      const delta = resizeStartPos - e.clientX;
      const newW = Math.max(120, Math.min(900, resizeStartSize + delta));
      terminalEl.style.width = newW + "px";
    } else {
      const delta = resizeStartPos - e.clientY;
      const newH = Math.max(60, Math.min(600, resizeStartSize + delta));
      terminalEl.style.height = newH + "px";
    }
  }
});

document.addEventListener("mouseup", () => {
  if (!activeResize) return;
  sidebarResizeEl.classList.remove("dragging");
  resizeHandleEl.classList.remove("dragging");
  document.body.style.userSelect = "";
  activeResize = null;
});

function setVerticalLayout(vertical) {
  isVertical = vertical;
  const editorArea = document.getElementById("editorArea");
  if (vertical) {
    editorArea.classList.add("vertical");
    terminalEl.style.height = "auto";
    terminalEl.style.width = terminalEl.style.width || "320px";
  } else {
    editorArea.classList.remove("vertical");
    terminalEl.style.width = "";
    terminalEl.style.height = terminalEl.style.height || "200px";
  }
  setTimeout(() => editor.refresh(), 10);
}

/* ====================================================
   KEYBOARD SHORTCUTS
   ==================================================== */

document.addEventListener("keydown", e => {
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
    e.preventDefault();
    runCode();
  }
});

/* ====================================================
   TITLEBAR MENUS
   ==================================================== */

let activeMenuEl = null;

function showDropdown(anchorEl, items) {
  closeDropdown();

  const menu = document.createElement("div");
  menu.id = "titleDropdown";
  menu.style.cssText = `
    position:fixed; background:#252526; border:1px solid #454545;
    border-radius:4px; box-shadow:0 4px 16px rgba(0,0,0,0.5);
    z-index:200; min-width:180px; padding:3px 0; font-size:13px; color:#d4d4d4;
  `;

  items.forEach(item => {
    if (item === "---") {
      const sep = document.createElement("div");
      sep.style.cssText = "height:1px;background:#3c3c3c;margin:3px 0;";
      menu.appendChild(sep);
    } else {
      const d = document.createElement("div");
      d.style.cssText = "padding:6px 16px;cursor:pointer;display:flex;align-items:center;";
      d.innerHTML = `<span>${item.label}</span>${item.shortcut ? `<span style="margin-left:auto;padding-left:24px;color:#666;font-size:11px;">${item.shortcut}</span>` : ''}`;
      d.onmouseenter = () => d.style.background = "#094771";
      d.onmouseleave = () => d.style.background = "";
      d.onclick = () => { closeDropdown(); item.fn && item.fn(); };
      menu.appendChild(d);
    }
  });

  const rect = anchorEl.getBoundingClientRect();
  menu.style.left = rect.left + "px";
  menu.style.top = rect.bottom + "px";
  document.body.appendChild(menu);
  activeMenuEl = menu;

  setTimeout(() => document.addEventListener("click", closeDropdown, { once: true }), 0);
}

function closeDropdown() {
  const m = document.getElementById("titleDropdown");
  if (m) m.remove();
  activeMenuEl = null;
}

// ---- FILE MENU ----
document.getElementById("menuFile").onclick = e => {
  e.stopPropagation();
  showDropdown(e.target, [
    { label: "Save File", shortcut: "Ctrl+S", fn: saveCurrentFile },
    { label: "Load File…", fn: loadFile },
    "---",
    { label: "New File", fn: () => addFile("") },
    { label: "New Folder", fn: () => addFolder("") },
  ]);
};

function saveCurrentFile() {
  const node = currentFilePath ? getNode(currentFilePath) : null;
  if (!node || node.type !== "file") { alert("No file selected."); return; }
  node.content = editor.getValue();
  const blob = new Blob([node.content], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = currentFilePath.split("/").pop();
  a.click();
  URL.revokeObjectURL(a.href);
}

function loadFile() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".py,.txt,.js,.json,.md,.html,.css";
  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const content = ev.target.result;
      const name = file.name;
      const folderPath = currentFilePath ? currentFilePath.split("/").slice(0, -1).join("/") : "";
      const parent = getNode(folderPath || "");
      if (!parent || parent.type !== "folder") return;
      if (!parent.children) parent.children = {};
      let finalName = name;
      let i = 1;
      while (parent.children[finalName]) { finalName = name.replace(/(\.[^.]+)?$/, `_${i}$1`); i++; }
      parent.children[finalName] = { type: "file", content };
      const newPath = folderPath ? folderPath + "/" + finalName : finalName;
      currentFilePath = newPath;
      openFile(newPath);
    };
    reader.readAsText(file);
  };
  input.click();
}

document.addEventListener("keydown", e => {
  if ((e.ctrlKey || e.metaKey) && e.key === "s") { e.preventDefault(); saveCurrentFile(); }
});

// ---- EDIT MENU ----
document.getElementById("menuEdit").onclick = e => {
  e.stopPropagation();
  showDropdown(e.target, [
    { label: "Undo", shortcut: "Ctrl+Z", fn: () => editor.execCommand("undo") },
    { label: "Redo", shortcut: "Ctrl+Y", fn: () => editor.execCommand("redo") },
    "---",
    { label: "Cut", shortcut: "Ctrl+X", fn: () => { const s = editor.getSelection(); if (s) { navigator.clipboard.writeText(s); editor.replaceSelection(""); } } },
    { label: "Copy", shortcut: "Ctrl+C", fn: () => { const s = editor.getSelection(); if (s) navigator.clipboard.writeText(s); } },
    { label: "Paste", shortcut: "Ctrl+V", fn: () => navigator.clipboard.readText().then(t => editor.replaceSelection(t)) },
  ]);
};

// ---- VIEW MENU ----
document.getElementById("menuView").onclick = e => {
  e.stopPropagation();
  showDropdown(e.target, [
    { label: "Toggle Fullscreen", fn: () => {
      if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
      else document.exitFullscreen();
    }},
    { label: "Toggle Output Panel", fn: toggleTerminal },
    { label: isVertical ? "Horizontal Output Layout" : "Vertical Output Layout", fn: () => setVerticalLayout(!isVertical) },
  ]);
};

function toggleTerminal() {
  const t = terminalEl;
  const r = resizeHandleEl;
  const hidden = t.style.display === "none";
  t.style.display = hidden ? "flex" : "none";
  r.style.display = hidden ? "block" : "none";
}

// ---- TERMINAL MENU ----
document.getElementById("menuTerminal").onclick = e => {
  e.stopPropagation();
  showDropdown(e.target, [
    { label: "Toggle Output Panel", fn: toggleTerminal },
    { label: "Clear Output", fn: clearOutput },
    { label: "Run Current File", shortcut: "Ctrl+Enter", fn: runCode },
  ]);
};

// ---- HELP MENU ----
document.getElementById("menuHelp").onclick = e => {
  e.stopPropagation();
  showDropdown(e.target, [
    { label: "GitHub", fn: () => window.open("https://github.com/kennydrift/PythonIDE", "_blank") },
    { label: "Python guide", fn: () => window.open("https://wiki.python.org/moin/BeginnersGuide", "_blank") },
  ]);
};

/* ====================================================
   INIT
   ==================================================== */

createWorker();
renderTree();
ensureTabOpen(currentFilePath);
renderTabs();
openFile(currentFilePath);
