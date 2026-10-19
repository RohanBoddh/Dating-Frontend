/**
 * Continuous Romantic Floating Hearts Background & Romantic Popups / Toasts
 * Follows Section 15 specifications with performance optimizations,
 * DOM cleanup, tab visibility handling, and prefers-reduced-motion support.
 */

(function () {
  const HEART_SYMBOLS = ['♥', '❤', '💕', '💖', '💗', '💓', '✨', '🌹'];
  const HEART_COLORS = [
    '#ff4f91', // Rose pink
    '#ff2a6d', // Bright romantic pink
    '#e91e63', // Deep rose
    '#ff6b8b', // Blush peach pink
    '#ff85a2', // Soft pastel pink
    '#ffb6c1', // Light baby pink
    '#ffffff', // Shimmering white
    '#d896ff', // Soft lilac purple
    '#f6c5af'  // Rose gold
  ];

  let container = null;
  let intervalId = null;
  let activeHeartCount = 0;
  const isMobile = window.innerWidth <= 768;
  const MAX_ACTIVE_HEARTS = isMobile ? 22 : 40;
  const SPAWN_INTERVAL = isMobile ? 480 : 320;

  // Check prefers-reduced-motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initHeartBackground() {
    if (prefersReducedMotion) return;

    container = document.querySelector('.heart-background');
    if (!container) {
      container = document.createElement('div');
      container.className = 'heart-background';
      container.setAttribute('aria-hidden', 'true');
      document.body.prepend(container);
    }

    startHeartSpawner();

    // Pause when tab is not active to save battery and memory
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        stopHeartSpawner();
      } else {
        startHeartSpawner();
      }
    });
  }

  function startHeartSpawner() {
    if (intervalId) return;
    intervalId = setInterval(() => {
      if (activeHeartCount < MAX_ACTIVE_HEARTS) {
        createFloatingHeart();
      }
    }, SPAWN_INTERVAL);
  }

  function stopHeartSpawner() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  function createFloatingHeart() {
    if (!container) return;

    const heart = document.createElement('span');
    heart.className = 'floating-heart';

    // Random symbol
    const symbol = HEART_SYMBOLS[Math.floor(Math.random() * HEART_SYMBOLS.length)];
    heart.textContent = symbol;

    // Random color
    const color = HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)];
    heart.style.color = color;

    // Soft glow shadow
    heart.style.textShadow = `0 0 ${Math.floor(Math.random() * 10 + 6)}px ${color}88`;

    // Random horizontal starting position (0% to 100%)
    const leftPercent = Math.random() * 96 + 2;
    heart.style.left = `${leftPercent}%`;

    // Random size (0.9rem to 2.2rem)
    const baseSize = (Math.random() * 1.3 + 0.9).toFixed(2);
    heart.style.fontSize = `${baseSize}rem`;

    // Random duration (6 to 11 seconds)
    const durationSec = (Math.random() * 5 + 6).toFixed(1);
    heart.style.animationDuration = `${durationSec}s`;

    // Random side-to-side drift variable passed to CSS
    const driftX = (Math.random() * 90 - 45).toFixed(0);
    const endDriftX = (Math.random() * 110 - 55).toFixed(0);
    const rotation = (Math.random() * 60 - 30).toFixed(0);

    heart.style.setProperty('--drift-x', `${driftX}px`);
    heart.style.setProperty('--end-drift-x', `${endDriftX}px`);
    heart.style.setProperty('--rot-deg', `${rotation}deg`);

    container.appendChild(heart);
    activeHeartCount++;

    // Safe self-removal when animation ends to prevent memory leaks
    heart.addEventListener('animationend', () => {
      heart.remove();
      activeHeartCount = Math.max(0, activeHeartCount - 1);
    }, { once: true });
  }

  /**
   * Heart Explosion / Confetti Burst
   * Triggers dozens of hearts flying outward from a point (e.g. Yes button or center)
   */
  function triggerHeartExplosion(originX, originY, count = 35) {
    const x = originX !== undefined ? originX : window.innerWidth / 2;
    const y = originY !== undefined ? originY : window.innerHeight / 2;

    const burstContainer = document.createElement('div');
    burstContainer.className = 'heart-burst-container';
    burstContainer.setAttribute('aria-hidden', 'true');
    document.body.appendChild(burstContainer);

    for (let i = 0; i < count; i++) {
      const particle = document.createElement('span');
      particle.className = 'burst-heart';
      particle.textContent = HEART_SYMBOLS[Math.floor(Math.random() * HEART_SYMBOLS.length)];

      const color = HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)];
      particle.style.color = color;
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;

      // Angle and distance
      const angle = (Math.PI * 2 * i) / count + (Math.random() * 0.4 - 0.2);
      const distance = Math.random() * 180 + 90;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance;
      const scale = (Math.random() * 1.2 + 0.8).toFixed(2);
      const rot = Math.random() * 360;

      particle.style.setProperty('--tx', `${tx}px`);
      particle.style.setProperty('--ty', `${ty}px`);
      particle.style.setProperty('--scale', scale);
      particle.style.setProperty('--rot', `${rot}deg`);

      burstContainer.appendChild(particle);
    }

    setTimeout(() => {
      burstContainer.remove();
    }, 1600);
  }

  /**
   * Romantic Toast Notification
   * Shows cute popup message in top-right or center with auto-dismiss
   */
  function showRomanticToast(message, duration = 3500, icon = '💖') {
    let toastArea = document.getElementById('romantic-toast-area');
    if (!toastArea) {
      toastArea = document.createElement('div');
      toastArea.id = 'romantic-toast-area';
      toastArea.className = 'romantic-toast-area';
      document.body.appendChild(toastArea);
    }

    const toast = document.createElement('div');
    toast.className = 'romantic-toast';
    toast.innerHTML = `
      <span class="toast-heart-icon">${icon}</span>
      <span class="toast-text">${message}</span>
      <button class="toast-close-btn" type="button" aria-label="Close notification">&times;</button>
    `;

    const closeBtn = toast.querySelector('.toast-close-btn');
    const removeToast = () => {
      toast.classList.add('toast-fade-out');
      toast.addEventListener('animationend', () => toast.remove(), { once: true });
    };

    closeBtn.addEventListener('click', removeToast);

    toastArea.appendChild(toast);

    if (duration > 0) {
      setTimeout(removeToast, duration);
    }
  }

  /**
   * Romantic Modal Popup
   */
  function showRomanticModal({ title, subtitle, icon = '💖', confirmText = 'Yay! 💕', onConfirm }) {
    const backdrop = document.createElement('div');
    backdrop.className = 'romantic-modal-backdrop';

    const modal = document.createElement('div');
    modal.className = 'romantic-modal-card';
    modal.innerHTML = `
      <div class="modal-heart-icon">${icon}</div>
      <h3 class="modal-title">${title}</h3>
      <p class="modal-subtitle">${subtitle}</p>
      <button class="btn btn-primary modal-action-btn" type="button">${confirmText}</button>
    `;

    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);

    const btn = modal.querySelector('.modal-action-btn');
    btn.addEventListener('click', () => {
      backdrop.classList.add('modal-closing');
      setTimeout(() => {
        backdrop.remove();
        if (typeof onConfirm === 'function') onConfirm();
      }, 350);
    });
  }

  // Initialize once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeartBackground);
  } else {
    initHeartBackground();
  }

  window.RomanticEffects = {
    showToast: showRomanticToast,
    showModal: showRomanticModal,
    triggerHeartExplosion: triggerHeartExplosion
  };
})();
