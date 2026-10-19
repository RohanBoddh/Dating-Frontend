/**
 * Food Vibe Selection Logic
 * Supports the 6 food vibes (Pizza, Sushi, Burgers, Pasta, Tacos, Ramen)
 * perfectly matching the user's reference screenshot.
 */

document.addEventListener('DOMContentLoaded', () => {
  const vibeGrid = document.getElementById('food-vibe-grid');
  const continueBtn = document.getElementById('continue-date-btn');

  let selectedChoice = null;

  // Restore previous selection if present
  try {
    const saved = sessionStorage.getItem('dating_selected_restaurant');
    if (saved) {
      selectedChoice = JSON.parse(saved);
      const matchVibe = document.querySelector(`.food-vibe-card[data-id="${selectedChoice.id}"]`);
      if (matchVibe) {
        matchVibe.classList.add('selected');
      }
    }
  } catch (err) {
    console.warn('Could not read session storage', err);
  }

  // Handle clicking on 3x2 food vibe cards
  if (vibeGrid) {
    const cards = vibeGrid.querySelectorAll('.food-vibe-card');
    cards.forEach((card) => {
      card.addEventListener('click', () => {
        cards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');

        const id = card.dataset.id;
        const name = card.dataset.name;

        selectedChoice = {
          id: id,
          name: name
        };

        sessionStorage.setItem('dating_selected_restaurant', JSON.stringify(selectedChoice));

        if (window.RomanticEffects) {
          window.RomanticEffects.showToast(`Yummy! ${name} is a wonderful choice! 💗`, 2500, '✨');
        }
      });
    });
  }

  // Handle continue button
  if (continueBtn) {
    continueBtn.addEventListener('click', () => {
      if (!selectedChoice) {
        if (window.RomanticEffects) {
          window.RomanticEffects.showToast('Please pick a vibe first, silly! 🙈💕', 3000, '🍕');
        }
        return;
      }

      if (window.RomanticEffects) {
        window.RomanticEffects.triggerHeartExplosion(window.innerWidth / 2, window.innerHeight / 2, 25);
      }

      setTimeout(() => {
        window.location.href = 'select-date.html';
      }, 350);
    });
  }
});
