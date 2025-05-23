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

const drumKeyMap = {
    q: 'crash',
    w: 'ride',
    e: 'hihat',
    a: 'snare',
    s: 'kick',
    d: 'tom'
};

class DrumKit {
    constructor() {
        this.audioContext = null;
        this.gainNode = null;
        this.destination = null;
        this.mediaRecorder = null;
        this.recordedChunks = [];
        this.recordedBeats = [];
        this.isRecording = false;
        this.recordStartTime = 0;
        this.audioInitialized = false;

        this.initUI();
        this.initEventListeners();
    }

    async initializeAudio() {
        if (this.audioInitialized) return;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.gainNode = this.audioContext.createGain();
            this.destination = this.audioContext.createMediaStreamDestination();
            this.gainNode.connect(this.destination);
            this.gainNode.connect(this.audioContext.destination);

            this.mediaRecorder = new MediaRecorder(this.destination.stream);
            
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
                a.download = `drum-recording-${new Date().toISOString()}.webm`;
                a.click();
                URL.revokeObjectURL(url);
            };

            this.audioInitialized = true;
        } catch (error) {
            console.warn('Audio initialization failed:', error);
        }
    }

    initUI() {
        const volumeControl = document.getElementById('volume');
        if (volumeControl) {
            volumeControl.addEventListener('input', (e) => {
                if (this.gainNode) {
                    this.gainNode.gain.value = parseFloat(e.target.value);
                }
            });
        }

        const recordBtn = document.getElementById('record-btn');
        const stopBtn = document.getElementById('stop-btn');
        const downloadBtn = document.getElementById('download-btn');

        if (recordBtn) recordBtn.addEventListener('click', () => this.startRecording());
        if (stopBtn) stopBtn.addEventListener('click', () => this.stopRecording());
        if (downloadBtn) downloadBtn.addEventListener('click', () => this.downloadBeatEvents());
    }

    initEventListeners() {
        document.querySelectorAll('.drum').forEach(drum => {
            drum.addEventListener('click', async () => {
                await this.initializeAudio();
                const sound = drum.dataset.sound;
                this.playDrum(sound, drum);
            });
        });

        const pressed = new Set();
        document.addEventListener('keydown', async e => {
            const key = e.key.toLowerCase();
            if (!drumKeyMap[key] || pressed.has(key)) return;
            pressed.add(key);
            await this.initializeAudio();
            const sound = drumKeyMap[key];
            const drumEl = document.querySelector(`.drum[data-sound="${sound}"]`);
            this.playDrum(sound, drumEl);
        });

        document.addEventListener('keyup', e => {
            pressed.delete(e.key.toLowerCase());
        });
    }

    async playDrum(sound, drumEl) {
        if (drumEl) {
            drumEl.classList.add('playing');
            setTimeout(() => {
                drumEl.classList.remove('playing');
            }, 200);
        }

        try {
            const audio = new Audio(`sounds/${sound}.mp3`);
            audio.volume = this.gainNode ? this.gainNode.gain.value : 0.5;
            
            if (this.audioContext && this.gainNode) {
                const source = this.audioContext.createMediaElementSource(audio);
                source.connect(this.gainNode);
            }
            
            audio.currentTime = 0;
            await audio.play();
            
        } catch (error) {
            console.error(`Failed to play ${sound}.mp3:`, error);
        }

        if (this.isRecording) {
            this.recordedBeats.push({
                drum: sound,
                timestamp: Date.now() - this.recordStartTime,
                type: 'hit'
            });
        }
    }

    async startRecording() {
        await this.initializeAudio();
        if (!this.mediaRecorder) return;

        this.recordedChunks = [];
        this.recordedBeats = [];
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
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.stop();
        }

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

    downloadBeatEvents() {
        const recording = JSON.stringify(this.recordedBeats, null, 2);
        const blob = new Blob([recording], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `drum-beats-${new Date().toISOString()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new DrumKit();
});
