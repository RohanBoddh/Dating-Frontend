/**
 * Romantic Background Music Synthesizer & Player
 * Uses Web Audio API to generate a soothing, gentle romantic music box melody
 * completely offline with zero external audio assets required.
 */

(function () {
  let audioCtx = null;
  let isPlaying = false;
  let stepTimeout = null;
  let currentNoteIndex = 0;

  // Romantic music-box melody & arpeggio chords (Notes in Hz)
  const NOTES = {
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
    C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
    C6: 1046.50
  };

  // Heartfelt romantic progression: C -> G/B -> Am7 -> Fadd9 (Can't Help Falling in Love vibe)
  const MELODY_SEQUENCE = [
    // Phrase 1: C Major
    { note: NOTES.C5, dur: 0.6, bass: NOTES.C4 },
    { note: NOTES.E5, dur: 0.4 },
    { note: NOTES.G5, dur: 0.5 },
    { note: NOTES.C6, dur: 0.7 },
    { note: NOTES.G5, dur: 0.4 },
    { note: NOTES.E5, dur: 0.4 },

    // Phrase 2: G Major
    { note: NOTES.B4, dur: 0.6, bass: NOTES.G4 },
    { note: NOTES.D5, dur: 0.4 },
    { note: NOTES.G5, dur: 0.6 },
    { note: NOTES.B5, dur: 0.6 },
    { note: NOTES.G5, dur: 0.4 },

    // Phrase 3: A Minor
    { note: NOTES.A4, dur: 0.6, bass: NOTES.A4 / 2 },
    { note: NOTES.C5, dur: 0.4 },
    { note: NOTES.E5, dur: 0.5 },
    { note: NOTES.A5, dur: 0.7 },
    { note: NOTES.E5, dur: 0.4 },
    { note: NOTES.C5, dur: 0.4 },

    // Phrase 4: F Major (Tender resolution)
    { note: NOTES.F4, dur: 0.6, bass: NOTES.F4 / 2 },
    { note: NOTES.A4, dur: 0.4 },
    { note: NOTES.C5, dur: 0.5 },
    { note: NOTES.G5, dur: 0.6 },
    { note: NOTES.F5, dur: 0.5 },
    { note: NOTES.E5, dur: 0.4 },
    { note: NOTES.D5, dur: 0.6 }
  ];

  function initAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playBellNote(frequency, time, duration = 0.8, isBass = false) {
    if (!audioCtx || !isPlaying) return;

    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      // Soft music box bell timbre: Sine wave + gentle chime overtone
      osc.type = isBass ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(frequency, time);

      // Bell envelope (quick attack, long gentle ringing decay)
      const now = time;
      const volume = isBass ? 0.08 : 0.05;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(volume, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration * 1.8);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + duration * 2);
    } catch {
      // Audio context might be restricted
    }
  }

  function scheduleNextNote() {
    if (!isPlaying) return;

    const item = MELODY_SEQUENCE[currentNoteIndex];
    const now = audioCtx.currentTime;

    // Play main chime
    playBellNote(item.note, now, item.dur || 0.6, false);

    // Play warm bass note if specified
    if (item.bass) {
      playBellNote(item.bass, now, 1.2, true);
    }

    currentNoteIndex = (currentNoteIndex + 1) % MELODY_SEQUENCE.length;

    const delayMs = (item.dur || 0.5) * 600;
    stepTimeout = setTimeout(scheduleNextNote, delayMs);
  }

  function startMusic() {
    initAudioContext();
    isPlaying = true;
    currentNoteIndex = 0;
    sessionStorage.setItem('dating_music_active', 'true');
    scheduleNextNote();
    updateUI(true);
  }

  function stopMusic() {
    isPlaying = false;
    sessionStorage.setItem('dating_music_active', 'false');
    if (stepTimeout) {
      clearTimeout(stepTimeout);
      stepTimeout = null;
    }
    updateUI(false);
  }

  function toggleMusic() {
    if (isPlaying) {
      stopMusic();
    } else {
      startMusic();
    }
  }

  function updateUI(playing) {
    const btn = document.getElementById('music-toggle-btn');
    if (!btn) return;

    if (playing) {
      btn.classList.add('is-playing');
      btn.setAttribute('aria-label', 'Pause Romantic Music');
      btn.innerHTML = `
        <span class="music-icon-pulse">🎵</span>
        <span class="music-label">Playing Romantic Melody...</span>
        <span class="music-waves">
          <i></i><i></i><i></i><i></i>
        </span>
      `;
    } else {
      btn.classList.remove('is-playing');
      btn.setAttribute('aria-label', 'Play Romantic Music');
      btn.innerHTML = `
        <span class="music-icon">🎵</span>
        <span class="music-label">Play Romantic Music</span>
      `;
    }
  }

  // Create floating music button in document
  function injectMusicButton() {
    if (document.getElementById('music-toggle-btn')) return;

    const btn = document.createElement('button');
    btn.id = 'music-toggle-btn';
    btn.className = 'music-floating-btn';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Play Romantic Music');
    btn.innerHTML = `
      <span class="music-icon">🎵</span>
      <span class="music-label">Play Romantic Music</span>
    `;

    btn.addEventListener('click', () => {
      toggleMusic();
    });

    document.body.appendChild(btn);

    // Check if user previously turned it on during this session
    const wasPlaying = sessionStorage.getItem('dating_music_active') === 'true';
    if (wasPlaying) {
      // User must interact first to resume audio on modern browsers
      const resumeOnFirstClick = () => {
        if (!isPlaying && sessionStorage.getItem('dating_music_active') === 'true') {
          startMusic();
        }
        document.removeEventListener('click', resumeOnFirstClick);
      };
      document.addEventListener('click', resumeOnFirstClick, { once: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectMusicButton);
  } else {
    injectMusicButton();
  }

  window.RomanticMusic = {
    start: startMusic,
    stop: stopMusic,
    toggle: toggleMusic,
    isPlaying: () => isPlaying
  };
})();
