const keys = document.querySelectorAll('.white-key, .black-key');

const keyMap = {
  c: 'C',
  C: 'Cs',
  d: 'D',
  D: 'Ds',
  e: 'E',
  f: 'F',
  F: 'Fs',
  g: 'G',
  G: 'Gs',
  a: 'A',
  A: 'As',
  b: 'B'
};

function playSound(note, keyElement) {
  const audio = new Audio(`sounds/${note}.mp3`);
  audio.currentTime = 0;

  if (keyElement) {
    keyElement.classList.add('pressed');
    audio.addEventListener('ended', () => {
      keyElement.classList.remove('pressed');
    });
    audio.addEventListener('error', () => {
      setTimeout(() => keyElement.classList.remove('pressed'), 200);
    });
  }

  audio.play();
}

keys.forEach(key => {
  key.addEventListener('click', () => {
    const note = key.dataset.note;
    playSound(note, key);
  });
});

const pressedKeys = new Set();

document.addEventListener('keydown', (e) => {
  const key = e.key.toLowerCase();
  if (!keyMap[key] || pressedKeys.has(key)) return;
  pressedKeys.add(key);

  const note = keyMap[key];
  const keyElement = Array.from(keys).find(k => k.dataset.note === note);
  playSound(note, keyElement);
});

document.addEventListener('keyup', (e) => {
  pressedKeys.delete(e.key.toLowerCase());
});
