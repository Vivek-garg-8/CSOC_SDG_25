const keys = {
    A: 'E',
    S: 'A',
    D: 'D',
    F: 'G',
    G: 'B',
    H: 'e'
  };
  
  function playNote(note) {
    const audio = new Audio(`sounds/${note}.mp3`);
    audio.play();
  }
  
  function highlightButton(button) {
    button.classList.add('playing');
    setTimeout(() => {
      button.classList.remove('playing');
    }, 200);
  }
  
  document.querySelectorAll('.string').forEach(button => {
    button.addEventListener('click', () => {
      const note = button.dataset.note;
      playNote(note);
      highlightButton(button);
    });
  });
  
  document.addEventListener('keydown', event => {
    const note = keys[event.key.toUpperCase()];
    if (note) {
      const button = document.querySelector(`.string[data-note="${note}"]`);
      if (button) {
        playNote(note);
        highlightButton(button);
      }
    }
  });
  