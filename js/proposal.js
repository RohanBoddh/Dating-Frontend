/**
 * Proposal Page Interaction Logic
 * Runaway "No" button with smooth, gentle evasion:
 * - Glides away smoothly by a gentle distance whenever cursor or touch approaches
 * - Strictly clamped to remain visible at all times (never hides or vanishes)
 * - Cannot be clicked on desktop, phone, or tablet
 */

document.addEventListener('DOMContentLoaded', () => {
  const yesBtn = document.getElementById('yes-btn');
  const noBtn = document.getElementById('no-btn');
  const proposalCard = document.getElementById('proposal-card');
  const reactionCard = document.getElementById('reaction-card');
  const continueToFoodBtn = document.getElementById('continue-to-food-btn');
  const hintMsg = document.getElementById('hint-msg');

  // Playful hint messages when she chases the No button
  const teaseMessages = [
    'Nice try! 😜',
    'Hehe, too slow! 🏃‍♀️💨',
    'Nope, not letting you click that! 🙈',
    'Just click YES already! 🥹💖',
    'You know you want to say yes! 🥰',
    'Error 404: "No" button unavailable! 😂❤️',
    'I will run away forever! 🏃‍♂️✨',
    'Come on, pretty please? 🥺🌹'
  ];
  let teaseIndex = 0;

  // Initial welcome toast
  if (window.RomanticEffects) {
    setTimeout(() => {
      window.RomanticEffects.showToast('Someone special is waiting for your YES ❤️', 4000, '💌');
    }, 800);
  }

  // Current translation offsets (starts at 0, 0)
  let currentOffsetX = 0;
  let currentOffsetY = 0;
  let isMoving = false;

  /**
   * Smooth, gentle evasion:
   * Moves the No button away from (pointerX, pointerY) by a gentle distance (70-95px).
   * Clamped so the button NEVER hides, never leaves the screen, and stays visible.
   */
  function dodgeAway(pointerX, pointerY) {
    if (!noBtn || isMoving) return;
    isMoving = true;

    const noRect = noBtn.getBoundingClientRect();
    const yesRect = yesBtn.getBoundingClientRect();

    const noCenterX = noRect.left + noRect.width / 2;
    const noCenterY = noRect.top + noRect.height / 2;

    // Vector from pointer to button center
    let dx = noCenterX - (pointerX !== undefined ? pointerX : noCenterX - 10);
    let dy = noCenterY - (pointerY !== undefined ? pointerY : noCenterY - 10);

    // If pointer is right on center, pick a random angle
    if (Math.abs(dx) < 1 && Math.abs(dy) < 1) {
      const randomAngle = Math.random() * Math.PI * 2;
      dx = Math.cos(randomAngle);
      dy = Math.sin(randomAngle);
    }

    // Normalize vector
    const length = Math.hypot(dx, dy) || 1;
    const unitX = dx / length;
    const unitY = dy / length;

    // Gentle step distance (70px to 95px)
    const stepDistance = 75 + Math.random() * 20;

    let targetX = currentOffsetX + unitX * stepDistance;
    let targetY = currentOffsetY + unitY * stepDistance;

    // Boundary constraints dynamically calculated so it NEVER clips or goes offscreen on any device
    const isMobile = window.innerWidth <= 768;
    const maxBoundX = isMobile ? Math.max(60, Math.min(100, Math.floor(window.innerWidth * 0.22))) : 180;
    const minBoundX = -maxBoundX;
    const maxBoundY = isMobile ? Math.max(50, Math.min(80, Math.floor(window.innerHeight * 0.12))) : 130;
    const minBoundY = -maxBoundY;

    // If pushing out of bounds, bounce back smoothly in opposite direction
    if (targetX > maxBoundX) targetX = maxBoundX - 35;
    if (targetX < minBoundX) targetX = minBoundX + 35;
    if (targetY > maxBoundY) targetY = maxBoundY - 25;
    if (targetY < minBoundY) targetY = minBoundY + 25;

    // Check if new position would land on top of the Yes button
    const projectedCenterY = noCenterY + (targetY - currentOffsetY);
    const projectedCenterX = noCenterX + (targetX - currentOffsetX);

    const overlapYes =
      projectedCenterX > yesRect.left - 20 &&
      projectedCenterX < yesRect.right + 20 &&
      projectedCenterY > yesRect.top - 20 &&
      projectedCenterY < yesRect.bottom + 20;

    if (overlapYes) {
      // Deflect sideways or upwards away from Yes button
      targetX = targetX > 0 ? targetX + 40 : targetX - 40;
      targetY = targetY < 0 ? targetY - 40 : targetY + 40;
    }

    currentOffsetX = Math.round(targetX);
    currentOffsetY = Math.round(targetY);

    // Apply smooth CSS transform
    noBtn.style.transform = `translate3d(${currentOffsetX}px, ${currentOffsetY}px, 0)`;

    // Update sweet tease message
    if (hintMsg) {
      hintMsg.textContent = teaseMessages[teaseIndex % teaseMessages.length];
      teaseIndex++;
    }

    setTimeout(() => {
      isMoving = false;
    }, 360);
  }

  // 1. Proximity detection on Desktop (moves smoothly when cursor is within 65px)
  document.addEventListener('mousemove', (e) => {
    if (!noBtn || isMoving) return;
    const rect = noBtn.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dist = Math.hypot(e.clientX - centerX, e.clientY - centerY);
    if (dist < 65) {
      dodgeAway(e.clientX, e.clientY);
    }
  });

  // 2. Direct hover on desktop
  noBtn.addEventListener('mouseenter', (e) => {
    dodgeAway(e.clientX, e.clientY);
  });

  // 3. Touch devices (Phones & Tablets): moves before touch can tap
  noBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const touch = e.touches[0] || e.changedTouches[0];
    dodgeAway(touch ? touch.clientX : undefined, touch ? touch.clientY : undefined);
  }, { passive: false });

  noBtn.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dodgeAway(e.clientX, e.clientY);
  });

  // 4. Click & Keyboard focus prevention
  noBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dodgeAway();
  });

  noBtn.addEventListener('focus', () => {
    noBtn.blur();
    dodgeAway();
  });

  /**
   * Yes button clicked!
   */
  yesBtn.addEventListener('click', (e) => {
    sessionStorage.setItem('date_proposal_accepted', 'true');

    const rect = yesBtn.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    if (window.RomanticEffects) {
      window.RomanticEffects.triggerHeartExplosion(centerX, centerY, 45);
      window.RomanticEffects.showToast('Yayyyy! You said YES! 🥹💕', 3500, '🎉');
    }

    setTimeout(() => {
      proposalCard.style.display = 'none';
      reactionCard.style.display = 'block';
    }, 400);
  });

  /**
   * Continue from reaction to food selection
   */
  if (continueToFoodBtn) {
    continueToFoodBtn.addEventListener('click', () => {
      if (window.RomanticEffects) {
        window.RomanticEffects.triggerHeartExplosion(window.innerWidth / 2, window.innerHeight / 2, 25);
      }
      setTimeout(() => {
        window.location.href = 'restaurants.html';
      }, 350);
    });
  }
});
