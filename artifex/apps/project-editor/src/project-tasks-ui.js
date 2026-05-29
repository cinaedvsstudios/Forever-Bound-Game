import { createHealthReport } from '../../../shared/health-guide/health-checks.js?v=0.1.31-tasks';
import { createProjectManagerTodoOutput } from '../../../shared/health-guide/todo-output.js?v=0.1.31-tasks';

// Artifex Project Manager Tasks workspace
// Displays generated project-manager to-do items from the shared Health Guide.

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeTodos(stateManager) {
  const existing = stateManager?.state?.projectTodos;
  if (existing?.schemaVersion === 'artifex.todos.v1' && Array.isArray(existing.tasks)) return existing;

  const report = createHealthReport({ stateManager, scope: 'project-manager-tasks' });
  const generated = createProjectManagerTodoOutput(report);
  if (stateManager?.state) stateManager.state.projectTodos = generated;
  stateManager?.saveToStorage?.();
  return generated;
}

function getUniqueValues(tasks, getter) {
  return [...new Set(tasks.map(getter).filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b)));
}

function priorityLabel(value) {
  const priority = Number(value) || 0;
  if (priority >= 5) return 'P5 Critical';
  if (priority === 4) return 'P4 High';
  if (priority === 3) return 'P3 Medium';
  if (priority === 2) return 'P2 Low';
  return `P${priority}`;
}

function renderTaskCard(task, selectedTaskId) {
  const selected = task.taskId === selectedTaskId;
  return `
    <button data-task-id="${escapeHtml(task.taskId)}" class="w-full text-left rounded-xl border ${selected ? 'border-projectGold/70 bg-accentDark/45' : 'border-[#2d2d42] bg-black/25 hover:border-projectGold/40 hover:bg-accentDark/20'} p-3 transition">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <div class="text-xs font-bold text-zinc-100 truncate">${escapeHtml(task.title)}</div>
          <div class="mt-1 text-[9px] font-mono text-zinc-600 truncate">${escapeHtml(task.taskId)}</div>
        </div>
        <span class="text-[9px] font-mono text-projectGoldGlow border border-projectGold/30 rounded-full px-2 py-0.5 bg-black/20">${escapeHtml(task.status || 'open')}</span>
      </div>
      <div class="mt-2 text-[10px] text-zinc-500 line-clamp-2">${escapeHtml(task.description || 'No description.')}</div>
      <div class="mt-3 flex flex-wrap gap-1.5 text-[9px] font-mono">
        <span class="rounded bg-black/35 border border-zinc-800 px-1.5 py-0.5 text-projectGoldGlow">${escapeHtml(priorityLabel(task.priority))}</span>
        <span class="rounded bg-black/35 border border-zinc-800 px-1.5 py-0.5 text-zinc-500">owner: ${escapeHtml(task.fixOwner || task.owningModule || 'project-manager')}</span>
        <span class="rounded bg-black/35 border border-zinc-800 px-1.5 py-0.5 text-zinc-500">effort: ${escapeHtml(task.effort ?? '-')}</span>
      </div>
    </button>
  `;
}

