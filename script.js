const searchInput = document.querySelector("#searchInput");
const searchBtn = document.querySelector("#searchBtn");
const engineSelect = document.querySelector("#engineSelect");
const scanOverlay = document.querySelector("#scanOverlay");
const timeSpan = document.querySelector("#time");

const todoList = document.querySelector("#todoList");
const todoForm = document.querySelector("#todoForm");
const todoTitle = document.querySelector("#todoTitle");
const todoUrl = document.querySelector("#todoUrl");
const linksList = document.querySelector("#linksList");

let todos = [];
let draggingIndex = null;

/* ---------- clock ---------- */

function tickClock() {
    const now = new Date();
    const pad = (n) => n.toString().padStart(2, "0");
    const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
        now.getDate()
    )} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(
        now.getSeconds()
    )}`;
    timeSpan.textContent = stamp;
}
tickClock();
setInterval(tickClock, 1000);

/* ---------- search + fake scan ---------- */

function openSearchWithScan() {
    const q = searchInput.value.trim();
    if (!q) return;

    const base = engineSelect.value;
    const url = `${base}${encodeURIComponent(q)}`;

    scanOverlay.classList.remove("hidden");

    setTimeout(() => {
        window.location.href = url;
    }, 700);
}

searchBtn.addEventListener("click", openSearchWithScan);
searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        openSearchWithScan();
    }
});

/* ---------- TODO: localStorage helpers (website version) ---------- */

const STORAGE_KEY = "hackerTodos";

function saveTodos() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function loadTodos() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        todos = raw ? JSON.parse(raw) : [];
    } catch {
        todos = [];
    }
    renderTodos();
}

/* ---------- TODO: render + drag/drop ---------- */

function renderTodos() {
    todoList.innerHTML = "";

    todos.forEach((todo, index) => {
        const li = document.createElement("li");
        li.className = "todo-item";
        li.draggable = true;
        li.dataset.index = index;

        const titleSpan = document.createElement("span");
        titleSpan.className = "todo-title";
        titleSpan.textContent = todo.title;
        li.appendChild(titleSpan);

        if (todo.url) {
            try {
                const url = new URL(todo.url);
                const a = document.createElement("a");
                a.className = "todo-link";
                a.href = todo.url;
                a.target = "_blank";
                a.rel = "noopener noreferrer";
                a.textContent = url.hostname;
                li.appendChild(a);
            } catch {
                // ignore invalid url
            }
        }

        const delBtn = document.createElement("button");
        delBtn.className = "todo-delete";
        delBtn.type = "button";
        delBtn.textContent = "×";
        delBtn.addEventListener("click", () => {
            todos.splice(index, 1);
            saveTodos();
            renderTodos();
        });
        li.appendChild(delBtn);

        addDragHandlers(li);
        todoList.appendChild(li);
    });
}

function addDragHandlers(li) {
    li.addEventListener("dragstart", () => {
        draggingIndex = Number(li.dataset.index);
        li.classList.add("dragging");
    });

    li.addEventListener("dragend", () => {
        draggingIndex = null;
        li.classList.remove("dragging");
    });

    li.addEventListener("dragover", (e) => {
        e.preventDefault();
        const targetIndex = Number(li.dataset.index);
        if (draggingIndex === null || draggingIndex === targetIndex) return;

        const dragged = todos[draggingIndex];
        todos.splice(draggingIndex, 1);
        todos.splice(targetIndex, 0, dragged);
        draggingIndex = targetIndex;
        saveTodos();
        renderTodos();
    });
}

/* ---------- TODO: form submit ---------- */

todoForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = todoTitle.value.trim();
    const url = todoUrl.value.trim();

    if (!title) return;

    todos.push({ title, url: url || null });
    saveTodos();
    renderTodos();

    todoTitle.value = "";
    todoUrl.value = "";
    todoTitle.focus();
});

/* ---------- Quick access default links ---------- */

const defaultLinks = [
    // Code & Q/A
    { label: "GitHub", url: "https://github.com" },
    { label: "Stack Overflow", url: "https://stackoverflow.com" },
    { label: "MDN Docs", url: "https://developer.mozilla.org" },
    { label: "DevDocs", url: "https://devdocs.io" },

    // Web / framework docs
    { label: "Laravel Docs", url: "https://laravel.com/docs" },
    { label: "Node.js Docs", url: "https://nodejs.org/en/docs" },
    { label: "Express Docs", url: "https://expressjs.com" },
    { label: "TypeScript Docs", url: "https://www.typescriptlang.org/docs" },
    { label: "MongoDB Docs", url: "https://www.mongodb.com/docs" },
    { label: "MySQL Docs", url: "https://dev.mysql.com/doc" },

    // AI assistants
    { label: "ChatGPT", url: "https://chat.openai.com" },
    { label: "Gemini", url: "https://gemini.google.com" },
    { label: "DeepSeek", url: "https://chat.deepseek.com" },

    // Learning / articles
    { label: "freeCodeCamp", url: "https://www.freecodecamp.org" },
    { label: "DEV Community", url: "https://dev.to" },

    // Practice / DSA
    { label: "LeetCode", url: "https://leetcode.com" },
    { label: "HackerRank", url: "https://www.hackerrank.com" }
];


function renderLinks() {
    linksList.innerHTML = "";
    defaultLinks.forEach((link) => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = link.url;
        a.textContent = link.label;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.className = "todo-link";
        li.appendChild(a);
        linksList.appendChild(li);
    });
}

/* init */

renderLinks();
loadTodos();
