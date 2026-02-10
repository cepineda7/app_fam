const { useState, useEffect } = React;
const { GripVertical, Plus, X, ChevronRight, LayoutGrid, User, Calendar, MessageSquare, Clock, Filter, Sparkles } = lucide;

// Pre-populated sample tasks
const INITIAL_TASKS = [
  { 
    id: '1', 
    title: 'Grocery shopping', 
    description: 'Weekly grocery run - check pantry and make list', 
    category: 'Household', 
    status: 'todo',
    assignee: 'Partner A',
    priority: 'high',
    dueDate: '2026-02-12',
    effort: 2,
    comments: [],
    createdAt: '2026-02-08T10:00:00Z'
  },
  { 
    id: '2', 
    title: 'Laundry', 
    description: 'Wash, dry, and fold weekly laundry', 
    category: 'Household', 
    status: 'todo',
    assignee: 'Partner B',
    priority: 'medium',
    dueDate: '2026-02-11',
    effort: 2,
    comments: [],
    createdAt: '2026-02-08T10:00:00Z'
  },
  { 
    id: '3', 
    title: 'Clean bathrooms', 
    description: 'Deep clean both bathrooms', 
    category: 'Household', 
    status: 'todo',
    assignee: 'Partner A',
    priority: 'medium',
    dueDate: '2026-02-14',
    effort: 3,
    comments: [],
    createdAt: '2026-02-08T10:00:00Z'
  },
  { 
    id: '4', 
    title: 'Meal prep for the week', 
    description: 'Prep lunches and some dinners', 
    category: 'Household', 
    status: 'inprogress',
    assignee: 'Partner B',
    priority: 'high',
    dueDate: '2026-02-09',
    effort: 3,
    comments: [
      { id: 'c1', author: 'Partner B', text: 'Starting with Sunday meal prep', timestamp: '2026-02-08T14:00:00Z' }
    ],
    createdAt: '2026-02-07T10:00:00Z'
  },
  { 
    id: '5', 
    title: 'Organize garage', 
    description: 'Sort through boxes and donate unused items', 
    category: 'Household', 
    status: 'backlog',
    assignee: null,
    priority: 'low',
    dueDate: null,
    effort: 5,
    comments: [],
    createdAt: '2026-02-05T10:00:00Z'
  },
  { 
    id: '7', 
    title: 'Review weekly spending', 
    description: 'Check credit card transactions and budget', 
    category: 'Finances', 
    status: 'todo',
    assignee: 'Partner A',
    priority: 'high',
    dueDate: '2026-02-10',
    effort: 1,
    comments: [],
    createdAt: '2026-02-08T10:00:00Z'
  },
  { 
    id: '8', 
    title: 'Pay utility bills', 
    description: 'Electric, water, internet due this week', 
    category: 'Finances', 
    status: 'todo',
    assignee: 'Partner B',
    priority: 'high',
    dueDate: '2026-02-11',
    effort: 1,
    comments: [],
    createdAt: '2026-02-08T10:00:00Z'
  },
  { 
    id: '11', 
    title: 'Schedule dentist appointments', 
    description: 'Book cleanings for both of us', 
    category: 'Health', 
    status: 'todo',
    assignee: 'Partner A',
    priority: 'medium',
    dueDate: '2026-02-15',
    effort: 1,
    comments: [],
    createdAt: '2026-02-08T10:00:00Z'
  },
  { 
    id: '12', 
    title: 'Refill prescriptions', 
    description: 'Pick up monthly medications', 
    category: 'Health', 
    status: 'todo',
    assignee: 'Partner B',
    priority: 'high',
    dueDate: '2026-02-10',
    effort: 1,
    comments: [],
    createdAt: '2026-02-08T10:00:00Z'
  },
  { 
    id: '15', 
    title: 'Plan date night', 
    description: 'Make reservation for Saturday', 
    category: 'Personal', 
    status: 'todo',
    assignee: 'Partner A',
    priority: 'high',
    dueDate: '2026-02-13',
    effort: 1,
    comments: [],
    createdAt: '2026-02-08T10:00:00Z'
  },
];

const CATEGORIES = [
  { id: 'Household', color: '#6B8E4E', lightColor: '#E8F3DC', emoji: '🏡' },
  { id: 'Finances', color: '#D4A574', lightColor: '#F9EFE3', emoji: '💰' },
  { id: 'Health', color: '#8B6B47', lightColor: '#EDE4D8', emoji: '✨' },
  { id: 'Personal', color: '#9B8B7E', lightColor: '#F0EBE6', emoji: '💚' },
];

const STATUSES = [
  { id: 'backlog', label: 'Backlog' },
  { id: 'todo', label: 'To Do' },
  { id: 'inprogress', label: 'In Progress' },
  { id: 'done', label: 'Done' },
];

const PRIORITIES = [
  { id: 'high', label: 'High', color: '#D35F5F', icon: '⚡' },
  { id: 'medium', label: 'Medium', color: '#D4A574', icon: '○' },
  { id: 'low', label: 'Low', color: '#A5B79A', icon: '−' },
];

const ASSIGNEES = ['Partner A', 'Partner B'];
const EFFORT_POINTS = [1, 2, 3, 5, 8];

