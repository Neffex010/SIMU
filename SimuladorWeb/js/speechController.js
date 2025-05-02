// src/speechController.js
import { APP_SETTINGS } from './config.js';
export class SpeechController {
  constructor(btnVoice, btnMute, lang = "es-MX") {
    this.btnVoice = btnVoice;
    this.btnMute = btnMute;
    this.lang = lang;
    this.synthEnabled = true;
    this.recognition = null;
    this.isRecording = false;
    this._timeoutId = null;
    this.continuous = false;
    this.pauseDuration = 0;
    this.voiceSettings = { pitch: 1, rate: 1, volume: 1 };

    // Configurar botones
    this._setupButtons();
  }

  // Inicializa eventos de UI
  _setupButtons() {
    this.btnVoice.addEventListener("click", () => this._handleVoiceClick());
    this.btnMute.addEventListener("click", () => this._handleMuteClick());
    this._updateMuteUI();
  }

  _handleVoiceClick() {
    // Cambia entre start/stop recognition
    if (this.isRecording) this.stopRecognition();
    else this.startRecognition(this._onEvent.bind(this));
  }

  _handleMuteClick() {
    this.toggleSynth();
    this._updateMuteUI();
  }

  // Callback interno que actualiza UI en base a eventos
  _onEvent(event) {
    switch(event.type) {
      case 'start':
        this.btnVoice.textContent = "🎙️ Grabando...";
        this.btnVoice.classList.add("active");
        break;
      case 'end':
        this.btnVoice.textContent = "🎤 Hablar";
        this.btnVoice.classList.remove("active");
        break;
      case 'error':
        alert(`Error de reconocimiento: ${event.error}`);
        break;
      case 'result':
        // Aquí llamas al handler del usuario si existe
        if (this.onResult) this.onResult(event.transcript);
        break;
    }
  }

  // Síntesis de voz
 async speak(text) {
  if (!this.synthEnabled) return;

  try {
    const response = await fetch(APP_SETTINGS.openAISpeechEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: text,
        voice: "coral", // Opciones permitidas: alloy, echo, fable, onyx, nova, shimmer
        model: "tts-1" // Modelo correcto para TTS
      })
    });

    const audioData = await response.json();
    
    // Convertir base64 a blob
    const byteCharacters = atob(audioData.audio);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const audioBlob = new Blob([byteArray], {type: 'audio/mpeg'});

    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audio.play();

  } catch (error) {
    console.error('Error con síntesis de voz:', error);
    // Fallback a síntesis de voz nativa
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = this.lang;
    speechSynthesis.speak(utt);
  }
}

  // Ajuste dinámico de voz
  setVoiceSettings({ pitch, rate, volume }) {
    if (pitch != null) this.voiceSettings.pitch = pitch;
    if (rate  != null) this.voiceSettings.rate  = rate;
    if (volume!= null) this.voiceSettings.volume = volume;
  }

  // Iniciar reconocimiento
  startRecognition(onResult, { timeout = 10000, continuous = false, pauseBetween = 500 } = {}) {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      alert("Tu navegador no soporta reconocimiento de voz.");
      return;
    }
    this.onResult = onResult;
    this.continuous = continuous;
    this.pauseDuration = pauseBetween;

    this.recognition = new Recognition();
    this.recognition.lang = this.lang;
    this.recognition.interimResults = false;
    this.recognition.maxAlternatives = 1;
    this.recognition.continuous = continuous;

    this.recognition.onstart  = () => this._onEvent({ type: 'start' });
    this.recognition.onend    = () => this._handleEnd(continuous, onResult, timeout);
    this.recognition.onerror  = e => this._onEvent({ type: 'error', error: e.error });
    this.recognition.onresult = ev => {
      const text = ev.results[0]?.[0]?.transcript || '';
      this._onEvent({ type: 'result', transcript: text });
    };

    this.recognition.start();
    this.isRecording = true;
    this._timeoutId = setTimeout(() => this.stopRecognition(), timeout);
  }

  // Manejo de fin de reconocimiento
  _handleEnd(continuous, onResult, timeout) {
    this.isRecording = false;
    clearTimeout(this._timeoutId);
    this._onEvent({ type: 'end' });
    if (continuous) {
      setTimeout(() => this.startRecognition(onResult, { timeout, continuous, pauseBetween: this.pauseDuration }), this.pauseDuration);
    }
  }

  stopRecognition() {
    if (!this.recognition) return;
    this.recognition.stop();
    this.isRecording = false;
    clearTimeout(this._timeoutId);
  }

  toggleSynth() {
    this.synthEnabled = !this.synthEnabled;
    speechSynthesis.cancel();
    return this.synthEnabled;
  }

  _updateMuteUI() {
    this.btnMute.textContent = this.synthEnabled ? "🔇 Silenciar Voz" : "🔊 Activar Voz";
    this.btnMute.classList.toggle("btn-danger", !this.synthEnabled);
    this.btnMute.classList.toggle("btn-success", this.synthEnabled);
  }

stopRecognition() {
    if (!this.recognition) return;
    this.recognition.stop();
    this.isRecording = false;
    clearTimeout(this._timeoutId);
    this._onEvent({ type: 'end' }); // Asegurar actualización UI
  }

  setInterviewState(active) {
    this.interviewActive = active;
    if (!active) this.stopRecognition();
  }

  
}

