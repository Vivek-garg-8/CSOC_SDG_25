# 🎶 Virtual Instruments

A modern web application featuring three interactive virtual instruments: Piano, Guitar, and Drum Kit. Play music directly in your browser with realistic sounds, recording capabilities, and responsive design.

## 🚀 Features

- **🎹 Virtual Piano** - Full keyboard with white and black keys, realistic piano sounds
- **🎸 Virtual Guitar** - Six-string guitar with authentic string colors and vibration effects  
- **🥁 Virtual Drum Kit** - Complete drum set with crash, ride, hi-hat, snare, kick, and tom
- **🎤 Recording & Download** - Record your performances and download as audio files (.webm)
- **🔊 Volume Control** - Adjustable audio levels with intuitive sliders
- **🌙☀️ Dark/Light Theme Toggle** - Switch between dark and light modes with automatic preference saving
- **📱 Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- **🎵 Multiple Sound Sources** - Uses different audio technologies for optimal performance
- **⌨️ Keyboard Support** - Full keyboard shortcuts for all instruments

## 🎮 How to Use

1. Open `index.html` in your browser
2. Select an instrument from the home menu
3. Start playing using your mouse, touch, or keyboard
4. Record your performance and download the audio
5. Toggle between dark/light themes using the sun/moon button

## 🎯 Controls

### 🎹 Piano
- **Mouse/Touch:** Click piano keys
- **Keyboard:** A S D F G H J K L (white keys), W E T Y U O P (black keys)
- **Features:** Realistic key press animations, sustain effects

### 🎸 Guitar
- **Mouse/Touch:** Click guitar strings
- **Keyboard:** A(E) S(A) D(D) F(G) G(B) H(e) for each string
- **Features:** Individual string gradients, vibration animations, fret markers

### 🥁 Drums
- **Mouse/Touch:** Click drum pads
- **Keyboard:** Q(Crash) W(Ride) E(Hi-Hat) A(Snare) S(Kick) D(Tom)
- **Features:** Visual drum animations, realistic drum pad colors

### 🎛️ Universal Controls
- **🔊 Volume Slider:** Adjust audio levels
- **🎤 Record Button:** Start/stop recording
- **📥 Download Button:** Save recordings as .webm files
- **🌙☀️ Theme Toggle:** Switch between dark/light modes

## 🔊 Audio Technology

### Sound Sources:
- **🎹 Piano:** Uses **synthetic sounds** generated through Web Audio API for consistent performance across all devices
- **🎸 Guitar:** Uses **real audio samples** loaded from downloaded sound files for authentic guitar tones
- **🥁 Drums:** Uses **real audio samples** loaded from downloaded sound files for realistic drum sounds

### Audio Requirements

For optimal experience with Guitar and Drums, place audio files in a `sounds/` folder:

**Guitar:** `E.mp3`, `A.mp3`, `D.mp3`, `G.mp3`, `B.mp3`, `e.mp3`  
**Drums:** `crash.mp3`, `ride.mp3`, `hihat.mp3`, `snare.mp3`, `kick.mp3`, `tom.mp3`

*Note: Piano generates sounds synthetically, while Guitar and Drums have fallback synthetic sounds if audio files are missing*

## 🌐 Browser Compatibility

- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Mobile browsers with touch support

## ⚡ Technical Features

- **Web Audio API** for high-quality audio processing and synthetic sound generation
- **MediaRecorder API** for recording functionality
- **Audio Sample Loading** for realistic instrument sounds
- **CSS Grid & Flexbox** for responsive layouts
- **Local Storage** for theme preferences
- **Touch Events** for mobile compatibility
- **Keyboard Event Handling** for desktop use
- **Gradient Animations** for visual feedback


## 🚀 Getting Started

1. Download or clone the project files
2. Add audio samples to the `sounds/` folder for guitar and drums (optional)
3. Open `index.html` in a modern web browser
4. Start making music!

## 🎨 Themes

- **Dark Mode:** Sleek dark interface with gold accents
- **Light Mode:** Clean light interface with warm brown tones
- Theme preference is automatically saved in browser storage

## 📱 Mobile Support

- Touch-friendly interface
- Responsive design for all screen sizes
- Optimized controls for mobile devices
- Works on iOS and Android browsers

## 🎵 Sound Quality

- **Piano:** High-quality synthetic sounds using Web Audio API oscillators
- **Guitar & Drums:** Professional audio samples with fallback synthetic sounds
- Realistic instrument behavior and sound characteristics
- Professional-grade recording capabilities

---

🎹 **Piano** -  🎸 **Guitar** -  🥁 **Drums**

**Created By Vivek Garg (24075096)**

*Experience the joy of making music in your browser!*

*Made with ❤️ for music lovers everywhere*


