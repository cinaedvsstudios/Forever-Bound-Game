// Puzzle Chooser Reset V1

function showPuzzleChooserScreen() {
  document.body.classList.add('is-puzzle-chooser');
  document.body.classList.remove('is-puzzle-brief', 'is-obstacle-course');

  const launcher = document.getElementById('puzzle-launcher-panel');
  if (launcher) launcher.hidden = false;

  const brief = document.getElementById('puzzle-module-brief-page');
  if (brief) brief.hidden = true;

  document.querySelectorAll('[data-panel-content]').forEach((panel) => {
    panel.hidden = true;
    panel.classList.remove('is-active');
  });
}

function populatePuzzleChooserGrid() {
  const grid = document.getElementById('puzzle-type-grid') || document.querySelector('#puzzle-launcher-panel .puzzle-type-grid');
  if (!grid || grid.children.length) return;

  grid.innerHTML = [
    ['maze-labyrinth', 'Labyrinth Maze', 'Build a maze / route puzzle.'],
    ['arena-trial', 'Arena Trial', 'Plan an arena or trial encounter.'],
    ['obstacle-course', 'Horse Forest Ride', 'Build the horse forest obstacle course.'],
    ['symbol-assembly', 'Symbol Assembly', 'Plan a symbol / rune assembly puzzle.'],
    ['item-order-puzzle', 'Item Order Puzzle', 'Plan an ordered item or potion sequence.'],
    ['hazard-puzzle', 'Hazard Puzzle', 'Plan a trap, hazard, or survival puzzle.']
  ].map(([id, title, copy]) => `<button type="button" class="puzzle-type-option" data-engine="${id}"><span class="engine-icon">•</span><span class="puzzle-type-copy"><strong>${title}</strong><small>${copy}</small></span><span class="puzzle-type-arrow">›</span></button>`).join('');
}

function boot() {
  populatePuzzleChooserGrid();
  showPuzzleChooserScreen();
  setTimeout(populatePuzzleChooserGrid, 250);
  setTimeout(showPuzzleChooserScreen, 300);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
else boot();
