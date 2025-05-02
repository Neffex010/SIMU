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
    this.audioElements = new Set();
    this.activeUtterances = new Set();
    this.currentAudio = null;

    // Binding de métodos
    this._handleVoiceClick = this._handleVoiceClick.bind(this);
    this._handleRecognitionResult = this._handleRecognitionResult.bind(this);
    this._handleRecognitionEnd = this._handleRecognitionEnd.bind(this);

    this._setupButtons();
    this._checkSpeechSupport();
  }

  _setupButtons() {
    this.btnVoice.addEventListener("click", this._handleVoiceClick);
    this.btnMute.addEventListener("click", () => this.toggleSynth());
    this._updateMuteUI();
    this._updateVoiceButton();
  }

  _checkSpeechSupport() {
    if (!('speechSynthesis' in window)) {
      this.btnMute.disabled = true;
      console.warn('La síntesis de voz no está soportada');
    }
  }

  async speak(text) {
    if (!this.synthEnabled || !text) return;

    try {
      this._cleanupAudio();  // Limpiar reproducciones anteriores

      const response = await fetch(APP_SETTINGS.openAISpeechEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text,
          voice: "nova",
          model: "tts-1-hd",
          response_format: "mp3"
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error ${response.status}: ${errorData.error}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      audio.addEventListener('ended', () => this._handleAudioEnd(audioUrl, audio));
      audio.addEventListener('error', (e) => this._handleAudioError(e, audioUrl, audio));

      this.audioElements.add(audio);
      this.currentAudio = audio;
      await audio.play();
    } catch (error) {
      console.error('Error en síntesis de voz:', error);
      this._fallbackTTS(text);
    }
  }

  _handleAudioEnd(audioUrl, audio) {
    URL.revokeObjectURL(audioUrl);
    this.audioElements.delete(audio);
    this.currentAudio = null;
  }

  _handleAudioError(error, audioUrl, audio) {
    console.error('Error en reproducción:', error);
    URL.revokeObjectURL(audioUrl);
    this.audioElements.delete(audio);
    this.currentAudio = null;
  }

  _fallbackTTS(text) {
    if (!window.speechSynthesis) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = this.lang;
    Object.assign(utterance, this.voiceSettings);

    utterance.addEventListener('end', () => {
      this.activeUtterances.delete(utterance);
    });

    utterance.addEventListener('error', (e) => {
      console.error('Error en TTS nativo:', e);
      this.activeUtterances.delete(utterance);
    });

    this.activeUtterances.add(utterance);
    speechSynthesis.speak(utterance);
  }

  startRecognition(onResult, options = {}) {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      this._handleError('API de reconocimiento no soportada');
      return;
    }

    this._cleanupRecognition();
    
    const { timeout = 10000, continuous = false, pauseBetween = 500 } = options;
    this.onResult = onResult;
    this.continuous = continuous;
    this.pauseDuration = pauseBetween;

    this.recognition = new Recognition();
    this._configureRecognition();

    try {
      this.recognition.start();
      this.isRecording = true;
      this._timeoutId = setTimeout(() => this.stopRecognition(), timeout);
      this._updateVoiceButton();
    } catch (error) {
      this._handleError(error.message);
    }
  }

  _configureRecognition() {
    this.recognition.lang = this.lang;
    this.recognition.interimResults = false;
    this.recognition.maxAlternatives = 1;
    this.recognition.continuous = this.continuous;

    this.recognition.onstart = () => this._handleRecognitionStart();
    this.recognition.onerror = (e) => this._handleRecognitionError(e);
    this.recognition.onresult = (e) => this._handleRecognitionResult(e);
    this.recognition.onend = () => this._handleRecognitionEnd();
  }

  _handleRecognitionStart() {
    this.btnVoice.classList.add('recording');
    this.btnVoice.textContent = 'Escuchando...';
  }

  _handleRecognitionResult(event) {
    const result = event.results[event.resultIndex];
    if (result.isFinal) {
      const transcript = result[0]?.transcript?.trim();
      if (transcript && this.onResult) {
        this.onResult(transcript);
      }
    }
  }

  _handleRecognitionEnd() {
    if (this.continuous && this.isRecording) {
      setTimeout(() => this.recognition.start(), this.pauseDuration);
    } else {
      this.stopRecognition();
    }
  }

  _handleRecognitionError(event) {
    const errorMap = {
      'no-speech': 'No se detectó voz',
      'aborted': 'Reconocimiento detenido',
      'audio-capture': 'Error de micrófono',
      'network': 'Error de red',
      'not-allowed': 'Permisos denegados'
    };
    this._handleError(errorMap[event.error] || `Error: ${event.error}`);
  }

  stopRecognition() {
    if (!this.recognition) return;
    
    this.recognition.stop();
    this.isRecording = false;
    clearTimeout(this._timeoutId);
    this._updateVoiceButton();
  }

  toggleSynth() {
    this.synthEnabled = !this.synthEnabled;
    this._cleanupAudio();
    this._updateMuteUI();
    return this.synthEnabled;
  }

  _cleanupAudio() {
    // Detener y limpiar audios
    this.audioElements.forEach(audio => {
      audio.pause();
      URL.revokeObjectURL(audio.src);
    });
    this.audioElements.clear();
    
    // Detener síntesis de voz
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
    this.activeUtterances.clear();
  }

  _updateMuteUI() {
    this.btnMute.textContent = this.synthEnabled ? "🔇 Silenciar" : "🔊 Activar";
    this.btnMute.classList.toggle('muted', !this.synthEnabled);
  }

  _updateVoiceButton() {
    this.btnVoice.textContent = this.isRecording ? "🎙️ Grabando..." : "🎤 Iniciar Voz";
    this.btnVoice.classList.toggle('recording', this.isRecording);
  }

  _handleError(message) {
    console.error(message);
    this.btnVoice.textContent = "❌ Error";
    this.btnVoice.classList.add('error');
    setTimeout(() => this._updateVoiceButton(), 2000);
  }

  destroy() {
    this._cleanupRecognition();
    this._cleanupAudio();
    this.btnVoice.removeEventListener('click', this._handleVoiceClick);
    this.btnMute.removeEventListener('click', this.toggleSynth);
  }

  _cleanupRecognition() {
    if (this.recognition) {
      this.recognition.stop();
      this.recognition = null;
    }
    clearTimeout(this._timeoutId);
    this.isRecording = false;
    this._updateVoiceButton();
  }
}
