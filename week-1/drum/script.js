const drumKeyMap = {
  q: 'crash',
  w: 'ride',
  e: 'hihat',
  a: 'snare',
  s: 'kick',
  d: 'tom'
};

function playDrum(sound, drumEl) {
  const audio = new Audio(`sounds/${sound}.mp3`);
  if (drumEl) {
    drumEl.classList.add('playing');
    audio.addEventListener('ended', () => drumEl.classList.remove('playing'));
    audio.addEventListener('error', () => setTimeout(() => drumEl.classList.remove('playing'), 200));
  }
  audio.play();
}

document.querySelectorAll('.drum').forEach(drum => {
  drum.addEventListener('click', () => {
    const sound = drum.dataset.sound;
    playDrum(sound, drum);
  });
});

// Track pressed keys to prevent rapid repeats
const pressed = new Set();

document.addEventListener('keydown', e => {
  const key = e.key.toLowerCase();
  if (!drumKeyMap[key] || pressed.has(key)) return;
  pressed.add(key);
  const sound = drumKeyMap[key];
  const drumEl = document.querySelector(`.drum[data-sound="${sound}"]`);
  playDrum(sound, drumEl);
});

document.addEventListener('keyup', e => {
  pressed.delete(e.key.toLowerCase());
});
