import 'bootstrap/js/src/dropdown.js';

const ACTIVE_CLASS = 'active';
const dropdown = document.querySelector('#mode-toggle + .dropdown-menu');
const activeMode = Theme.isSystemTheme
  ? Theme.Mode.SYSTEM
  : Theme.resolvedTheme;

export function modeWatcher() {
  if (!Theme.isToggleable || !dropdown) {
    return;
  }

  dropdown.querySelectorAll('.dropdown-item').forEach((option) => {
    if (option.dataset.themeMode === activeMode) {
      option.classList.add(ACTIVE_CLASS);
    }
  });

  dropdown.addEventListener('click', (event) => {
    const current = event.target.closest('.dropdown-item');
    if (!current) return;

    const lastActive = dropdown.querySelector(`.${ACTIVE_CLASS}`);
    if (lastActive === current) return;

    lastActive?.classList.remove(ACTIVE_CLASS);
    current.classList.add(ACTIVE_CLASS);
    Theme.update(current.dataset.themeMode);
  });
}
