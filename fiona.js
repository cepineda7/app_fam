/* Fiona – Family Management (GitHub Pages friendly)
   - No bundler, no imports, no JSX
   - Uses React + ReactDOM UMD from index.html
   - Persists tasks in localStorage
*/

const { useState, useEffect } = React;

/* ---------------------------
   Storage (localStorage wrapper)
---------------------------- */
const storage = {
  async get(key) {
    try {
      return { value: localStorage.getItem(key) };
    } catch (e) {
      return { value: null };
    }
  },
  async set(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (e) {}
  },
};

const STORAGE_KEY = "fiona-tasks-v1";

/* ---------------------------
   Sample data
---------------------------- */
const INITIAL_TASKS = [
  {
    id: "1",
    title: "Grocery shopping",
    description: "Weekly grocery run - check pantry and make list",
    category: "Household",
    status: "todo",
    assignee: "Partner A",
    priority: "high",
    dueDate: "2026-02-12",
    effort: 2,
    comments: [],
    createdAt: "2026-02-08T10:00:00Z",
  },
  {
    id: "2",
    title: "Laundry",
    description: "Wash, dry, and fold weekly laundry",
    category: "Household",
    status: "todo",
    assignee: "Partner B",
    priority: "medium",
    dueDate: "2026-02-11",
    effort: 2,
    comments: [],
    createdAt: "2026-02-08T10:00:00Z",
  },
  {
    id: "3",
    title: "Clean bathrooms",
    description: "Deep clean both bathrooms",
    category: "Household",
    status: "todo",
    assignee: "Partner A",
    priority: "medium",
    dueDate: "2026-02-14",
    effort: 3,
    comments: [],
    createdAt: "2026-02-08T10:00:00Z",
  },
  {
    id: "4",
    title: "Meal prep for the week",
    description: "Prep lunches and some dinners",
    category: "Household",
    status: "inprogress",
    assignee: "Partner B",
    priority: "high",
    dueDate: "2026-02-09",
    effort: 3,
    comments: [
      {
        id: "c1",
        author: "Partner B",
        text: "Starting with Sunday meal prep",
        timestamp: "2026-02-08T14:00:00Z",
      },
    ],
    createdAt: "2026-02-07T10:00:00Z",
  },
  {
    id: "5",
    title: "Organize garage",
    description: "Sort through boxes and donate unused items",
    category: "Household",
    status: "backlog",
    assignee: null,
    priority: "low",
    dueDate: null,
    effort: 5,
    comments: [],
    createdAt: "2026-02-05T10:00:00Z",
  },
  {
    id: "7",
    title: "Review weekly spending",
    description: "Check credit card transactions and budget",
    category: "Finances",
    status: "todo",
    assignee: "Partner A",
    priority: "high",
    dueDate: "2026-02-10",
    effort: 1,
    comments: [],
    createdAt: "2026-02-08T10:00:00Z",
  },
  {
    id: "8",
    title: "Pay utility bills",
    description: "Electric, water, internet due this week",
    category: "Finances",
    status: "todo",
    assignee: "Partner B",
    priority: "high",
    dueDate: "2026-02-11",
    effort: 1,
    comments: [],
    createdAt: "2026-02-08T10:00:00Z",
  },
  {
    id: "11",
    title: "Schedule dentist appointments",
    description: "Book cleanings for both of us",
    category: "Health",
    status: "todo",
    assignee: "Partner A",
    priority: "medium",
    dueDate: "2026-02-15",
    effort: 1,
    comments: [],
    createdAt: "2026-02-08T10:00:00Z",
  },
  {
    id: "12",
    title: "Refill prescriptions",
    description: "Pick up monthly medications",
    category: "Health",
    status: "todo",
    assignee: "Partner B",
    priority: "high",
    dueDate: "2026-02-10",
    effort: 1,
    comments: [],
    createdAt: "2026-02-08T10:00:00Z",
  },
  {
    id: "15",
    title: "Plan date night",
    description: "Make reservation for Saturday",
    category: "Personal",
    status: "todo",
    assignee: "Partner A",
    priority: "high",
    dueDate: "2026-02-13",
    effort: 1,
    comments: [],
    createdAt: "2026-02-08T10:00:00Z",
  },
];

const CATEGORIES = [
  { id: "Household", color: "#6B8E4E", lightColor: "#E8F3DC", emoji: "🏡" },
  { id: "Finances", color: "#D4A574", lightColor: "#F9EFE3", emoji: "💰" },
  { id: "Health", color: "#8B6B47", lightColor: "#EDE4D8", emoji: "✨" },
  { id: "Personal", color: "#9B8B7E", lightColor: "#F0EBE6", emoji: "💚" },
];

const STATUSES = [
  { id: "backlog", label: "Backlog" },
  { id: "todo", label: "To Do" },
  { id: "inprogress", label: "In Progress" },
  { id: "done", label: "Done" },
];

const PRIORITIES = [
  { id: "high", label: "High", color: "#D35F5F", icon: "⚡" },
  { id: "medium", label: "Medium", color: "#D4A574", icon: "○" },
  { id: "low", label: "Low", color: "#A5B79A", icon: "−" },
];