function FamilyBoard() {
  const [tasks, setTasks] = useState([]);
  const [viewMode, setViewMode] = useState('swimlane');
  const [focusedCategory, setFocusedCategory] = useState(null);
  const [draggedTask, setDraggedTask] = useState(null);
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [expandedTask, setExpandedTask] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [newTask, setNewTask] = useState({ 
    title: '', 
    description: '', 
    category: 'Household', 
    status: 'backlog',
    assignee: null,
    priority: 'medium',
    dueDate: '',
    effort: 2,
    comments: []
  });
  const [newComment, setNewComment] = useState('');
  const [filters, setFilters] = useState({
    assignee: null,
    priority: null,
    overdue: false
  });

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const stored = await window.storage.get('fiona-tasks-v1');
        if (stored && stored.value) {
          setTasks(JSON.parse(stored.value));
        } else {
          setTasks(INITIAL_TASKS);
          await window.storage.set('fiona-tasks-v1', JSON.stringify(INITIAL_TASKS));
        }
      } catch (error) {
        setTasks(INITIAL_TASKS);
      }
    };
    loadTasks();
  }, []);

  const saveTasks = async (updatedTasks) => {
    setTasks(updatedTasks);
    try {
      await window.storage.set('fiona-tasks-v1', JSON.stringify(updatedTasks));
    } catch (error) {
      console.error('Failed to save tasks:', error);
    }
  };

  const handleDragStart = (task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (category, status) => {
    if (!draggedTask) return;
    
    const updatedTasks = tasks.map(task =>
      task.id === draggedTask.id
        ? { ...task, category, status }
        : task
    );
    
    saveTasks(updatedTasks);
    setDraggedTask(null);
  };

  const handleDeleteTask = (taskId) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    saveTasks(updatedTasks);
    if (expandedTask?.id === taskId) {
      setExpandedTask(null);
    }
  };

  const handleAddTask = () => {
    if (!newTask.title.trim()) return;
    
    const task = {
      id: Date.now().toString(),
      ...newTask,
      comments: [],
      createdAt: new Date().toISOString()
    };
    
    saveTasks([...tasks, task]);
    setNewTask({ 
      title: '', 
      description: '', 
      category: 'Household', 
      status: 'backlog',
      assignee: null,
      priority: 'medium',
      dueDate: '',
      effort: 2,
      comments: []
    });
    setShowNewTaskForm(false);
  };

  const handleUpdateTask = (taskId, updates) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, ...updates } : task
    );
    saveTasks(updatedTasks);
    if (expandedTask?.id === taskId) {
      setExpandedTask({ ...expandedTask, ...updates });
    }
  };

  const handleAddComment = (taskId) => {
    if (!newComment.trim()) return;
    
    const comment = {
      id: Date.now().toString(),
      author: 'Partner A',
      text: newComment,
      timestamp: new Date().toISOString()
    };
    
    const updatedTasks = tasks.map(task =>
      task.id === taskId 
        ? { ...task, comments: [...(task.comments || []), comment] }
        : task
    );
    
    saveTasks(updatedTasks);
    if (expandedTask?.id === taskId) {
      setExpandedTask({ ...expandedTask, comments: [...(expandedTask.comments || []), comment] });
    }
    setNewComment('');
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const applyFilters = (taskList) => {
    return taskList.filter(task => {
      if (filters.assignee && task.assignee !== filters.assignee) return false;
      if (filters.priority && task.priority !== filters.priority) return false;
      if (filters.overdue && !isOverdue(task.dueDate)) return false;
      return true;
    });
  };

  const getTasksByCategory = (category) => {
    const categoryTasks = tasks.filter(task => task.category === category);
    return applyFilters(categoryTasks);
  };

  const getTasksByCategoryAndStatus = (category, status) => {
    const categoryStatusTasks = tasks.filter(task => task.category === category && task.status === status);
    return applyFilters(categoryStatusTasks);
  };

  const TaskCard = ({ task, onDelete }) => {
    const category = CATEGORIES.find(c => c.id === task.category);
    const priority = PRIORITIES.find(p => p.id === task.priority);
    const overdue = isOverdue(task.dueDate);
    
    return React.createElement('div', {
      draggable: true,
      onDragStart: () => handleDragStart(task),
      onClick: () => setExpandedTask(task),
      className: 'task-card',
      style: { borderLeft: `3px solid ${category?.color || '#6B8E4E'}` }
    },
      React.createElement('div', { className: 'task-header' },
        React.createElement(GripVertical, { size: 16, className: 'drag-handle' }),
        React.createElement('div', { className: 'task-header-content' },
          React.createElement('div', { className: 'task-title-row' },
            React.createElement('span', { className: 'task-emoji' }, category?.emoji),
            React.createElement('h4', { className: 'task-title' }, task.title),
            priority?.id === 'high' && React.createElement('span', { className: 'priority-badge' }, '⚡')
          )
        )
      ),
      React.createElement('div', { className: 'task-metadata' },
        React.createElement('div', { className: 'task-metadata-left' },
          task.assignee && React.createElement('div', { 
            className: 'assignee-badge', 
            title: task.assignee 
          }, getInitials(task.assignee)),
          task.effort && React.createElement('div', { className: 'effort-badge' }, task.effort),
          task.comments && task.comments.length > 0 && React.createElement('div', { 
            className: 'comment-indicator' 
          }, `💬 ${task.comments.length}`)
        ),
        task.dueDate && React.createElement('div', { 
          className: `due-date ${overdue ? 'overdue' : ''}` 
        }, formatDate(task.dueDate))
      )
    );
  };

  const ExpandedTaskModal = () => {
    if (!expandedTask) return null;
    
    const category = CATEGORIES.find(c => c.id === expandedTask.category);
    const priority = PRIORITIES.find(p => p.id === expandedTask.priority);
    const overdue = isOverdue(expandedTask.dueDate);
    
    return React.createElement('div', { 
      className: 'modal-overlay', 
      onClick: () => setExpandedTask(null) 
    },
      React.createElement('div', { 
        className: 'modal-content', 
        onClick: (e) => e.stopPropagation() 
      },
        React.createElement('div', { className: 'modal-header' },
          React.createElement('div', { className: 'modal-title-section' },
            React.createElement('span', { className: 'modal-emoji' }, category?.emoji),
            React.createElement('div', null,
              React.createElement('div', { className: 'task-meta-tag' }, expandedTask.category),
              React.createElement('h2', null, expandedTask.title)
            )
          ),
          React.createElement('button', { 
            onClick: () => setExpandedTask(null), 
            className: 'modal-close' 
          }, React.createElement(X, { size: 24 }))
        ),
        React.createElement('div', { className: 'modal-body' },
          React.createElement('div', { className: 'modal-main' },
            React.createElement('div', { className: 'form-group' },
              React.createElement('label', null, 'Description'),
              React.createElement('textarea', {
                value: expandedTask.description || '',
                onChange: (e) => handleUpdateTask(expandedTask.id, { description: e.target.value }),
                placeholder: 'Add a description...',
                rows: 4
              })
            ),
            React.createElement('div', { className: 'comments-section' },
              React.createElement('h3', null, '💬 Comments'),
              expandedTask.comments && expandedTask.comments.length > 0 
                ? React.createElement('div', { className: 'comments-list' },
                    expandedTask.comments.map(comment =>
                      React.createElement('div', { key: comment.id, className: 'comment' },
                        React.createElement('div', { className: 'comment-avatar' }, getInitials(comment.author)),
                        React.createElement('div', { className: 'comment-content' },
                          React.createElement('div', { className: 'comment-header' },
                            React.createElement('strong', null, comment.author),
                            React.createElement('span', { className: 'comment-time' }, formatDateTime(comment.timestamp))
                          ),
                          React.createElement('p', null, comment.text)
                        )
                      )
                    )
                  )
                : React.createElement('p', { className: 'empty-state' }, 'No comments yet. Start the conversation!'),
              React.createElement('div', { className: 'add-comment' },
                React.createElement('input', {
                  type: 'text',
                  value: newComment,
                  onChange: (e) => setNewComment(e.target.value),
                  onKeyPress: (e) => e.key === 'Enter' && handleAddComment(expandedTask.id),
                  placeholder: 'Add a comment...'
                }),
                React.createElement('button', {
                  onClick: () => handleAddComment(expandedTask.id),
                  className: 'btn btn-primary'
                }, 'Post')
              )
            )
          ),
          React.createElement('div', { className: 'modal-sidebar' },
            React.createElement('div', { className: 'sidebar-section' },
              React.createElement('label', null, 'Status'),
              React.createElement('select', {
                value: expandedTask.status,
                onChange: (e) => handleUpdateTask(expandedTask.id, { status: e.target.value })
              }, STATUSES.map(status =>
                React.createElement('option', { key: status.id, value: status.id }, status.label)
              ))
            ),
            React.createElement('div', { className: 'sidebar-section' },
              React.createElement('label', null, 'Assignee'),
              React.createElement('select', {
                value: expandedTask.assignee || '',
                onChange: (e) => handleUpdateTask(expandedTask.id, { assignee: e.target.value || null })
              },
                React.createElement('option', { value: '' }, 'Unassigned'),
                ASSIGNEES.map(assignee =>
                  React.createElement('option', { key: assignee, value: assignee }, assignee)
                )
              )
            ),
            React.createElement('div', { className: 'sidebar-section' },
              React.createElement('label', null, 'Priority'),
              React.createElement('select', {
                value: expandedTask.priority,
                onChange: (e) => handleUpdateTask(expandedTask.id, { priority: e.target.value })
              }, PRIORITIES.map(p =>
                React.createElement('option', { key: p.id, value: p.id }, `${p.icon} ${p.label}`)
              ))
            ),
            React.createElement('div', { className: 'sidebar-section' },
              React.createElement('label', null, 'Due Date'),
              React.createElement('input', {
                type: 'date',
                value: expandedTask.dueDate || '',
                onChange: (e) => handleUpdateTask(expandedTask.id, { dueDate: e.target.value })
              }),
              overdue && React.createElement('div', { className: 'warning-text' }, '⚠️ Overdue')
            ),
            React.createElement('div', { className: 'sidebar-section' },
              React.createElement('label', null, 'Effort Points'),
              React.createElement('select', {
                value: expandedTask.effort,
                onChange: (e) => handleUpdateTask(expandedTask.id, { effort: parseInt(e.target.value) })
              }, EFFORT_POINTS.map(points =>
                React.createElement('option', { key: points, value: points }, points)
              ))
            ),
            React.createElement('div', { className: 'sidebar-section' },
              React.createElement('label', null, 'Category'),
              React.createElement('select', {
                value: expandedTask.category,
                onChange: (e) => handleUpdateTask(expandedTask.id, { category: e.target.value })
              }, CATEGORIES.map(cat =>
                React.createElement('option', { key: cat.id, value: cat.id }, `${cat.emoji} ${cat.id}`)
              ))
            ),
            React.createElement('div', { className: 'metadata-display' },
              React.createElement(Clock, { size: 14 }),
              React.createElement('span', null, `Created ${formatDateTime(expandedTask.createdAt)}`)
            ),
            React.createElement('button', {
              onClick: () => {
                if (confirm('Delete this task?')) {
                  handleDeleteTask(expandedTask.id);
                }
              },
              className: 'btn btn-danger'
            }, 'Delete Task')
          )
        )
      )
    );
  };

  const SwimlaneView = () => 
    React.createElement('div', { className: 'swimlane-container' },
      React.createElement('div', { className: 'columns-header' },
        React.createElement('div'),
        STATUSES.map(status =>
          React.createElement('div', { key: status.id, className: 'status-header-label' }, status.label)
        )
      ),
      CATEGORIES.map(category => {
        const categoryTasks = getTasksByCategory(category.id);
        if (categoryTasks.length === 0 && (filters.assignee || filters.priority || filters.overdue)) {
          return null;
        }
        
        return React.createElement('div', { key: category.id, className: 'swimlane' },
          React.createElement('div', {
            className: 'category-label',
            style: { background: `linear-gradient(135deg, ${category.color} 0%, ${category.color}dd 100%)` },
            onClick: () => {
              setFocusedCategory(category.id);
              setViewMode('focused');
            }
          },
            React.createElement('div', { className: 'category-label-content' },
              React.createElement('span', { className: 'category-emoji' }, category.emoji),
              React.createElement('span', null, category.id)
            ),
            React.createElement(ChevronRight, { size: 18, opacity: 0.7 })
          ),
          STATUSES.map(status =>
            React.createElement('div', {
              key: `${category.id}-${status.id}`,
              className: 'status-column',
              onDragOver: handleDragOver,
              onDrop: () => handleDrop(category.id, status.id)
            },
              getTasksByCategoryAndStatus(category.id, status.id).map(task =>
                React.createElement(TaskCard, { key: task.id, task: task, onDelete: handleDeleteTask })
              )
            )
          )
        );
      })
    );

  const FocusedView = () => {
    const category = CATEGORIES.find(c => c.id === focusedCategory);
    
    return React.createElement('div', { className: 'focused-view' },
      React.createElement('div', {
        className: 'focused-header',
        style: { background: `linear-gradient(135deg, ${category?.color} 0%, ${category?.color}dd 100%)` }
      },
        React.createElement('div', { className: 'focused-title' },
          React.createElement('span', { className: 'focused-emoji' }, category?.emoji),
          React.createElement('h2', null, focusedCategory)
        ),
        React.createElement('button', {
          className: 'back-btn',
          onClick: () => setViewMode('swimlane')
        },
          React.createElement(LayoutGrid, { size: 18 }),
          React.createElement('span', null, 'All Boards')
        )
      ),
      React.createElement('div', { className: 'focused-columns' },
        STATUSES.map(status =>
          React.createElement('div', { key: status.id, className: 'focused-column' },
            React.createElement('h3', { className: 'focused-column-header' }, status.label),
            React.createElement('div', {
              className: 'focused-column-content',
              onDragOver: handleDragOver,
              onDrop: () => handleDrop(focusedCategory, status.id)
            },
              getTasksByCategoryAndStatus(focusedCategory, status.id).map(task =>
                React.createElement(TaskCard, { key: task.id, task: task, onDelete: handleDeleteTask })
              )
            )
          )
        )
      )
    );
  };

  const activeFilterCount = [filters.assignee, filters.priority, filters.overdue].filter(Boolean).length;

  return React.createElement('div', { className: 'app-container' },
    React.createElement('style', null, `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
        background: linear-gradient(135deg, #E8F3DC 0%, #F5F9F0 100%);
        min-height: 100vh;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      .app-container {
        min-height: 100vh;
        padding: 2rem;
        max-width: 1800px;
        margin: 0 auto;
      }

      .header {
        background: white;
        padding: 1.75rem 2rem;
        border-radius: 20px;
        box-shadow: 0 4px 20px rgba(107, 142, 78, 0.08);
        margin-bottom: 2rem;
        border: 1px solid rgba(107, 142, 78, 0.1);
      }

      .header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1.5rem;
      }

      .brand {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .brand-icon {
        font-size: 2rem;
        animation: float 3s ease-in-out infinite;
      }

      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-5px); }
      }

      .brand-text h1 {
        font-size: 1.75rem;
        font-weight: 700;
        background: linear-gradient(135deg, #6B8E4E 0%, #8BA86D 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        letter-spacing: -0.5px;
      }

      .brand-tagline {
        font-size: 0.875rem;
        color: #8B9A7E;
        font-weight: 500;
      }

      .header-actions {
        display: flex;
        gap: 0.75rem;
        align-items: center;
      }

      .filter-btn {
        padding: 0.625rem 1.125rem;
        border: 1.5px solid #E8F3DC;
        background: white;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #4A5D3A;
        position: relative;
        font-size: 0.9375rem;
      }

      .filter-btn:hover {
        background: #F9FDF5;
        border-color: #6B8E4E;
        transform: translateY(-1px);
      }

      .filter-btn.active {
        background: linear-gradient(135deg, #6B8E4E 0%, #8BA86D 100%);
        color: white;
        border-color: #6B8E4E;
      }

      .filter-badge {
        background: #D35F5F;
        color: white;
        border-radius: 10px;
        padding: 0.125rem 0.4rem;
        font-size: 0.75rem;
        font-weight: 700;
      }

      .filter-dropdown {
        position: absolute;
        top: calc(100% + 0.5rem);
        right: 0;
        background: white;
        border: 1.5px solid #E8F3DC;
        border-radius: 16px;
        box-shadow: 0 12px 40px rgba(107, 142, 78, 0.15);
        padding: 1rem;
        min-width: 220px;
        z-index: 100;
      }

      .filter-section {
        margin-bottom: 1rem;
      }

      .filter-section:last-child {
        margin-bottom: 0;
      }

      .filter-section > label {
        display: block;
        font-size: 0.75rem;
        font-weight: 700;
        color: #6B8E4E;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 0.5rem;
      }

      .filter-option {
        padding: 0.5rem 0.75rem;
        cursor: pointer;
        border-radius: 8px;
        font-size: 0.9375rem;
        margin-bottom: 0.25rem;
        transition: all 0.2s;
        color: #4A5D3A;
      }

      .filter-option:hover {
        background: #F9FDF5;
      }

      .filter-option.selected {
        background: #E8F3DC;
        color: #6B8E4E;
        font-weight: 600;
      }

      .filter-checkbox {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 0.75rem;
        cursor: pointer;
        border-radius: 8px;
        transition: all 0.2s;
      }

      .filter-checkbox:hover {
        background: #F9FDF5;
      }

      .filter-checkbox input {
        cursor: pointer;
        accent-color: #6B8E4E;
      }

      .add-task-btn {
        padding: 0.625rem 1.25rem;
        background: linear-gradient(135deg, #6B8E4E 0%, #8BA86D 100%);
        color: white;
        border: none;
        border-radius: 12px;
        cursor: pointer;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 4px 12px rgba(107, 142, 78, 0.2);
        font-size: 0.9375rem;
      }

      .add-task-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(107, 142, 78, 0.3);
      }

      .add-task-btn:active {
        transform: translateY(0);
      }

      .board-container {
        background: white;
        border-radius: 20px;
        box-shadow: 0 4px 20px rgba(107, 142, 78, 0.08);
        overflow: hidden;
        border: 1px solid rgba(107, 142, 78, 0.1);
      }

      .swimlane-container {
        padding: 2rem;
      }

      .columns-header {
        display: grid;
        grid-template-columns: 160px repeat(4, 1fr);
        gap: 1rem;
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 2px solid #F5F9F0;
      }

      .status-header-label {
        font-weight: 600;
        color: #6B8E4E;
        font-size: 0.8125rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .swimlane {
        display: grid;
        grid-template-columns: 160px repeat(4, 1fr);
        gap: 1rem;
        margin-bottom: 1.25rem;
        padding-bottom: 1.25rem;
        border-bottom: 1px solid #F5F9F0;
      }

      .swimlane:last-child {
        border-bottom: none;
        margin-bottom: 0;
      }

      .category-label {
        padding: 0.75rem 1rem;
        border-radius: 12px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        align-self: start;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        color: white;
        box-shadow: 0 2px 8px rgba(107, 142, 78, 0.15);
      }

      .category-label:hover {
        transform: translateX(3px);
        box-shadow: 0 4px 12px rgba(107, 142, 78, 0.25);
      }

      .category-label-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 600;
        font-size: 0.9375rem;
      }

      .category-emoji {
        font-size: 1.25rem;
      }

      .status-column {
        min-height: 100px;
        background: #FAFCF8;
        border-radius: 12px;
        padding: 0.75rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        border: 1px solid #F0F5EC;
      }

      .task-card {
        background: white;
        border-radius: 12px;
        padding: 1rem;
        box-shadow: 0 2px 8px rgba(107, 142, 78, 0.08);
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        border-left: 3px solid;
        border: 1px solid rgba(107, 142, 78, 0.08);
        border-left: 3px solid;
      }

      .task-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(107, 142, 78, 0.15);
      }

      .task-header {
        display: flex;
        align-items: start;
        gap: 0.5rem;
        margin-bottom: 0.75rem;
      }

      .drag-handle {
        color: #C5D4B8;
        flex-shrink: 0;
        margin-top: 2px;
        cursor: grab;
      }

      .task-card:active .drag-handle {
        cursor: grabbing;
      }

      .task-header-content {
        flex: 1;
        min-width: 0;
      }

      .task-title-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .task-emoji {
        font-size: 1rem;
      }

      .priority-badge {
        font-size: 0.875rem;
        margin-left: auto;
      }

      .task-title {
        font-size: 0.9375rem;
        font-weight: 600;
        color: #2C3A22;
        line-height: 1.5;
        flex: 1;
      }

      .task-metadata {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 0.5rem;
      }

      .task-metadata-left {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex-wrap: wrap;
      }

      .assignee-badge {
        width: 26px;
        height: 26px;
        border-radius: 50%;
        background: linear-gradient(135deg, #6B8E4E 0%, #8BA86D 100%);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.6875rem;
        font-weight: 700;
        box-shadow: 0 2px 6px rgba(107, 142, 78, 0.2);
      }

      .effort-badge {
        background: #E8F3DC;
        color: #6B8E4E;
        padding: 0.25rem 0.5rem;
        border-radius: 6px;
        font-size: 0.75rem;
        font-weight: 700;
      }

      .comment-indicator {
        font-size: 0.8125rem;
        color: #8B9A7E;
      }

      .due-date {
        font-size: 0.8125rem;
        color: #8B9A7E;
        font-weight: 500;
      }

      .due-date.overdue {
        color: #D35F5F;
        font-weight: 700;
      }

      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(44, 58, 34, 0.4);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 2rem;
      }

      .modal-content {
        background: white;
        border-radius: 24px;
        max-width: 900px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 24px 60px rgba(107, 142, 78, 0.2);
        border: 1px solid rgba(107, 142, 78, 0.1);
      }

      .modal-header {
        padding: 2rem;
        border-bottom: 2px solid #F5F9F0;
        display: flex;
        justify-content: space-between;
        align-items: start;
      }

      .modal-title-section {
        display: flex;
        align-items: start;
        gap: 0.75rem;
      }

      .modal-emoji {
        font-size: 2rem;
      }

      .task-meta-tag {
        font-size: 0.75rem;
        color: #8B9A7E;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 0.5rem;
      }

      .modal-header h2 {
        font-size: 1.75rem;
        color: #2C3A22;
        font-weight: 700;
        line-height: 1.3;
      }

      .modal-close {
        background: #F9FDF5;
        border: none;
        color: #8B9A7E;
        cursor: pointer;
        padding: 0.5rem;
        border-radius: 10px;
        transition: all 0.2s;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .modal-close:hover {
        background: #E8F3DC;
        color: #6B8E4E;
      }

      .modal-body {
        display: grid;
        grid-template-columns: 1fr 300px;
        gap: 2rem;
        padding: 2rem;
      }

      .modal-main {
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .modal-sidebar {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .form-group label,
      .sidebar-section label {
        font-size: 0.75rem;
        font-weight: 700;
        color: #6B8E4E;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .sidebar-section {
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .form-group input,
      .form-group textarea,
      .form-group select,
      .sidebar-section input,
      .sidebar-section select {
        width: 100%;
        padding: 0.75rem;
        border: 1.5px solid #E8F3DC;
        border-radius: 10px;
        font-size: 0.9375rem;
        font-family: inherit;
        background: #FAFCF8;
        transition: all 0.2s;
        color: #2C3A22;
      }

      .form-group input:focus,
      .form-group textarea:focus,
      .form-group select:focus,
      .sidebar-section input:focus,
      .sidebar-section select:focus {
        outline: none;
        border-color: #6B8E4E;
        background: white;
        box-shadow: 0 0 0 3px rgba(107, 142, 78, 0.1);
      }

      .form-group textarea {
        min-height: 120px;
        resize: vertical;
        line-height: 1.6;
      }

      .warning-text {
        color: #D35F5F;
        font-size: 0.8125rem;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 0.25rem;
      }

      .comments-section {
        border-top: 2px solid #F5F9F0;
        padding-top: 2rem;
      }

      .comments-section h3 {
        font-size: 1.125rem;
        color: #2C3A22;
        margin-bottom: 1.25rem;
        font-weight: 700;
      }

      .comments-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-bottom: 1.25rem;
      }

      .comment {
        display: flex;
        gap: 0.75rem;
        padding: 1rem;
        background: #FAFCF8;
        border-radius: 12px;
      }

      .comment-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: linear-gradient(135deg, #6B8E4E 0%, #8BA86D 100%);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.8125rem;
        font-weight: 700;
        flex-shrink: 0;
      }

      .comment-content {
        flex: 1;
      }

      .comment-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
      }

      .comment-header strong {
        font-size: 0.9375rem;
        color: #2C3A22;
        font-weight: 600;
      }

      .comment-time {
        font-size: 0.8125rem;
        color: #8B9A7E;
      }

      .comment-content p {
        font-size: 0.9375rem;
        color: #4A5D3A;
        line-height: 1.6;
      }

      .empty-state {
        color: #8B9A7E;
        font-style: italic;
        font-size: 0.9375rem;
        text-align: center;
        padding: 2rem;
      }

      .add-comment {
        display: flex;
        gap: 0.75rem;
      }

      .add-comment input {
        flex: 1;
        padding: 0.75rem 1rem;
        border: 1.5px solid #E8F3DC;
        border-radius: 12px;
        font-size: 0.9375rem;
        background: #FAFCF8;
      }

      .add-comment input:focus {
        outline: none;
        border-color: #6B8E4E;
        background: white;
      }

      .metadata-display {
        padding: 0.875rem;
        background: #FAFCF8;
        border-radius: 10px;
        font-size: 0.8125rem;
        color: #8B9A7E;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .btn {
        padding: 0.75rem 1.25rem;
        border-radius: 12px;
        border: none;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        font-size: 0.9375rem;
      }

      .btn-primary {
        background: linear-gradient(135deg, #6B8E4E 0%, #8BA86D 100%);
        color: white;
        box-shadow: 0 4px 12px rgba(107, 142, 78, 0.2);
      }

      .btn-primary:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 20px rgba(107, 142, 78, 0.3);
      }

      .btn-secondary {
        background: #F9FDF5;
        color: #6B8E4E;
        border: 1.5px solid #E8F3DC;
      }

      .btn-secondary:hover {
        background: #E8F3DC;
      }

      .btn-danger {
        background: #D35F5F;
        color: white;
        width: 100%;
      }

      .btn-danger:hover {
        background: #C04F4F;
      }

      .focused-view {
        min-height: 70vh;
      }

      .focused-header {
        padding: 2rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: white;
      }

      .focused-title {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .focused-emoji {
        font-size: 2.5rem;
      }

      .focused-header h2 {
        font-size: 2rem;
        font-weight: 700;
      }

      .back-btn {
        background: rgba(255, 255, 255, 0.2);
        border: 1.5px solid rgba(255, 255, 255, 0.3);
        color: white;
        padding: 0.625rem 1.125rem;
        border-radius: 12px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 600;
        transition: all 0.2s;
        backdrop-filter: blur(10px);
      }

      .back-btn:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: translateY(-1px);
      }

      .focused-columns {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 1.25rem;
        padding: 2rem;
      }

      .focused-column {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .focused-column-header {
        font-size: 0.8125rem;
        font-weight: 700;
        color: #6B8E4E;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .focused-column-content {
        flex: 1;
        background: #FAFCF8;
        border-radius: 12px;
        padding: 1rem;
        min-height: 400px;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        border: 1px solid #F0F5EC;
      }

      @media (max-width: 1200px) {
        .modal-body {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 1024px) {
        .columns-header,
        .swimlane {
          grid-template-columns: 140px repeat(4, 1fr);
        }

        .focused-columns {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      @media (max-width: 768px) {
        .app-container {
          padding: 1rem;
        }

        .brand-icon {
          font-size: 1.5rem;
        }

        .brand-text h1 {
          font-size: 1.5rem;
        }

        .brand-tagline {
          font-size: 0.75rem;
        }

        .header-content {
          flex-direction: column;
          align-items: stretch;
        }

        .header-actions {
          justify-content: space-between;
        }

        .columns-header {
          display: none;
        }

        .swimlane {
          grid-template-columns: 1fr;
          gap: 0.75rem;
        }

        .focused-columns {
          grid-template-columns: 1fr;
        }
      }
    `),
    React.createElement('div', { className: 'header' },
      React.createElement('div', { className: 'header-content' },
        React.createElement('div', { className: 'brand' },
          React.createElement('div', { className: 'brand-icon' }, '🏰'),
          React.createElement('div', { className: 'brand-text' },
            React.createElement('h1', null, 'Fiona'),
            React.createElement('div', { className: 'brand-tagline' }, 'Family management, minus the chaos')
          )
        ),
        React.createElement('div', { className: 'header-actions' },
          React.createElement('div', { style: { position: 'relative' } },
            React.createElement('button', {
              className: `filter-btn ${activeFilterCount > 0 ? 'active' : ''}`,
              onClick: () => setShowFilters(!showFilters)
            },
              React.createElement(Filter, { size: 16 }),
              React.createElement('span', null, 'Filter'),
              activeFilterCount > 0 && React.createElement('span', { className: 'filter-badge' }, activeFilterCount)
            ),
            showFilters && React.createElement('div', { className: 'filter-dropdown' },
              React.createElement('div', { className: 'filter-section' },
                React.createElement('label', null, 'Assignee'),
                React.createElement('div', {
                  className: `filter-option ${!filters.assignee ? 'selected' : ''}`,
                  onClick: () => setFilters({ ...filters, assignee: null })
                }, 'Everyone'),
                ASSIGNEES.map(assignee =>
                  React.createElement('div', {
                    key: assignee,
                    className: `filter-option ${filters.assignee === assignee ? 'selected' : ''}`,
                    onClick: () => setFilters({ ...filters, assignee })
                  }, assignee)
                )
              ),
              React.createElement('div', { className: 'filter-section' },
                React.createElement('label', null, 'Priority'),
                React.createElement('div', {
                  className: `filter-option ${!filters.priority ? 'selected' : ''}`,
                  onClick: () => setFilters({ ...filters, priority: null })
                }, 'All Priorities'),
                PRIORITIES.map(priority =>
                  React.createElement('div', {
                    key: priority.id,
                    className: `filter-option ${filters.priority === priority.id ? 'selected' : ''}`,
                    onClick: () => setFilters({ ...filters, priority: priority.id })
                  }, `${priority.icon} ${priority.label}`)
                )
              ),
              React.createElement('div', { className: 'filter-section' },
                React.createElement('label', { className: 'filter-checkbox' },
                  React.createElement('input', {
                    type: 'checkbox',
                    checked: filters.overdue,
                    onChange: (e) => setFilters({ ...filters, overdue: e.target.checked })
                  }),
                  React.createElement('span', null, 'Overdue Only')
                )
              )
            )
          ),
          React.createElement('button', {
            className: 'add-task-btn',
            onClick: () => setShowNewTaskForm(true)
          },
            React.createElement(Plus, { size: 18 }),
            React.createElement('span', null, 'New Task')
          )
        )
      )
    ),
    React.createElement('div', { className: 'board-container' },
      viewMode === 'swimlane' ? SwimlaneView() : FocusedView()
    ),
    showNewTaskForm && React.createElement('div', {
      className: 'modal-overlay',
      onClick: () => setShowNewTaskForm(false)
    },
      React.createElement('div', {
        className: 'modal-content',
        style: { maxWidth: '600px' },
        onClick: (e) => e.stopPropagation()
      },
        React.createElement('div', { className: 'modal-header' },
          React.createElement('div', null,
            React.createElement('div', { className: 'task-meta-tag' }, 'New Task'),
            React.createElement('h2', null, 'What needs doing?')
          ),
          React.createElement('button', {
            onClick: () => setShowNewTaskForm(false),
            className: 'modal-close'
          }, React.createElement(X, { size: 24 }))
        ),
        React.createElement('div', { style: { padding: '2rem' } },
          React.createElement('div', { className: 'form-group' },
            React.createElement('label', null, 'Title'),
            React.createElement('input', {
              type: 'text',
              value: newTask.title,
              onChange: (e) => setNewTask({ ...newTask, title: e.target.value }),
              placeholder: 'Name this task...',
              autoFocus: true
            })
          ),
          React.createElement('div', { className: 'form-group' },
            React.createElement('label', null, 'Description'),
            React.createElement('textarea', {
              value: newTask.description,
              onChange: (e) => setNewTask({ ...newTask, description: e.target.value }),
              placeholder: 'Add any helpful details...',
              rows: 3
            })
          ),
          React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' } },
            React.createElement('div', { className: 'form-group' },
              React.createElement('label', null, 'Category'),
              React.createElement('select', {
                value: newTask.category,
                onChange: (e) => setNewTask({ ...newTask, category: e.target.value })
              }, CATEGORIES.map(cat =>
                React.createElement('option', { key: cat.id, value: cat.id }, `${cat.emoji} ${cat.id}`)
              ))
            ),
            React.createElement('div', { className: 'form-group' },
              React.createElement('label', null, 'Status'),
              React.createElement('select', {
                value: newTask.status,
                onChange: (e) => setNewTask({ ...newTask, status: e.target.value })
              }, STATUSES.map(status =>
                React.createElement('option', { key: status.id, value: status.id }, status.label)
              ))
            )
          ),
          React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' } },
            React.createElement('div', { className: 'form-group' },
              React.createElement('label', null, 'Assignee'),
              React.createElement('select', {
                value: newTask.assignee || '',
                onChange: (e) => setNewTask({ ...newTask, assignee: e.target.value || null })
              },
                React.createElement('option', { value: '' }, 'Unassigned'),
                ASSIGNEES.map(assignee =>
                  React.createElement('option', { key: assignee, value: assignee }, assignee)
                )
              )
            ),
            React.createElement('div', { className: 'form-group' },
              React.createElement('label', null, 'Priority'),
              React.createElement('select', {
                value: newTask.priority,
                onChange: (e) => setNewTask({ ...newTask, priority: e.target.value })
              }, PRIORITIES.map(p =>
                React.createElement('option', { key: p.id, value: p.id }, `${p.icon} ${p.label}`)
              ))
            )
          ),
          React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' } },
            React.createElement('div', { className: 'form-group' },
              React.createElement('label', null, 'Due Date'),
              React.createElement('input', {
                type: 'date',
                value: newTask.dueDate,
                onChange: (e) => setNewTask({ ...newTask, dueDate: e.target.value })
              })
            ),
            React.createElement('div', { className: 'form-group' },
              React.createElement('label', null, 'Effort Points'),
              React.createElement('select', {
                value: newTask.effort,
                onChange: (e) => setNewTask({ ...newTask, effort: parseInt(e.target.value) })
              }, EFFORT_POINTS.map(points =>
                React.createElement('option', { key: points, value: points }, points)
              ))
            )
          ),
          React.createElement('div', { style: { display: 'flex', gap: '0.75rem', marginTop: '2rem' } },
            React.createElement('button', {
              className: 'btn btn-secondary',
              onClick: () => setShowNewTaskForm(false)
            }, 'Cancel'),
            React.createElement('button', {
              className: 'btn btn-primary',
              onClick: handleAddTask,
              style: { flex: 1 }
            }, 'Create Task')
          )
        )
      )
    ),
    ExpandedTaskModal()
  );
}
