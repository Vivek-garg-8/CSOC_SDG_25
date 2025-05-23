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

const KEYBOARD_MAP = {
    'a': 'E',
    's': 'A', 
    'd': 'D',
    'f': 'G',
    'g': 'B',
    'h': 'es'
};

class Guitar {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.gainNode = this.audioContext.createGain();
        this.destination = this.audioContext.createMediaStreamDestination();
        this.gainNode.connect(this.destination);
        this.gainNode.connect(this.audioContext.destination);
        
        this.mediaRecorder = new MediaRecorder(this.destination.stream, {
            mimeType: 'audio/webm;codecs=opus'
        });
        this.recordedChunks = [];
        this.isRecording = false;
        this.activeNotes = new Map();
        
        // Audio buffers for guitar sounds
        this.audioBuffers = {};
        this.loadAudioFiles();

        this.setupMediaRecorder();
        this.initUI();
        this.initEventListeners();
    }

    async loadAudioFiles() {
        const notes = ['E', 'A', 'D', 'G', 'B', 'e'];
        
        for (const note of notes) {
            try {
                let audioUrl = `sounds/guitar-${note}.mp3`;
                let response = await fetch(audioUrl);
                
                if (!response.ok) {
                    audioUrl = `sounds/${note}.mp3`;
                    response = await fetch(audioUrl);
                }
                
                if (!response.ok) {
                    console.warn(`Audio file not found for note ${note}, using fallback`);
                    this.audioBuffers[note] = null;
                    continue;
                }
                
                const arrayBuffer = await response.arrayBuffer();
                const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
                this.audioBuffers[note] = audioBuffer;
                
            } catch (error) {
                console.warn(`Error loading audio for note ${note}:`, error);
                this.audioBuffers[note] = null;
            }
        }
    }

    // Fallback synthetic sound for when audio files aren't available
    createFallbackSound(note) {
        const frequency = this.noteToFrequency(note);
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        
        const now = this.audioContext.currentTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.1, now + 0.5);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 2);
        
        oscillator.connect(gainNode);
        return { oscillator, gainNode };
    }

    playAudioBuffer(note) {
        const buffer = this.audioBuffers[note];
        if (!buffer) {
            // Use fallback if no audio file
            return this.createFallbackSound(note);
        }

        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        
        source.buffer = buffer;
        source.connect(gainNode);
        
        // Set initial volume
        gainNode.gain.setValueAtTime(0.8, this.audioContext.currentTime);
        
        return { source, gainNode };
    }

    setupMediaRecorder() {
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
            a.download = `guitar-recording-${new Date().toISOString().slice(0,19).replace(/:/g,'-')}.webm`;
            a.click();
            URL.revokeObjectURL(url);
            this.recordedChunks = [];
        };
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
        if (downloadBtn) downloadBtn.addEventListener('click', () => this.downloadRecording());
    }

    initEventListeners() {
        // String click events
        document.querySelectorAll('.guitar-string').forEach(stringEl => {
            stringEl.addEventListener('mousedown', () => {
                const note = stringEl.dataset.note;
                this.playNote(note, stringEl);
            });

            stringEl.addEventListener('mouseup', () => {
                const note = stringEl.dataset.note;
                this.stopNote(note, stringEl);
            });

            // Touch events
            stringEl.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const note = stringEl.dataset.note;
                this.playNote(note, stringEl);
            });

            stringEl.addEventListener('touchend', (e) => {
                e.preventDefault();
                const note = stringEl.dataset.note;
                this.stopNote(note, stringEl);
            });
        });

        // Keyboard events
        document.addEventListener('keydown', (e) => {
            if (e.repeat) return;
            const note = KEYBOARD_MAP[e.key.toLowerCase()];
            if (note) {
                const stringEl = document.querySelector(`.guitar-string[data-note="${note}"]`);
                if (stringEl && !this.activeNotes.has(note)) {
                    this.playNote(note, stringEl);
                }
            }
        });

        document.addEventListener('keyup', (e) => {
            const note = KEYBOARD_MAP[e.key.toLowerCase()];
            if (note) {
                const stringEl = document.querySelector(`.guitar-string[data-note="${note}"]`);
                if (stringEl) {
                    this.stopNote(note, stringEl);
                }
            }
        });
    }

    playNote(note, stringEl) {
        if (this.activeNotes.has(note)) return;

        const sound = this.playAudioBuffer(note);
        const { source, gainNode, oscillator } = sound;

        gainNode.connect(this.gainNode);
        
        if (source) {
            source.start();
        } else if (oscillator) {
            oscillator.start();
        }

        this.activeNotes.set(note, sound);

        if (stringEl) {
            stringEl.classList.add('active', 'pressed');
        }
    }

    stopNote(note, stringEl) {
        const activeNote = this.activeNotes.get(note);
        if (!activeNote) return;

        const { source, gainNode, oscillator } = activeNote;
        const now = this.audioContext.currentTime;

        // Fade out
        if (gainNode) {
            gainNode.gain.setValueAtTime(gainNode.gain.value, now);
            gainNode.gain.linearRampToValueAtTime(0, now + 0.1);
        }

        setTimeout(() => {
            try {
                if (source) source.stop();
                if (oscillator) oscillator.stop();
            } catch (e) {}
            this.activeNotes.delete(note);
        }, 100);

        if (stringEl) {
            stringEl.classList.remove('active', 'pressed');
        }
    }

    noteToFrequency(note) {
        const freqMap = {
            'E': 82.41,
            'A': 110.00,
            'D': 146.83,
            'G': 196.00,
            'B': 246.94,
            'e': 329.63
        };
        return freqMap[note] || 220;
    }

    startRecording() {
        this.recordedChunks = [];
        this.isRecording = true;
        this.mediaRecorder.start();

        const recordBtn = document.getElementById('record-btn');
        const stopBtn = document.getElementById('stop-btn');

        if (recordBtn) {
            recordBtn.classList.add('recording');
            recordBtn.disabled = true;
        }
        if (stopBtn) stopBtn.disabled = false;
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
        if (stopBtn) stopBtn.disabled = true;
        if (downloadBtn) downloadBtn.disabled = false;
    }

    downloadRecording() {
        if (this.recordedChunks.length > 0) {
            const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `guitar-recording-${new Date().toISOString().slice(0,19).replace(/:/g,'-')}.webm`;
            a.click();
            URL.revokeObjectURL(url);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Guitar();
});