function renderTaskDetail(task, todos) {
  if (!task) {
    return `
      <h3 class="text-sm font-bold text-projectGoldGlow mb-2">Task detail</h3>
      <p class="text-xs text-zinc-500 leading-relaxed">Select a task to inspect its status, owner, module, source check and generated metadata.</p>
      <div class="mt-4 rounded-lg border border-[#2d2d42] bg-black/30 p-3 text-[10px] font-mono text-zinc-500 space-y-1">
        <div>generated: ${escapeHtml(todos.generatedAt || 'unknown')}</div>
        <div>tasks: ${escapeHtml(todos.tasks?.length || 0)}</div>
        <div>source: ${escapeHtml(todos.generatedFrom || todos.healthReportScope || 'shared-health-guide')}</div>
      </div>
    `;
  }

  return `
    <h3 class="text-sm font-bold text-projectGoldGlow mb-2">${escapeHtml(task.title)}</h3>
    <p class="text-xs text-zinc-400 leading-relaxed">${escapeHtml(task.description || 'No description.')}</p>
    <div class="mt-4 rounded-lg border border-[#2d2d42] bg-black/30 p-3 text-[10px] font-mono text-zinc-500 space-y-1">
      <div>taskId: ${escapeHtml(task.taskId)}</div>
      <div>status: ${escapeHtml(task.status)}</div>
      <div>priority: ${escapeHtml(priorityLabel(task.priority))}</div>
      <div>effort: ${escapeHtml(task.effort ?? '-')}</div>
      <div>fixOwner: ${escapeHtml(task.fixOwner || 'project-manager')}</div>
      <div>owningModule: ${escapeHtml(task.owningModule || 'project-manager')}</div>
      <div>relatedModules: ${escapeHtml(safeArray(task.relatedModules).join(', ') || 'none')}</div>
      <div>source: ${escapeHtml(task.source || 'shared-health-guide')}</div>
      <div>projectFile: ${escapeHtml(task.projectFile || 'none')}</div>
      <div>appFile: ${escapeHtml(task.appFile || 'none')}</div>
      <div>generated: ${escapeHtml(todos.generatedAt || 'unknown')}</div>
    </div>
    <div class="mt-4">
      <div class="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-2">Tags</div>
      <div class="flex flex-wrap gap-1.5">
        ${safeArray(task.tags).map((tag) => `<span class="rounded-full border border-projectGold/20 bg-accentDark/25 px-2 py-0.5 text-[9px] text-projectGoldGlow">${escapeHtml(tag)}</span>`).join('') || '<span class="text-[10px] text-zinc-600">No tags</span>'}
      </div>
    </div>
  `;
}

