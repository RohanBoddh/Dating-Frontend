/**
 * Date & Time Picker Interaction Logic
 * Enforces local date min restrictions, live readable date formatting,
 * time chips, input validation and API submission to backend.
 */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('date-selection-form');
  const dateInput = document.getElementById('date-input');
  const datePreviewText = document.getElementById('date-preview-text');
  const restaurantNamePreview = document.getElementById('restaurant-name-preview');
  const confirmBtn = document.getElementById('confirm-date-btn');
  const timeChips = document.querySelectorAll('.time-chip');
  const timePreferenceInput = document.getElementById('time-preference-input');

  let selectedRestaurant = null;

  // 1. Check if a restaurant was selected
  try {
    const saved = sessionStorage.getItem('dating_selected_restaurant');
    if (saved) {
      selectedRestaurant = JSON.parse(saved);
      if (restaurantNamePreview) {
        restaurantNamePreview.textContent = selectedRestaurant.name;
      }
    } else {
      // Default fallback so user doesn't get stuck if directly visiting page
      selectedRestaurant = {
        id: 'made-in-india',
        name: 'Made in India — Radisson Blu MBD Hotel, Noida'
      };
      if (restaurantNamePreview) {
        restaurantNamePreview.textContent = selectedRestaurant.name;
      }
    }
  } catch (e) {
    console.error('Error reading selected restaurant', e);
  }

  // 2. Set min selectable date to today's local date
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;

  if (dateInput) {
    dateInput.min = todayStr;

    // Default to upcoming weekend or tomorrow if today is late
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const tomorrowMonth = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const tomorrowDay = String(tomorrow.getDate()).padStart(2, '0');
    dateInput.value = `${tomorrow.getFullYear()}-${tomorrowMonth}-${tomorrowDay}`;
    updateDateDisplay(dateInput.value, false);
  }

  // 3. Format date nicely for human display
  function updateDateDisplay(dateVal, showToastNotification = true) {
    if (!dateVal) {
      datePreviewText.textContent = 'Please pick a lovely date on the calendar above 💕';
      return;
    }

    const [y, m, d] = dateVal.split('-').map(Number);
    const selectedDate = new Date(y, m - 1, d);

    if (isNaN(selectedDate.getTime())) {
      datePreviewText.textContent = 'Invalid date selected';
      return;
    }

    const formatted = selectedDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    datePreviewText.innerHTML = `🌟 Selected: <strong>${formatted}</strong> — Every day with you is special ❤️`;

    if (showToastNotification && window.RomanticEffects) {
      window.RomanticEffects.showToast('This day is going to be special! 🥰', 2800, '📅');
    }
  }

  if (dateInput) {
    dateInput.addEventListener('change', (e) => {
      updateDateDisplay(e.target.value, true);
    });
  }

  // 4. Time Slot Chips selection
  timeChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      timeChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const timeVal = chip.dataset.time || chip.textContent.trim();
      if (timePreferenceInput) {
        timePreferenceInput.value = timeVal;
      }
    });
  });

  // 5. Form submission & API request
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const chosenDate = dateInput ? dateInput.value : '';
      if (!chosenDate) {
        if (window.RomanticEffects) {
          window.RomanticEffects.showToast('Please pick a date for our memory! 📅💕', 3500, '⏳');
        }
        dateInput.focus();
        return;
      }

      // Check for past date
      if (chosenDate < todayStr) {
        if (window.RomanticEffects) {
          window.RomanticEffects.showToast('Our date must be in the future, silly! ⏳ Pick today or upcoming day.', 4000, '🙈');
        }
        return;
      }

      const userNameInput = document.getElementById('user-name-input');
      const senderName = userNameInput ? userNameInput.value.trim() : '';

      if (!senderName) {
        if (window.RomanticEffects) {
          window.RomanticEffects.showToast('Please enter your Real Name so Rohan knows who confirmed! 🥰💕', 3500, '✍️');
        }
        if (userNameInput) userNameInput.focus();
        return;
      }

      const userEmailInput = document.getElementById('user-email-input');
      const senderEmail = userEmailInput ? userEmailInput.value.trim().toLowerCase() : '';

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!senderEmail || !emailRegex.test(senderEmail)) {
        if (window.RomanticEffects) {
          window.RomanticEffects.showToast('Please enter your valid Email Address (Gmail)! 📧💕', 3500, '💌');
        }
        if (userEmailInput) userEmailInput.focus();
        return;
      }

      const payload = {
        senderName: senderName,
        senderEmail: senderEmail,
        restaurantId: selectedRestaurant ? selectedRestaurant.id : 'made-in-india',
        date: chosenDate,
        timePreference: timePreferenceInput ? timePreferenceInput.value : 'Evening Dinner',
        specialRequest: document.getElementById('special-request')?.value.trim() || ''
      };

      // Loading state
      confirmBtn.disabled = true;
      confirmBtn.innerHTML = `
        <span class="spinner-hearts">💖</span> Planning Our Magical Date... 💖
      `;

      try {
        const apiBase = window.API_BASE_URL || '';
        const response = await fetch(`${apiBase}/api/invitations`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || 'Failed to save date invitation.');
        }

        // Store confirmation data
        sessionStorage.setItem('dating_confirmed_invitation', JSON.stringify(result.data));

        if (window.RomanticEffects) {
          window.RomanticEffects.triggerHeartExplosion(window.innerWidth / 2, window.innerHeight / 2, 50);
          window.RomanticEffects.showToast('Our Date is Confirmed! 💑💖', 3000, '🎉');
        }

        setTimeout(() => {
          window.location.href = `success.html?id=${encodeURIComponent(result.data.id)}`;
        }, 600);

      } catch (err) {
        console.error('Submission error:', err);
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = `<span class="btn-text">Confirm Our Date 💖</span>`;

        if (window.RomanticEffects) {
          window.RomanticEffects.showModal({
            title: 'Oops, A Little Hiccup! 🙈',
            subtitle: err.message || 'Could not connect to the server. Would you like to retry?',
            icon: '💌',
            confirmText: 'Retry Now 💕',
            onConfirm: () => {
              form.requestSubmit();
            }
          });
        } else {
          alert('Error: ' + err.message);
        }
      }
    });
  }
});
