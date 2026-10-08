/* ==========================================================
   Academic Planner
   Demonstrates: arrays, functions, event handling,
   DOM manipulation and dynamic content updates.
   ========================================================== */

const STORAGE_KEY = "academic-planner-tasks";

// Array that holds every task object: { id, text, course, due, done }
let tasks = loadTasks();
let currentFilter = "all";

// DOM references
const form = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const courseSelect = document.getElementById("task-course");
const dateInput = document.getElementById("task-date");
const taskError = document.getElementById("task-error");
const taskList = document.getElementById("task-list");
const taskCount = document.getElementById("task-count");
const emptyState = document.getElementById("empty-state");
const filterButtons = document.querySelectorAll(".filter-btn");
const clearCompletedBtn = document.getElementById("clear-completed");

/* ---------- Storage helpers ---------- */

function loadTasks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    return [];
  }
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    // Storage unavailable: tasks still work for this visit
  }
}

/* ---------- Task operations ---------- */

function addTask(text, course, due) {
  const task = {
    id: Date.now(),
    text: text,
    course: course,
    due: due,
    done: false
  };
  tasks.push(task);
  saveTasks();
  renderTasks();
}

function toggleTask(id) {
  tasks = tasks.map(function (task) {
    return task.id === id ? { ...task, done: !task.done } : task;
  });
  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter(function (task) {
    return task.id !== id;
  });
  saveTasks();
  renderTasks();
}

function clearCompleted() {
  tasks = tasks.filter(function (task) {
    return !task.done;
  });
  saveTasks();
  renderTasks();
}

function getVisibleTasks() {
  if (currentFilter === "active") {
    return tasks.filter(function (task) { return !task.done; });
  }
  if (currentFilter === "completed") {
    return tasks.filter(function (task) { return task.done; });
  }
  return tasks;
}

function formatDate(isoDate) {
  if (!isoDate) return "No due date";
  const date = new Date(isoDate + "T00:00:00");
  return "Due " + date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

/* ---------- Rendering ---------- */

function createTaskElement(task) {
  const li = document.createElement("li");
  li.className = task.done ? "task task--done" : "task";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = task.done;
  checkbox.id = "task-" + task.id;
  checkbox.addEventListener("change", function () {
    toggleTask(task.id);
  });

  const body = document.createElement("div");
  body.className = "task__body";

  const label = document.createElement("label");
  label.className = "task__text";
  label.htmlFor = checkbox.id;
  label.textContent = task.text;

  const meta = document.createElement("span");
  meta.className = "task__meta";
  meta.textContent = task.course + ", " + formatDate(task.due);

  body.appendChild(label);
  body.appendChild(meta);

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className = "task__delete";
  deleteBtn.textContent = "Delete";
  deleteBtn.setAttribute("aria-label", "Delete task: " + task.text);
  deleteBtn.addEventListener("click", function () {
    deleteTask(task.id);
  });

  li.appendChild(checkbox);
  li.appendChild(body);
  li.appendChild(deleteBtn);
  return li;
}

function renderTasks() {
  taskList.innerHTML = "";

  const visible = getVisibleTasks();
  visible.forEach(function (task) {
    taskList.appendChild(createTaskElement(task));
  });

  // Update counter
  const remaining = tasks.filter(function (task) { return !task.done; }).length;
  const completed = tasks.length - remaining;
  taskCount.textContent = remaining + " to do, " + completed + " completed";

  // Empty state message changes with the filter
  emptyState.hidden = visible.length > 0;
  if (currentFilter === "completed") {
    emptyState.textContent = "No completed tasks yet. Tick a task when you finish it.";
  } else if (currentFilter === "active") {
    emptyState.textContent = "Nothing left to do. Add a new task above.";
  } else {
    emptyState.textContent = "No tasks here yet. Add your first task above.";
  }

  clearCompletedBtn.disabled = completed === 0;
}

/* ---------- Event handlers ---------- */

form.addEventListener("submit", function (event) {
  event.preventDefault();
  const text = taskInput.value.trim();

  if (text === "") {
    taskError.textContent = "Enter a task before adding it.";
    taskInput.focus();
    return;
  }

  taskError.textContent = "";
  addTask(text, courseSelect.value, dateInput.value);
  taskInput.value = "";
  dateInput.value = "";
  taskInput.focus();
});

filterButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    currentFilter = button.dataset.filter;
    filterButtons.forEach(function (b) {
      b.setAttribute("aria-pressed", b === button ? "true" : "false");
    });
    renderTasks();
  });
});

clearCompletedBtn.addEventListener("click", clearCompleted);

// Initial render
renderTasks();