export function renderProjectTasks({ stateManager, container, onRefresh } = {}) {
  if (!container || !stateManager) return;

  const todos = normalizeTodos(stateManager);
  const tasks = safeArray(todos.tasks);
  let selectedTaskId = container.dataset.selectedTaskId || tasks[0]?.taskId || '';
  const statusFilter = container.dataset.statusFilter || 'all';
  const ownerFilter = container.dataset.ownerFilter || 'all';
  const priorityFilter = container.dataset.priorityFilter || 'all';

  const owners = getUniqueValues(tasks, (task) => task.fixOwner || task.owningModule || 'project-manager');
  const statuses = getUniqueValues(tasks, (task) => task.status || 'open');
  const priorities = getUniqueValues(tasks, (task) => String(Number(task.priority) || 0));

  const filteredTasks = tasks.filter((task) => {
    const owner = task.fixOwner || task.owningModule || 'project-manager';
    const priority = String(Number(task.priority) || 0);
    if (statusFilter !== 'all' && (task.status || 'open') !== statusFilter) return false;
    if (ownerFilter !== 'all' && owner !== ownerFilter) return false;
    if (priorityFilter !== 'all' && priority !== priorityFilter) return false;
    return true;
  });

  if (!filteredTasks.some((task) => task.taskId === selectedTaskId)) selectedTaskId = filteredTasks[0]?.taskId || '';
  const selectedTask = tasks.find((task) => task.taskId === selectedTaskId) || null;

  container.innerHTML = `
    <div class="h-full overflow-hidden p-5">
      <div class="h-full max-w-7xl mx-auto bg-cardDark/85 border border-projectGold/25 rounded-2xl shadow-card-glow overflow-hidden grid grid-rows-[auto_auto_1fr]">
        <header class="px-5 py-4 border-b border-[#2d2d42] flex items-center justify-between gap-4">
          <div>
            <h2 class="text-lg font-bold text-zinc-100 tracking-wide">Project Tasks / To-Do Board</h2>
            <p class="text-xs text-zinc-500">Generated from the shared Health Guide and saved as <span class="font-mono text-projectGoldGlow">todos/project-manager-todos.json</span>.</p>
            <p class="mt-1 text-[10px] font-mono text-zinc-600">generated: ${escapeHtml(todos.generatedAt || 'unknown')} · health scope: ${escapeHtml(todos.healthReportScope || 'project-manager')}</p>
          </div>
          <div class="text-right text-[10px] font-mono text-zinc-500">
            <div>total: <span class="text-projectGoldGlow font-bold">${tasks.length}</span></div>
            <div>visible: <span class="text-projectGoldGlow font-bold">${filteredTasks.length}</span></div>
          </div>
        </header>

        <section class="px-5 py-3 border-b border-[#2d2d42] grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-3">
          <label class="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
            Status
            <select id="projectTaskStatusFilter" class="mt-1 w-full bg-black/40 border border-[#2d2d42] rounded-lg px-2 py-2 text-xs text-zinc-200 focus:outline-none focus:border-projectGold/50">
              <option value="all" ${statusFilter === 'all' ? 'selected' : ''}>All statuses</option>
              ${statuses.map((status) => `<option value="${escapeHtml(status)}" ${statusFilter === status ? 'selected' : ''}>${escapeHtml(status)}</option>`).join('')}
            </select>
          </label>
          <label class="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
            Owner / Module
            <select id="projectTaskOwnerFilter" class="mt-1 w-full bg-black/40 border border-[#2d2d42] rounded-lg px-2 py-2 text-xs text-zinc-200 focus:outline-none focus:border-projectGold/50">
              <option value="all" ${ownerFilter === 'all' ? 'selected' : ''}>All owners</option>
              ${owners.map((owner) => `<option value="${escapeHtml(owner)}" ${ownerFilter === owner ? 'selected' : ''}>${escapeHtml(owner)}</option>`).join('')}
            </select>
          </label>
          <label class="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
            Priority
            <select id="projectTaskPriorityFilter" class="mt-1 w-full bg-black/40 border border-[#2d2d42] rounded-lg px-2 py-2 text-xs text-zinc-200 focus:outline-none focus:border-projectGold/50">
              <option value="all" ${priorityFilter === 'all' ? 'selected' : ''}>All priorities</option>
              ${priorities.map((priority) => `<option value="${escapeHtml(priority)}" ${priorityFilter === priority ? 'selected' : ''}>${escapeHtml(priorityLabel(priority))}</option>`).join('')}
            </select>
          </label>
          <div class="flex items-end">
            <button id="refreshProjectTasksBtn" class="w-full px-3 py-2 rounded-lg border border-projectGold/30 text-xs font-bold text-projectGoldGlow hover:bg-accentDark/50 transition">Regenerate</button>
          </div>
        </section>

        <main class="grid grid-cols-[minmax(360px,1fr)_360px] min-h-0">
          <section class="overflow-y-auto p-5 space-y-3" id="projectTaskList">
            ${filteredTasks.length ? filteredTasks.map((task) => renderTaskCard(task, selectedTaskId)).join('') : '<div class="rounded-xl border border-dashed border-projectGold/25 bg-black/20 p-6 text-center text-xs text-zinc-500">No tasks match the current filters.</div>'}
          </section>
          <aside id="projectTaskDetail" class="border-l border-[#2d2d42] bg-black/20 p-4 overflow-y-auto">
            ${renderTaskDetail(selectedTask, todos)}
          </aside>
        </main>
      </div>
    </div>
  `;

  function rerenderWithDataset(patch = {}) {
    Object.entries(patch).forEach(([key, value]) => {
      container.dataset[key] = value;
    });
    renderProjectTasks({ stateManager, container, onRefresh });
  }

  container.querySelectorAll('[data-task-id]').forEach((button) => {
    button.addEventListener('click', () => rerenderWithDataset({ selectedTaskId: button.dataset.taskId || '' }));
  });

  container.querySelector('#projectTaskStatusFilter')?.addEventListener('change', (event) => rerenderWithDataset({ statusFilter: event.target.value, selectedTaskId: '' }));
  container.querySelector('#projectTaskOwnerFilter')?.addEventListener('change', (event) => rerenderWithDataset({ ownerFilter: event.target.value, selectedTaskId: '' }));
  container.querySelector('#projectTaskPriorityFilter')?.addEventListener('change', (event) => rerenderWithDataset({ priorityFilter: event.target.value, selectedTaskId: '' }));
  container.querySelector('#refreshProjectTasksBtn')?.addEventListener('click', () => {
    const report = createHealthReport({ stateManager, scope: 'project-manager-tasks' });
    stateManager.state.projectTodos = createProjectManagerTodoOutput(report);
    stateManager.saveToStorage?.();
    onRefresh?.({ soft: true });
    rerenderWithDataset({ selectedTaskId: '', statusFilter: 'all', ownerFilter: 'all', priorityFilter: 'all' });
  });

  if (window.lucide) window.lucide.createIcons();
}
