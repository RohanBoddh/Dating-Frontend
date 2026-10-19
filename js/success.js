/**
 * Success Confirmation Page Logic
 * Retrieves confirmed invitation details, formats dates,
 * renders celebration effects and supports notification retries.
 */

document.addEventListener('DOMContentLoaded', async () => {
  const confirmId = document.getElementById('confirm-id');
  const confirmRestaurant = document.getElementById('confirm-restaurant');
  const confirmDate = document.getElementById('confirm-date');
  const confirmTime = document.getElementById('confirm-time');
  const confirmNote = document.getElementById('confirm-note');
  const confirmEmailStatus = document.getElementById('confirm-email-status');
  const restartBtn = document.getElementById('restart-btn');

  // Trigger double celebration explosion on page entrance
  if (window.RomanticEffects) {
    window.RomanticEffects.triggerHeartExplosion(window.innerWidth / 2, window.innerHeight * 0.4, 55);
    setTimeout(() => {
      window.RomanticEffects.triggerHeartExplosion(window.innerWidth * 0.35, window.innerHeight * 0.3, 30);
      window.RomanticEffects.triggerHeartExplosion(window.innerWidth * 0.65, window.innerHeight * 0.3, 30);
    }, 450);
  }

  // Get ID from URL query parameters
  const urlParams = new URLSearchParams(window.location.search);
  const invitationId = urlParams.get('id');

  let invitationData = null;

  // Try loading from session first
  try {
    const cached = sessionStorage.getItem('dating_confirmed_invitation');
    if (cached) {
      invitationData = JSON.parse(cached);
    }
  } catch (e) {
    console.warn('Could not read cached invitation', e);
  }

  // Fetch verified data from backend API
  if (invitationId) {
    try {
      const apiBase = window.API_BASE_URL || '';
      const res = await fetch(`${apiBase}/api/invitations/${encodeURIComponent(invitationId)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          invitationData = json.data;
        }
      }
    } catch (err) {
      console.warn('Failed to fetch from API, using fallback data:', err);
    }
  }

  // Fallback defaults if user directly visited page
  if (!invitationData) {
    invitationData = {
      id: 'DATE-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      restaurantName: 'Made in India — Radisson Blu MBD Hotel, Noida',
      date: new Date(Date.now() + 86400000).toISOString(),
      timePreference: 'Candlelight Dinner (7:30 PM)',
      specialRequest: 'Making unforgettable memories together ❤️',
      status: 'confirmed',
      emailStatus: 'sent'
    };
  }

  const confirmSender = document.getElementById('confirm-sender');
  const confirmUserEmail = document.getElementById('confirm-user-email');
  const loveMsgBox = document.querySelector('.love-message-box');

  // Populate UI
  if (confirmId) confirmId.textContent = invitationData.id || 'DATE-CONFIRMED';
  if (confirmSender) confirmSender.textContent = invitationData.senderName || 'My Love ❤️';
  if (confirmUserEmail) confirmUserEmail.textContent = invitationData.senderEmail || 'Not specified';
  if (confirmRestaurant) confirmRestaurant.textContent = invitationData.restaurantName || 'Selected Restaurant';

  if (loveMsgBox && invitationData.senderName) {
    loveMsgBox.innerHTML = `“<strong>${invitationData.senderName}</strong>, you just made me the happiest person ever. I can't wait to spend this special day with you. Every moment with you is a memory I want to keep forever. ❤️”`;
  }
  
  if (confirmDate && invitationData.date) {
    try {
      const d = new Date(invitationData.date);
      confirmDate.textContent = d.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      confirmDate.textContent = invitationData.date;
    }
  }

  if (confirmTime) confirmTime.textContent = invitationData.timePreference || 'Evening Dinner';
  if (confirmNote) {
    confirmNote.textContent = invitationData.specialRequest || 'None (Just each other’s company 💕)';
  }

  // Email status display & retry handler
  function updateEmailStatusUI(status, id) {
    if (!confirmEmailStatus) return;

    if (status === 'sent') {
      confirmEmailStatus.innerHTML = `
        <span style="color: #00b894; font-weight: 700;">✅ Notification Sent</span>
      `;
    } else {
      confirmEmailStatus.innerHTML = `
        <span style="color: #e17055;">Saved in DB (Notification ${status})</span>
        <button id="retry-email-btn" type="button" style="margin-left: 8px; font-size: 0.78rem; padding: 2px 8px; border-radius: 12px; background: #fff0f5; border: 1px solid #ff477e; color: #d81b60; cursor: pointer;">
          Retry 🔄
        </button>
      `;

      const retryBtn = document.getElementById('retry-email-btn');
      if (retryBtn) {
        retryBtn.addEventListener('click', async () => {
          retryBtn.disabled = true;
          retryBtn.textContent = 'Sending... ⏳';

          try {
            const apiBase = window.API_BASE_URL || '';
            const retryRes = await fetch(`${apiBase}/api/invitations/${encodeURIComponent(id)}/retry-notification`, {
              method: 'POST'
            });
            const retryData = await retryRes.json();
            if (retryData.success) {
              updateEmailStatusUI('sent', id);
              if (window.RomanticEffects) {
                window.RomanticEffects.showToast('Notification email delivered! 💌', 3000, '✅');
              }
            } else {
              retryBtn.disabled = false;
              retryBtn.textContent = 'Retry 🔄';
              if (window.RomanticEffects) {
                window.RomanticEffects.showToast(retryData.message || 'Retry failed.', 3000, '⚠️');
              }
            }
          } catch (e) {
            retryBtn.disabled = false;
            retryBtn.textContent = 'Retry 🔄';
            if (window.RomanticEffects) {
              window.RomanticEffects.showToast('Network error while retrying email.', 3000, '⚠️');
            }
          }
        });
      }
    }
  }

  updateEmailStatusUI(invitationData.emailStatus || 'sent', invitationData.id);

  // Restart / Plan another memory
  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      sessionStorage.removeItem('dating_confirmed_invitation');
      sessionStorage.removeItem('dating_selected_restaurant');
      sessionStorage.removeItem('date_proposal_accepted');
      window.location.href = 'index.html';
    });
  }
});
