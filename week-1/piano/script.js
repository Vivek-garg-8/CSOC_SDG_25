const themeToggle = document.getElementById('theme-toggle');
const body = document.body;
const currentTheme = localStorage.getItem('theme') || 'dark';

if (currentTheme === 'light') {
    body.classList.add('light-mode');
}

function toggleTheme() {
    body.classList.toggle('light-mode');
    const theme = body.classList.contains('light-mode') ? 'light' : 'dark';
    localStorage.setItem('theme', theme);
}

if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
}

const NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const OCTAVES = [4, 5];
const KEYBOARD_MAP = {
    'z': 'C4', 's': 'Db4', 'x': 'D4', 'd': 'Eb4', 'c': 'E4', 'v': 'F4',
    'g': 'Gb4', 'b': 'G4', 'h': 'Ab4', 'n': 'A4', 'j': 'Bb4', 'm': 'B4',
    'q': 'C5', '2': 'Db5', 'w': 'D5', '3': 'Eb5', 'e': 'E5', 'r': 'F5',
    '5': 'Gb5', 't': 'G5', '6': 'Ab5', 'y': 'A5', '7': 'Bb5', 'u': 'B5'
};

class Piano {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.gainNode = this.audioContext.createGain();
        this.destination = this.audioContext.createMediaStreamDestination();
        this.gainNode.connect(this.destination);
        this.gainNode.connect(this.audioContext.destination);

        this.mediaRecorder = new MediaRecorder(this.destination.stream);
        this.recordedChunks = [];
        this.recordedNotes = [];
        this.isRecording = false;
        this.recordStartTime = 0;