const ASSIGNEES = ["Partner A", "Partner B"];
const EFFORT_POINTS = [1, 2, 3, 5, 8];

/* ---------------------------
   Helpers
---------------------------- */
function isOverdue(dueDate) {
  if (!dueDate) return false;
  const today = new Date();
  const d = new Date(dueDate);
  // compare dates (ignore time)
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return d < today;
}

function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatDateTime(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

/* ---------------------------
   Minimal Icon wrapper (safe fallback)
   - Tries lucide-react style if available
   - Otherwise renders emoji/placeholder
---------------------------- */
function Icon({ name }) {
  // lucide global can be inconsistent; safest is text fallback
  const fallback = {
    plus: "＋",
    x: "✕",
    filter: "⏷",
    grid: "▦",
    chevron: "›",
    grip: "⋮⋮",
    clock: "🕒",
  };
  return React.createElement(
    "span",
    { style: { display: "inline-flex", width: 16, justifyContent: "center" } },
    fallback[name] || "•"
  );
}

/* ---------------------------
   Main App
---------------------------- */
function FamilyBoard() {
  const [tasks, setTasks] = useState([]);
  const [viewMode, setViewMode] = useState("swimlane"); // swimlane | focused
  const [focusedCategory, setFocusedCategory] = useState(null);

  const [draggedTask, setDraggedTask] = useState(null);

  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [expandedTask, setExpandedTask] = useState(null);

  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    assignee: null,
    priority: null,
    overdue: false,
  });

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    category: "Household",
    status: "backlog",
    assignee: null,
    priority: "medium",
    dueDate: "",
    effort: 2,
  });

  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    (async () => {
      const stored = await storage.get(STORAGE_KEY);
      if (stored && stored.value) {
        try {
          setTasks(JSON.parse(stored.value));
          return;
        } catch (e) {
          // fall through to reset
        }
      }
      setTasks(INITIAL_TASKS);
      await storage.set(STORAGE_KEY, JSON.stringify(INITIAL_TASKS));
    })();
  }, []);

  async function saveTasks(updated) {
    setTasks(updated);
    await storage.set(STORAGE_KEY, JSON.stringify(updated));
  }

  function applyFilters(list) {
    return list.filter((t) => {
      if (filters.assignee && t.assignee !== filters.assignee) return false;
      if (filters.priority && t.priority !== filters.priority) return false;
      if (filters.overdue && !isOverdue(t.dueDate)) return false;
      return true;
    });
  }

  function getTasksByCategory(cat) {
    return applyFilters(tasks.filter((t) => t.category === cat));
  }

  function getTasksByCategoryAndStatus(cat, status) {
    return applyFilters(tasks.filter((t) => t.category === cat && t.status === status));
  }

  function handleDragStart(task) {
    setDraggedTask(task);
  }

  function handleDragOver(e) {
    e.preventDefault();
  }

  function handleDrop(category, status) {
    if (!draggedTask) return;
    const updated = tasks.map((t) =>
      t.id === draggedTask.id ? { ...t, category, status } : t
    );
    saveTasks(updated);
    setDraggedTask(null);
  }

  function handleDeleteTask(taskId) {
    const updated = tasks.filter((t) => t.id !== taskId);
    saveTasks(updated);
    if (expandedTask && expandedTask.id === taskId) setExpandedTask(null);
  }

  function handleAddTask() {
    if (!newTask.title.trim()) return;
    const task = {
      id: Date.now().toString(),
      title: newTask.title.trim(),
      description: newTask.description || "",
      category: newTask.category,
      status: newTask.status,
      assignee: newTask.assignee || null,
      priority: newTask.priority,
      dueDate: newTask.dueDate || null,
      effort: newTask.effort,
      comments: [],
      createdAt: new Date().toISOString(),
    };
    saveTasks([...tasks, task]);
    setNewTask({
      title: "",
      description: "",
      category: "Household",
      status: "backlog",
      assignee: null,
      priority: "medium",
      dueDate: "",
      effort: 2,
    });
    setShowNewTaskForm(false);
  }

  function handleUpdateTask(taskId, updates) {
    const updated = tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t));
    saveTasks(updated);
    if (expandedTask && expandedTask.id === taskId) {
      setExpandedTask({ ...expandedTask, ...updates });
    }
  }

  function handleAddComment(taskId) {
    if (!newComment.trim()) return;
    const comment = {
      id: Date.now().toString(),
      author: "Partner A",
      text: newComment.trim(),
      timestamp: new Date().toISOString(),
    };
    const updated = tasks.map((t) =>
      t.id === taskId ? { ...t, comments: [...(t.comments || []), comment] } : t
    );
    saveTasks(updated);
    if (expandedTask && expandedTask.id === taskId) {
      setExpandedTask({
        ...expandedTask,
        comments: [...(expandedTask.comments || []), comment],
      });
    }
    setNewComment("");
  }

  const activeFilterCount = [filters.assignee, filters.priority, filters.overdue].filter(Boolean)
    .length;

  /* ---------------------------
     Components (inline)
  ---------------------------- */
  function TaskCard({ task }) {
    const category = CATEGORIES.find((c) => c.id === task.category);
    const priority = PRIORITIES.find((p) => p.id === task.priority);
    const overdue = isOverdue(task.dueDate);

    return React.createElement(
      "div",
      {
        className: "task-card",
        draggable: true,
        onDragStart: () => handleDragStart(task),
        onClick: () => setExpandedTask(task),
        style: { borderLeft: `3px solid ${category ? category.color : "#6B8E4E"}` },
      },
      React.createElement(
        "div",
        { className: "task-header" },
        React.createElement("div", { className: "drag-handle" }, "⋮⋮"),
        React.createElement(
          "div",
          { className: "task-header-content" },
          React.createElement(
            "div",
            { className: "task-title-row" },
            React.createElement("span", { className: "task-emoji" }, category ? category.emoji : "🏡"),
            React.createElement("h4", { className: "task-title" }, task.title),
            priority && priority.id === "high"
              ? React.createElement("span", { className: "priority-badge" }, "⚡")
              : null
          )
        )
      ),
      React.createElement(
        "div",
        { className: "task-metadata" },
        React.createElement(
          "div",
          { className: "task-metadata-left" },
          task.assignee
            ? React.createElement(
                "div",
                { className: "assignee-badge", title: task.assignee },
                getInitials(task.assignee)
              )
            : null,
          task.effort
            ? React.createElement("div", { className: "effort-badge" }, task.effort)
            : null,
          task.comments && task.comments.length > 0
            ? React.createElement("div", { className: "comment-indicator" }, `💬 ${task.comments.length}`)
            : null
        ),
        task.dueDate
          ? React.createElement(
              "div",
              { className: `due-date ${overdue ? "overdue" : ""}` },
              formatDate(task.dueDate)
            )
          : null
      )
    );
  }

  function ExpandedTaskModal() {
    if (!expandedTask) return null;

    const category = CATEGORIES.find((c) => c.id === expandedTask.category);
    const priority = PRIORITIES.find((p) => p.id === expandedTask.priority);
    const overdue = isOverdue(expandedTask.dueDate);

    return React.createElement(
      "div",
      { className: "modal-overlay", onClick: () => setExpandedTask(null) },
      React.createElement(
        "div",
        { className: "modal-content", onClick: (e) => e.stopPropagation() },
        React.createElement(
          "div",
          { className: "modal-header" },
          React.createElement(
            "div",
            { className: "modal-title-section" },
            React.createElement("span", { className: "modal-emoji" }, category ? category.emoji : "🏡"),
            React.createElement(
              "div",
              null,
              React.createElement("div", { className: "task-meta-tag" }, expandedTask.category),
              React.createElement("h2", null, expandedTask.title)
            )
          ),
          React.createElement(
            "button",
            { className: "modal-close", onClick: () => setExpandedTask(null) },
            "✕"
          )
        ),
        React.createElement(
          "div",
          { className: "modal-body" },
          React.createElement(
            "div",
            { className: "modal-main" },
            React.createElement(
              "div",
              { className: "form-group" },
              React.createElement("label", null, "Description"),
              React.createElement("textarea", {
                value: expandedTask.description || "",
                onChange: (e) => handleUpdateTask(expandedTask.id, { description: e.target.value }),
                placeholder: "Add a description...",
                rows: 4,
              })
            ),
            React.createElement(
              "div",
              { className: "comments-section" },
              React.createElement("h3", null, "💬 Comments"),
              expandedTask.comments && expandedTask.comments.length > 0
                ? React.createElement(
                    "div",
                    { className: "comments-list" },
                    expandedTask.comments.map((comment) =>
                      React.createElement(
                        "div",
                        { key: comment.id, className: "comment" },
                        React.createElement("div", { className: "comment-avatar" }, getInitials(comment.author)),
                        React.createElement(
                          "div",
                          { className: "comment-content" },
                          React.createElement(
                            "div",
                            { className: "comment-header" },
                            React.createElement("strong", null, comment.author),
                            React.createElement("span", { className: "comment-time" }, formatDateTime(comment.timestamp))
                          ),
                          React.createElement("p", null, comment.text)
                        )
                      )
                    )
                  )
                : React.createElement("p", { className: "empty-state" }, "No comments yet. Start the conversation!"),
              React.createElement(
                "div",
                { className: "add-comment" },
                React.createElement("input", {
                  type: "text",
                  value: newComment,
                  onChange: (e) => setNewComment(e.target.value),
                  onKeyDown: (e) => e.key === "Enter" && handleAddComment(expandedTask.id),
                  placeholder: "Add a comment...",
                }),
                React.createElement(
                  "button",
                  { className: "btn btn-primary", onClick: () => handleAddComment(expandedTask.id) },
                  "Post"
                )
              )
            )
          ),
          React.createElement(
            "div",
            { className: "modal-sidebar" },
            React.createElement(
              "div",
              { className: "sidebar-section" },
              React.createElement("label", null, "Status"),
              React.createElement(
                "select",
                {
                  value: expandedTask.status,
                  onChange: (e) => handleUpdateTask(expandedTask.id, { status: e.target.value }),
                },
                STATUSES.map((s) => React.createElement("option", { key: s.id, value: s.id }, s.label))
              )
            ),
            React.createElement(
              "div",
              { className: "sidebar-section" },
              React.createElement("label", null, "Assignee"),
              React.createElement(
                "select",
                {
                  value: expandedTask.assignee || "",
                  onChange: (e) => handleUpdateTask(expandedTask.id, { assignee: e.target.value || null }),
                },
                React.createElement("option", { value: "" }, "Unassigned"),
                ASSIGNEES.map((a) => React.createElement("option", { key: a, value: a }, a))
              )
            ),
            React.createElement(
              "div",
              { className: "sidebar-section" },
              React.createElement("label", null, "Priority"),
              React.createElement(
                "select",
                {
                  value: expandedTask.priority,
                  onChange: (e) => handleUpdateTask(expandedTask.id, { priority: e.target.value }),
                },
                PRIORITIES.map((p) =>
                  React.createElement("option", { key: p.id, value: p.id }, `${p.icon} ${p.label}`)
                )
              )
            ),
            React.createElement(
              "div",
              { className: "sidebar-section" },
              React.createElement("label", null, "Due Date"),
              React.createElement("input", {
                type: "date",
                value: expandedTask.dueDate || "",
                onChange: (e) => handleUpdateTask(expandedTask.id, { dueDate: e.target.value }),
              }),
              overdue ? React.createElement("div", { className: "warning-text" }, "⚠️ Overdue") : null
            ),
            React.createElement(
              "div",
              { className: "sidebar-section" },
              React.createElement("label", null, "Effort Points"),
              React.createElement(
                "select",
                {
                  value: expandedTask.effort,
                  onChange: (e) => handleUpdateTask(expandedTask.id, { effort: parseInt(e.target.value, 10) }),
                },
                EFFORT_POINTS.map((pt) => React.createElement("option", { key: pt, value: pt }, pt))
              )
            ),
            React.createElement(
              "div",
              { className: "sidebar-section" },
              React.createElement("label", null, "Category"),
              React.createElement(
                "select",
                {
                  value: expandedTask.category,
                  onChange: (e) => handleUpdateTask(expandedTask.id, { category: e.target.value }),
                },
                CATEGORIES.map((c) =>
                  React.createElement("option", { key: c.id, value: c.id }, `${c.emoji} ${c.id}`)
                )
              )
            ),
            React.createElement(
              "div",
              { className: "metadata-display" },
              React.createElement("span", null, "🕒"),
              React.createElement("span", null, `Created ${formatDateTime(expandedTask.createdAt)}`)
            ),
            React.createElement(
              "button",
              {
                className: "btn btn-danger",
                onClick: () => {
                  if (confirm("Delete this task?")) handleDeleteTask(expandedTask.id);
                },
              },
              "Delete Task"
            )
          )
        )
      )
    );
  }

  function SwimlaneView() {
    return React.createElement(
      "div",
      { className: "swimlane-container" },
      React.createElement(
        "div",
        { className: "columns-header" },
        React.createElement("div", null),
        STATUSES.map((s) =>
          React.createElement("div", { key: s.id, className: "status-header-label" }, s.label)
        )
      ),
      CATEGORIES.map((cat) => {
        const categoryTasks = getTasksByCategory(cat.id);
        if (categoryTasks.length === 0 && (filters.assignee || filters.priority || filters.overdue)) {
          return null;
        }

        return React.createElement(
          "div",
          { key: cat.id, className: "swimlane" },
          React.createElement(
            "div",
            {
              className: "category-label",
              style: { background: `linear-gradient(135deg, ${cat.color} 0%, ${cat.color}dd 100%)` },
              onClick: () => {
                setFocusedCategory(cat.id);
                setViewMode("focused");
              },
            },
            React.createElement(
              "div",
              { className: "category-label-content" },
              React.createElement("span", { className: "category-emoji" }, cat.emoji),
              React.createElement("span", null, cat.id)
            ),
            React.createElement("span", { style: { opacity: 0.8 } }, "›")
          ),
          STATUSES.map((s) =>
            React.createElement(
              "div",
              {
                key: `${cat.id}-${s.id}`,
                className: "status-column",
                onDragOver: handleDragOver,
                onDrop: () => handleDrop(cat.id, s.id),
              },
              getTasksByCategoryAndStatus(cat.id, s.id).map((t) =>
                React.createElement(TaskCard, { key: t.id, task: t })
              )
            )
          )
        );
      })
    );
  }

  function FocusedView() {
    const cat = CATEGORIES.find((c) => c.id === focusedCategory);

    return React.createElement(
      "div",
      { className: "focused-view" },
      React.createElement(
        "div",
        {
          className: "focused-header",
          style: { background: `linear-gradient(135deg, ${cat ? cat.color : "#6B8E4E"} 0%, ${(cat ? cat.color : "#6B8E4E")}dd 100%)` },
        },
        React.createElement(
          "div",
          { className: "focused-title" },
          React.createElement("span", { className: "focused-emoji" }, cat ? cat.emoji : "🏡"),
          React.createElement("h2", null, focusedCategory)
        ),
        React.createElement(
          "button",
          { className: "back-btn", onClick: () => setViewMode("swimlane") },
          React.createElement("span", null, "▦"),
          React.createElement("span", null, "All Boards")
        )
      ),
      React.createElement(
        "div",
        { className: "focused-columns" },
        STATUSES.map((s) =>
          React.createElement(
            "div",
            { key: s.id, className: "focused-column" },
            React.createElement("h3", { className: "focused-column-header" }, s.label),
            React.createElement(
              "div",
              {
                className: "focused-column-content",
                onDragOver: handleDragOver,
                onDrop: () => handleDrop(focusedCategory, s.id),
              },
              getTasksByCategoryAndStatus(focusedCategory, s.id).map((t) =>
                React.createElement(TaskCard, { key: t.id, task: t })
              )
            )
          )
        )
      )
    );
  }

  /* ---------------------------
     Styles (same vibe as Claude’s, trimmed)
  ---------------------------- */
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #E8F3DC 0%, #F5F9F0 100%);
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    .app-container { min-height: 100vh; padding: 2rem; max-width: 1800px; margin: 0 auto; }
    .header {
      background: white;
      padding: 1.75rem 2rem;
      border-radius: 20px;
      box-shadow: 0 4px 20px rgba(107, 142, 78, 0.08);
      margin-bottom: 2rem;
      border: 1px solid rgba(107, 142, 78, 0.1);
    }
    .header-content { display:flex; justify-content:space-between; align-items:center; gap: 1rem; flex-wrap: wrap; }
    .brand { display:flex; align-items:center; gap: .75rem; }
    .brand-icon { font-size: 2rem; }
    .brand-text h1 {
      font-size: 1.75rem; font-weight: 700;
      background: linear-gradient(135deg, #6B8E4E 0%, #8BA86D 100%);
      -webkit-background-clip:text; -webkit-text-fill-color: transparent;
    }
    .brand-tagline { font-size: .875rem; color: #8B9A7E; font-weight: 500; }
    .header-actions { display:flex; gap: .75rem; align-items:center; position: relative; }

    .filter-btn, .add-task-btn {
      padding: .625rem 1.125rem;
      border-radius: 12px;
      cursor: pointer;
      font-weight: 600;
      font-size: .9375rem;
      display:flex; align-items:center; gap: .5rem;
    }
    .filter-btn {
      border: 1.5px solid #E8F3DC;
      background: white;
      color: #4A5D3A;
      position: relative;
    }
    .filter-btn.active { background: linear-gradient(135deg, #6B8E4E 0%, #8BA86D 100%); color: white; border-color:#6B8E4E; }
    .filter-badge { background:#D35F5F; color:white; border-radius: 10px; padding: .125rem .4rem; font-size: .75rem; font-weight: 700; }

    .filter-dropdown {
      position:absolute; top: calc(100% + .5rem); right: 0;
      background:white; border:1.5px solid #E8F3DC; border-radius:16px;
      box-shadow: 0 12px 40px rgba(107, 142, 78, 0.15);
      padding: 1rem; min-width: 220px; z-index: 100;
    }
    .filter-section { margin-bottom: 1rem; }
    .filter-section > label { display:block; font-size:.75rem; font-weight:700; color:#6B8E4E; text-transform:uppercase; letter-spacing:.5px; margin-bottom:.5rem; }
    .filter-option { padding:.5rem .75rem; cursor:pointer; border-radius:8px; font-size:.9375rem; margin-bottom:.25rem; color:#4A5D3A; }
    .filter-option:hover { background:#F9FDF5; }
    .filter-option.selected { background:#E8F3DC; color:#6B8E4E; font-weight: 700; }
    .filter-checkbox { display:flex; align-items:center; gap:.5rem; padding:.5rem .75rem; cursor:pointer; border-radius:8px; }
    .filter-checkbox:hover { background:#F9FDF5; }
    .filter-checkbox input { accent-color:#6B8E4E; }

    .add-task-btn {
      border: none;
      background: linear-gradient(135deg, #6B8E4E 0%, #8BA86D 100%);
      color: white;
      box-shadow: 0 4px 12px rgba(107, 142, 78, 0.2);
    }

    .board-container {
      background: white; border-radius: 20px;
      box-shadow: 0 4px 20px rgba(107, 142, 78, 0.08);
      overflow:hidden; border: 1px solid rgba(107, 142, 78, 0.1);
    }
    .swimlane-container { padding: 2rem; }
    .columns-header {
      display:grid; grid-template-columns:160px repeat(4, 1fr);
      gap:1rem; margin-bottom:1.5rem; padding-bottom:1rem;
      border-bottom:2px solid #F5F9F0;
    }
    .status-header-label { font-weight:700; color:#6B8E4E; font-size:.8125rem; text-transform:uppercase; letter-spacing:.5px; }
    .swimlane {
      display:grid; grid-template-columns:160px repeat(4, 1fr);
      gap:1rem; margin-bottom:1.25rem; padding-bottom:1.25rem;
      border-bottom:1px solid #F5F9F0;
    }
    .swimlane:last-child { border-bottom:none; margin-bottom:0; padding-bottom:0; }

    .category-label {
      padding:.75rem 1rem; border-radius:12px;
      display:flex; justify-content:space-between; align-items:center;
      cursor:pointer; color:white;
    }
    .category-label-content { display:flex; align-items:center; gap:.5rem; font-weight:700; }
    .category-emoji { font-size:1.25rem; }

    .status-column {
      min-height: 120px;
      background:#FAFCF8; border-radius:12px; padding:.75rem;
      display:flex; flex-direction:column; gap:.75rem;
      border: 1px solid #F0F5EC;
    }

    .task-card {
      background:white; border-radius:12px; padding:1rem;
      box-shadow: 0 2px 8px rgba(107, 142, 78, 0.08);
      cursor:pointer; transition: transform .15s ease, box-shadow .15s ease;
      border: 1px solid rgba(107, 142, 78, 0.08);
    }
    .task-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(107, 142, 78, 0.15); }
    .task-header { display:flex; gap:.5rem; margin-bottom:.75rem; align-items:flex-start; }
    .drag-handle { color:#C5D4B8; margin-top:2px; user-select:none; }
    .task-title-row { display:flex; align-items:center; gap:.5rem; }
    .task-title { font-size:.9375rem; font-weight:700; color:#2C3A22; flex:1; }
    .priority-badge { margin-left:auto; }
    .task-metadata { display:flex; justify-content:space-between; gap:.5rem; align-items:center; }
    .task-metadata-left { display:flex; gap:.5rem; align-items:center; flex-wrap:wrap; }
    .assignee-badge {
      width: 26px; height: 26px; border-radius:50%;
      background: linear-gradient(135deg, #6B8E4E 0%, #8BA86D 100%);
      color:white; display:flex; align-items:center; justify-content:center;
      font-size:.6875rem; font-weight:800;
    }
    .effort-badge { background:#E8F3DC; color:#6B8E4E; padding:.25rem .5rem; border-radius:6px; font-size:.75rem; font-weight:800; }
    .comment-indicator { font-size:.8125rem; color:#8B9A7E; }
    .due-date { font-size:.8125rem; color:#8B9A7E; font-weight:600; }
    .due-date.overdue { color:#D35F5F; font-weight:800; }

    .modal-overlay {
      position:fixed; inset:0;
      background: rgba(44, 58, 34, 0.4);
      display:flex; align-items:center; justify-content:center;
      padding: 2rem; z-index: 1000;
    }
    .modal-content {
      background:white; border-radius:24px;
      max-width: 900px; width:100%; max-height:90vh; overflow:auto;
      box-shadow: 0 24px 60px rgba(107, 142, 78, 0.2);
      border: 1px solid rgba(107, 142, 78, 0.1);
    }
    .modal-header {
      padding: 2rem; border-bottom: 2px solid #F5F9F0;
      display:flex; justify-content:space-between; align-items:flex-start;
    }
    .modal-title-section { display:flex; gap:.75rem; align-items:flex-start; }
    .modal-emoji { font-size: 2rem; }
    .task-meta-tag { font-size:.75rem; color:#8B9A7E; font-weight:700; text-transform:uppercase; letter-spacing:.5px; margin-bottom:.5rem; }
    .modal-header h2 { font-size: 1.75rem; color:#2C3A22; font-weight:800; }
    .modal-close {
      background:#F9FDF5; border:none; cursor:pointer;
      width:40px; height:40px; border-radius:10px;
      color:#8B9A7E; font-size: 18px; font-weight: 800;
    }
    .modal-body { display:grid; grid-template-columns: 1fr 300px; gap:2rem; padding:2rem; }
    .modal-main { display:flex; flex-direction:column; gap:2rem; }
    .modal-sidebar { display:flex; flex-direction:column; gap:1.25rem; }

    .form-group, .sidebar-section { display:flex; flex-direction:column; gap:.625rem; }
    .form-group label, .sidebar-section label { font-size:.75rem; font-weight:800; color:#6B8E4E; text-transform:uppercase; letter-spacing:.5px; }
    textarea, input, select {
      width:100%; padding:.75rem;
      border:1.5px solid #E8F3DC; border-radius:10px;
      font-size:.9375rem; font-family:inherit;
      background:#FAFCF8; color:#2C3A22;
    }
    textarea { resize: vertical; min-height: 110px; line-height: 1.6; }
    .warning-text { color:#D35F5F; font-weight:800; font-size:.8125rem; }
    .comments-section { border-top:2px solid #F5F9F0; padding-top:2rem; }
    .comments-section h3 { font-size:1.125rem; font-weight:900; color:#2C3A22; margin-bottom:1.25rem; }
    .comments-list { display:flex; flex-direction:column; gap:1rem; margin-bottom:1.25rem; }
    .comment { display:flex; gap:.75rem; padding:1rem; background:#FAFCF8; border-radius:12px; }
    .comment-avatar {
      width:36px; height:36px; border-radius:50%;
      background: linear-gradient(135deg, #6B8E4E 0%, #8BA86D 100%);
      color:white; display:flex; align-items:center; justify-content:center;
      font-weight:900; flex-shrink:0;
    }
    .comment-header { display:flex; gap:.5rem; align-items:center; margin-bottom:.5rem; }
    .comment-time { font-size:.8125rem; color:#8B9A7E; font-weight:700; }
    .empty-state { color:#8B9A7E; font-style: italic; text-align:center; padding: 2rem; }
    .add-comment { display:flex; gap:.75rem; }
    .metadata-display { padding:.875rem; background:#FAFCF8; border-radius:10px; font-size:.8125rem; color:#8B9A7E; display:flex; gap:.5rem; align-items:center; }

    .btn { padding:.75rem 1.25rem; border-radius:12px; border:none; font-weight:800; cursor:pointer; font-size:.9375rem; }
    .btn-primary { background: linear-gradient(135deg, #6B8E4E 0%, #8BA86D 100%); color:white; }
    .btn-danger { background:#D35F5F; color:white; width:100%; }
    .btn-secondary { background:#F9FDF5; color:#6B8E4E; border:1.5px solid #E8F3DC; }

    .focused-columns { display:grid; grid-template-columns: repeat(4, 1fr); gap: 1.25rem; padding: 2rem; }
    .focused-column-header { font-size:.8125rem; font-weight:900; color:#6B8E4E; text-transform:uppercase; letter-spacing:.5px; }
    .focused-column-content { flex:1; background:#FAFCF8; border-radius:12px; padding:1rem; min-height: 340px; border:1px solid #F0F5EC; display:flex; flex-direction:column; gap:.75rem; }

    .back-btn {
      background: rgba(255,255,255,.2);
      border: 1.5px solid rgba(255,255,255,.3);
      color:white; padding:.625rem 1.125rem; border-radius:12px; cursor:pointer;
      display:flex; gap:.5rem; align-items:center; font-weight:900;
    }

    @media (max-width: 1200px) {
      .modal-body { grid-template-columns: 1fr; }
    }
    @media (max-width: 1024px) {
      .columns-header, .swimlane { grid-template-columns: 140px repeat(4, 1fr); }
      .focused-columns { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 768px) {
      .app-container { padding: 1rem; }
      .columns-header { display:none; }
      .swimlane { grid-template-columns: 1fr; }
      .focused-columns { grid-template-columns: 1fr; }
    }
  `;

  /* ---------------------------
     Filter Dropdown + New Task Modal
---------------------------- */
  function FilterDropdown() {
    if (!showFilters) return null;
    return React.createElement(
      "div",
      { className: "filter-dropdown" },
      React.createElement(
        "div",
        { className: "filter-section" },
        React.createElement("label", null, "Assignee"),
        React.createElement(
          "div",
          {
            className: `filter-option ${!filters.assignee ? "selected" : ""}`,
            onClick: () => setFilters({ ...filters, assignee: null }),
          },
          "Everyone"
        ),
        ASSIGNEES.map((a) =>
          React.createElement(
            "div",
            {
              key: a,
              className: `filter-option ${filters.assignee === a ? "selected" : ""}`,
              onClick: () => setFilters({ ...filters, assignee: a }),
            },
            a
          )
        )
      ),
      React.createElement(
        "div",
        { className: "filter-section" },
        React.createElement("label", null, "Priority"),
        React.createElement(
          "div",
          {
            className: `filter-option ${!filters.priority ? "selected" : ""}`,
            onClick: () => setFilters({ ...filters, priority: null }),
          },
          "All Priorities"
        ),
        PRIORITIES.map((p) =>
          React.createElement(
            "div",
            {
              key: p.id,
              className: `filter-option ${filters.priority === p.id ? "selected" : ""}`,
              onClick: () => setFilters({ ...filters, priority: p.id }),
            },
            `${p.icon} ${p.label}`
          )
        )
      ),
      React.createElement(
        "div",
        { className: "filter-section" },
        React.createElement(
          "label",
          { className: "filter-checkbox" },
          React.createElement("input", {
            type: "checkbox",
            checked: filters.overdue,
            onChange: (e) => setFilters({ ...filters, overdue: e.target.checked }),
          }),
          React.createElement("span", null, "Overdue Only")
        )
      )
    );
  }

  function NewTaskModal() {
    if (!showNewTaskForm) return null;

    return React.createElement(
      "div",
      {
        className: "modal-overlay",
        onClick: () => setShowNewTaskForm(false),
      },
      React.createElement(
        "div",
        {
          className: "modal-content",
          style: { maxWidth: "600px" },
          onClick: (e) => e.stopPropagation(),
        },
        React.createElement(
          "div",
          { className: "modal-header" },
          React.createElement(
            "div",
            null,
            React.createElement("div", { className: "task-meta-tag" }, "New Task"),
            React.createElement("h2", null, "What needs doing?")
          ),
          React.createElement(
            "button",
            { className: "modal-close", onClick: () => setShowNewTaskForm(false) },
            "✕"
          )
        ),
        React.createElement(
          "div",
          { style: { padding: "2rem" } },
          React.createElement(
            "div",
            { className: "form-group" },
            React.createElement("label", null, "Title"),
            React.createElement("input", {
              type: "text",
              value: newTask.title,
              onChange: (e) => setNewTask({ ...newTask, title: e.target.value }),
              placeholder: "Name this task...",
              autoFocus: true,
            })
          ),
          React.createElement(
            "div",
            { className: "form-group" },
            React.createElement("label", null, "Description"),
            React.createElement("textarea", {
              value: newTask.description,
              onChange: (e) => setNewTask({ ...newTask, description: e.target.value }),
              placeholder: "Add any helpful details...",
              rows: 3,
            })
          ),
          React.createElement(
            "div",
            { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" } },
            React.createElement(
              "div",
              { className: "form-group" },
              React.createElement("label", null, "Category"),
              React.createElement(
                "select",
                {
                  value: newTask.category,
                  onChange: (e) => setNewTask({ ...newTask, category: e.target.value }),
                },
                CATEGORIES.map((c) =>
                  React.createElement("option", { key: c.id, value: c.id }, `${c.emoji} ${c.id}`)
                )
              )
            ),
            React.createElement(
              "div",
              { className: "form-group" },
              React.createElement("label", null, "Status"),
              React.createElement(
                "select",
                {
                  value: newTask.status,
                  onChange: (e) => setNewTask({ ...newTask, status: e.target.value }),
                },
                STATUSES.map((s) => React.createElement("option", { key: s.id, value: s.id }, s.label))
              )
            )
          ),
          React.createElement(
            "div",
            { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" } },
            React.createElement(
              "div",
              { className: "form-group" },
              React.createElement("label", null, "Assignee"),
              React.createElement(
                "select",
                {
                  value: newTask.assignee || "",
                  onChange: (e) => setNewTask({ ...newTask, assignee: e.target.value || null }),
                },
                React.createElement("option", { value: "" }, "Unassigned"),
                ASSIGNEES.map((a) => React.createElement("option", { key: a, value: a }, a))
              )
            ),
            React.createElement(
              "div",
              { className: "form-group" },
              React.createElement("label", null, "Priority"),
              React.createElement(
                "select",
                {
                  value: newTask.priority,
                  onChange: (e) => setNewTask({ ...newTask, priority: e.target.value }),
                },
                PRIORITIES.map((p) =>
                  React.createElement("option", { key: p.id, value: p.id }, `${p.icon} ${p.label}`)
                )
              )
            )
          ),
          React.createElement(
            "div",
            { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" } },
            React.createElement(
              "div",
              { className: "form-group" },
              React.createElement("label", null, "Due Date"),
              React.createElement("input", {
                type: "date",
                value: newTask.dueDate,
                onChange: (e) => setNewTask({ ...newTask, dueDate: e.target.value }),
              })
            ),
            React.createElement(
              "div",
              { className: "form-group" },
              React.createElement("label", null, "Effort Points"),
              React.createElement(
                "select",
                {
                  value: newTask.effort,
                  onChange: (e) => setNewTask({ ...newTask, effort: parseInt(e.target.value, 10) }),
                },
                EFFORT_POINTS.map((pt) => React.createElement("option", { key: pt, value: pt }, pt))
              )
            )
          ),
          React.createElement(
            "div",
            { style: { display: "flex", gap: "0.75rem", marginTop: "2rem" } },
            React.createElement(
              "button",
              { className: "btn btn-secondary", onClick: () => setShowNewTaskForm(false) },
              "Cancel"
            ),
            React.createElement(
              "button",
              { className: "btn btn-primary", onClick: handleAddTask, style: { flex: 1 } },
              "Create Task"
            )
          )
        )
      )
    );
  }

  /* ---------------------------
     Render main layout
---------------------------- */
  return React.createElement(
    "div",
    { className: "app-container" },
    React.createElement("style", null, css),

    React.createElement(
      "div",
      { className: "header" },
      React.createElement(
        "div",
        { className: "header-content" },
        React.createElement(
          "div",
          { className: "brand" },
          React.createElement("div", { className: "brand-icon" }, "🏰"),
          React.createElement(
            "div",
            { className: "brand-text" },
            React.createElement("h1", null, "Fiona"),
            React.createElement("div", { className: "brand-tagline" }, "Family management, minus the chaos")
          )
        ),

        React.createElement(
          "div",
          { className: "header-actions" },
          React.createElement(
            "div",
            { style: { position: "relative" } },
            React.createElement(
              "button",
              {
                className: `filter-btn ${activeFilterCount > 0 ? "active" : ""}`,
                onClick: () => setShowFilters(!showFilters),
              },
              React.createElement("span", null, "⏷"),
              React.createElement("span", null, "Filter"),
              activeFilterCount > 0
                ? React.createElement("span", { className: "filter-badge" }, activeFilterCount)
                : null
            ),
            React.createElement(FilterDropdown, null)
          ),

          React.createElement(
            "button",
            { className: "add-task-btn", onClick: () => setShowNewTaskForm(true) },
            React.createElement("span", null, "＋"),
            React.createElement("span", null, "New Task")
          )
        )
      )
    ),

    React.createElement(
      "div",
      { className: "board-container" },
      viewMode === "swimlane" ? React.createElement(SwimlaneView) : React.createElement(FocusedView)
    ),

    React.createElement(NewTaskModal),
    React.createElement(ExpandedTaskModal)
  );
}

/* ---------------------------
   Mount
---------------------------- */
(function mount() {
  const el = document.getElementById("root");
  if (!el) {
    document.body.innerHTML =
      "<div style='padding:24px;font-family:system-ui;color:#b00020'>Missing <code>&lt;div id=\"root\"&gt;&lt;/div&gt;</code> in index.html</div>";
    return;
  }

  const root = ReactDOM.createRoot(el);
  root.render(React.createElement(FamilyBoard));
})();