        this.mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                this.recordedChunks.push(e.data);
            }
        };

        this.mediaRecorder.onstop = () => {
            const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `piano-recording-${new Date().toISOString()}.webm`;
            a.click();
            URL.revokeObjectURL(url);
        };

        this.activeNotes = new Map();
        this.initUI();
        this.initPianoKeys();
        this.initEventListeners();
        this.initResizeHandler();
    }

    createSyntheticPianoSound(note) {
        const frequency = this.noteToFrequency(note);
        const oscillators = [];
        const gains = [];

        const osc1 = this.audioContext.createOscillator();
        const gain1 = this.audioContext.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        gain1.gain.setValueAtTime(0.3, this.audioContext.currentTime);

        const osc2 = this.audioContext.createOscillator();
        const gain2 = this.audioContext.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(frequency * 2, this.audioContext.currentTime);
        gain2.gain.setValueAtTime(0.1, this.audioContext.currentTime);

        oscillators.push(osc1, osc2);
        gains.push(gain1, gain2);

        const masterGain = this.audioContext.createGain();
        masterGain.gain.setValueAtTime(0, this.audioContext.currentTime);
        masterGain.gain.linearRampToValueAtTime(1, this.audioContext.currentTime + 0.01);
        masterGain.gain.exponentialRampToValueAtTime(0.3, this.audioContext.currentTime + 0.1);
        masterGain.gain.exponentialRampToValueAtTime(0.1, this.audioContext.currentTime + 0.5);

        oscillators.forEach((osc, index) => {
            osc.connect(gains[index]);
            gains[index].connect(masterGain);
        });

        return { oscillators, gains, masterGain };
    }

    noteToFrequency(note) {
        const noteMap = {
            'C': 0, 'Db': 1, 'D': 2, 'Eb': 3, 'E': 4, 'F': 5,
            'Gb': 6, 'G': 7, 'Ab': 8, 'A': 9, 'Bb': 10, 'B': 11
        };
        const noteName = note.slice(0, -1);
        const octave = parseInt(note.slice(-1));
        const semitone = noteMap[noteName];
        return 440 * Math.pow(2, (octave - 4) + (semitone - 9) / 12);
    }

    initUI() {
        const volumeControl = document.getElementById('volume');
        if (volumeControl) {
            volumeControl.addEventListener('input', (e) => {
                this.gainNode.gain.value = parseFloat(e.target.value);
            });
        }

        const recordBtn = document.getElementById('record-btn');
        const stopBtn = document.getElementById('stop-btn');
        const downloadBtn = document.getElementById('download-btn');

        if (recordBtn) recordBtn.addEventListener('click', () => this.startRecording());
        if (stopBtn) stopBtn.addEventListener('click', () => this.stopRecording());
        if (downloadBtn) downloadBtn.addEventListener('click', () => this.downloadNoteEvents());
    }

    initPianoKeys() {
        const whiteKeysContainer = document.getElementById('piano-keyboard');
        const blackKeysContainer = document.getElementById('black-keys-container');
        if (!whiteKeysContainer || !blackKeysContainer) return;

        whiteKeysContainer.innerHTML = '';
        blackKeysContainer.innerHTML = '';

        OCTAVES.forEach(octave => {
            NOTES.forEach((note) => {
                const whiteKey = document.createElement('div');
                whiteKey.className = 'white-key';
                whiteKey.dataset.note = `${note}${octave}`;
                whiteKey.innerHTML = `${note}${octave}`;
                whiteKeysContainer.appendChild(whiteKey);
            });
        });

        setTimeout(() => {
            this.createBlackKeys();
        }, 100);
    }

    createBlackKeys() {
        const blackKeysContainer = document.getElementById('black-keys-container');
        const whiteKeys = document.querySelectorAll('.white-key');
        
        if (whiteKeys.length === 0) return;

        blackKeysContainer.innerHTML = '';

        const whiteKeyWidth = whiteKeys[0].offsetWidth;
        const borderWidth = parseInt(getComputedStyle(document.querySelector('.white-keys')).borderLeftWidth) || 8;
        const containerWidth = document.querySelector('.white-keys').offsetWidth;

        const blackKeyPositions = [
            { note: 'Db4', afterKey: 0 },
            { note: 'Eb4', afterKey: 1 },
            { note: 'Gb4', afterKey: 3 },
            { note: 'Ab4', afterKey: 4 },
            { note: 'Bb4', afterKey: 5 },
            { note: 'Db5', afterKey: 7 },
            { note: 'Eb5', afterKey: 8 },
            { note: 'Gb5', afterKey: 10 },
            { note: 'Ab5', afterKey: 11 },
            { note: 'Bb5', afterKey: 12 }
        ];

        blackKeyPositions.forEach(({ note, afterKey }) => {
            const blackKey = document.createElement('div');
            blackKey.className = 'black-key';
            blackKey.dataset.note = note;
            blackKey.innerHTML = note;
            
            let offset;
            if (containerWidth < 300) {
                offset = 0.6;
            } else if (containerWidth < 500) {
                offset = 0.65;
            } else if (containerWidth < 700) {
                offset = 0.7;
            } else {
                offset = 0.75;
            }
            
            const position = borderWidth + (afterKey * whiteKeyWidth) + (whiteKeyWidth * offset);
            blackKey.style.left = `${position}px`;
            blackKeysContainer.appendChild(blackKey);
        });
    }

    initResizeHandler() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.initPianoKeys();
            }, 250);
        });
    }

    initEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (e.repeat) return;
            const note = KEYBOARD_MAP[e.key.toLowerCase()];
            if (note) this.playNote(note);
        });

        document.addEventListener('keyup', (e) => {
            const note = KEYBOARD_MAP[e.key.toLowerCase()];
            if (note) this.stopNote(note);
        });

        document.addEventListener('mousedown', (e) => {
            const key = e.target.closest('.white-key, .black-key');
            if (key) this.playNote(key.dataset.note);
        });

        document.addEventListener('mouseup', (e) => {
            const key = e.target.closest('.white-key, .black-key');
            if (key) this.stopNote(key.dataset.note);
        });

        document.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const key = e.target.closest('.white-key, .black-key');
            if (key) this.playNote(key.dataset.note);
        });

        document.addEventListener('touchend', (e) => {
            e.preventDefault();
            const key = e.target.closest('.white-key, .black-key');
            if (key) this.stopNote(key.dataset.note);
        });
    }

    async playNote(note) {
        if (this.activeNotes.has(note)) return;

        const sound = this.createSyntheticPianoSound(note);
        const { oscillators, gains, masterGain } = sound;

        masterGain.connect(this.gainNode);
        oscillators.forEach(osc => osc.start());
        this.activeNotes.set(note, { oscillators, gains, masterGain });

        const key = document.querySelector(`[data-note="${note}"]`);
        if (key) {
            key.classList.add('active', 'pressed');
        }

        if (this.isRecording) {
            this.recordedNotes.push({
                note,
                startTime: Date.now() - this.recordStartTime,
                type: 'noteOn'
            });
        }
    }

    stopNote(note) {
        const activeNote = this.activeNotes.get(note);
        if (!activeNote) return;

        const { oscillators, masterGain } = activeNote;
        masterGain.gain.setValueAtTime(masterGain.gain.value, this.audioContext.currentTime);
        masterGain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.1);

        setTimeout(() => {
            oscillators.forEach(osc => {
                try {
                    osc.stop();
                } catch (e) {}
            });
            this.activeNotes.delete(note);
        }, 100);

        const key = document.querySelector(`[data-note="${note}"]`);
        if (key) {
            key.classList.remove('active', 'pressed');
        }

        if (this.isRecording) {
            this.recordedNotes.push({
                note,
                startTime: Date.now() - this.recordStartTime,
                type: 'noteOff'
            });
        }
    }

    startRecording() {
        this.recordedChunks = [];
        this.recordedNotes = [];
        this.recordStartTime = Date.now();
        this.isRecording = true;
        this.mediaRecorder.start();

        const recordBtn = document.getElementById('record-btn');
        const stopBtn = document.getElementById('stop-btn');

        if (recordBtn) {
            recordBtn.classList.add('recording');
            recordBtn.disabled = true;
        }

        if (stopBtn) {
            stopBtn.disabled = false;
        }
    }

    stopRecording() {
        this.isRecording = false;
        this.mediaRecorder.stop();

        const recordBtn = document.getElementById('record-btn');
        const stopBtn = document.getElementById('stop-btn');
        const downloadBtn = document.getElementById('download-btn');

        if (recordBtn) {
            recordBtn.classList.remove('recording');
            recordBtn.disabled = false;
        }

        if (stopBtn) {
            stopBtn.disabled = true;
        }

        if (downloadBtn) {
            downloadBtn.disabled = false;
        }
    }

    downloadNoteEvents() {
        const recording = JSON.stringify(this.recordedNotes, null, 2);
        const blob = new Blob([recording], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `piano-notes-${new Date().toISOString()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Piano();
});
