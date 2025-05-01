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

    // Bindear métodos críticos
    this._onEvent = this._onEvent.bind(this);
    this._handleEnd = this._handleEnd.bind(this);
    this._cleanupAudio = this._cleanupAudio.bind(this);

    this._setupButtons();
  }

  // Configuración inicial de botones
  _setupButtons() {
    this.btnVoice.addEventListener("click", () => this._handleVoiceClick());
    this.btnMute.addEventListener("click", () => this.toggleSynth());
    this._updateMuteUI();
  }

  // Manejo de clic en botón de voz
  _handleVoiceClick() {
    if (this.isRecording) {
      this.stopRecognition();
    } else {
      this.startRecognition(this._onEvent, {
        continuous: true,
        pauseBetween: 1000
      });
    }
  }

  // Sistema principal de síntesis de voz
  async speak(text) {
    if (!this.synthEnabled || !text) return;

    try {
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
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      audio.addEventListener('ended', () => {
        URL.revokeObjectURL(audioUrl);
        this.audioElements.delete(audio);
      });

      this.audioElements.add(audio);
      audio.play();
    } catch (error) {
      console.error('Error en síntesis de voz:', error);
      this._fallbackTTS(text);
    }
  }

  // Sistema de fallback para TTS
  _fallbackTTS(text) {
    if (!window.speechSynthesis) {
      console.warn('Speech Synthesis API no disponible');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = this.lang;
    Object.assign(utterance, this.voiceSettings);

    utterance.addEventListener('end', () => {
      this.activeUtterances.delete(utterance);
    });

    this.activeUtterances.add(utterance);
    speechSynthesis.speak(utterance);
  }

  // Iniciar reconocimiento de voz
  startRecognition(onResult, options = {}) {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      this._onEvent({ type: 'error', error: 'API no soportada' });
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
    } catch (error) {
      this._onEvent({ type: 'error', error: error.message });
    }
  }

  // Configurar parámetros de reconocimiento
  _configureRecognition() {
    this.recognition.lang = this.lang;
    this.recognition.interimResults = false;
    this.recognition.maxAlternatives = 1;
    this.recognition.continuous = this.continuous;

    this.recognition.onstart = () => this._onEvent({ type: 'start' });
    this.recognition.onerror = e => this._handleRecognitionError(e);
    this.recognition.onresult = e => this._handleRecognitionResult(e);
    this.recognition.onend = () => this._handleRecognitionEnd();
  }

  // Manejar resultados de reconocimiento
  _handleRecognitionResult(event) {
    const result = event.results[event.resultIndex];
    const text = result[0]?.transcript?.trim();
    if (text) {
      this._onEvent({ type: 'result', transcript: text });
    }
  }

  // Manejar errores de reconocimiento
  _handleRecognitionError(error) {
    this._onEvent({ 
      type: 'error', 
      error: this._mapRecognitionErrors(error.error)
    });
  }

  // Mapear códigos de error a mensajes
  _mapRecognitionErrors(code) {
    const errors = {
      'no-speech': 'No se detectó voz',
      'aborted': 'Reconocimiento abortado',
      'audio-capture': 'Error de captura de audio',
      'network': 'Error de red',
      'not-allowed': 'Permisos no otorgados',
      'service-not-allowed': 'Servicio no disponible',
      'bad-grammar': 'Error en gramática',
      'language-not-supported': 'Idioma no soportado'
    };
    return errors[code] || `Error desconocido (${code})`;
  }

  // Detener reconocimiento
  stopRecognition() {
    if (!this.recognition) return;
    
    this.recognition.stop();
    this.isRecording = false;
    clearTimeout(this._timeoutId);
    this._onEvent({ type: 'end' });
  }

  // Limpiar recursos de reconocimiento
  _cleanupRecognition() {
    if (this.recognition) {
      this.recognition.stop();
      this.recognition = null;
    }
    clearTimeout(this._timeoutId);
  }

  // Manejar fin de reconocimiento
  _handleRecognitionEnd() {
    if (this.continuous && this.isRecording) {
      this._timeoutId = setTimeout(() => {
        this.recognition.start();
      }, this.pauseDuration);
    }
  }

  // Alternar síntesis de voz
  toggleSynth() {
    this.synthEnabled = !this.synthEnabled;
    this._cleanupAudio();
    this._updateMuteUI();
    return this.synthEnabled;
  }

  // Limpiar recursos de audio
  _cleanupAudio() {
    this.audioElements.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
      URL.revokeObjectURL(audio.src);
    });
    this.audioElements.clear();
    
    speechSynthesis.cancel();
    this.activeUtterances.clear();
  }

  // Actualizar UI de mute
  _updateMuteUI() {
    this.btnMute.textContent = this.synthEnabled ? "🔇 Silenciar" : "🔊 Activar";
    this.btnMute.classList.toggle('disabled', !this.synthEnabled);
    this.btnMute.title = this.synthEnabled 
      ? "Desactivar síntesis de voz" 
      : "Activar síntesis de voz";
  }

  // Sistema central de eventos
  _onEvent(event) {
    switch(event.type) {
      case 'start':
        this._handleStartEvent();
        break;
        
      case 'end':
        this._handleEndEvent();
        break;
        
      case 'error':
        this._handleErrorEvent(event.error);
        break;
        
      case 'result':
        this._handleResultEvent(event.transcript);
        break;
    }
  }

  // Manejar evento de inicio
  _handleStartEvent() {
    this.btnVoice.textContent = "🎙️ Grabando...";
    this.btnVoice.classList.add("recording");
    this.btnVoice.disabled = false;
  }

  // Manejar evento de fin
  _handleEndEvent() {
    this.btnVoice.textContent = "🎤 Iniciar Voz";
    this.btnVoice.classList.remove("recording");
    this.btnVoice.disabled = false;
  }

  // Manejar evento de error
  _handleErrorEvent(error) {
    console.error('Error en reconocimiento:', error);
    this.btnVoice.textContent = "❌ Error";
    this.btnVoice.classList.add("error");
    setTimeout(() => {
      this.btnVoice.textContent = "🎤 Iniciar Voz";
      this.btnVoice.classList.remove("error");
    }, 2000);
  }

  // Manejar evento de resultado
  _handleResultEvent(transcript) {
    if (this.onResult && typeof this.onResult === 'function') {
      this.onResult(transcript);
    }
  }

  // Configurar ajustes de voz
  setVoiceSettings(settings) {
    Object.entries(settings).forEach(([key, value]) => {
      if (this.voiceSettings.hasOwnProperty(key)) {
        this.voiceSettings[key] = value;
      }
    });
  }

  // Destructor
  destroy() {
    this._cleanupRecognition();
    this._cleanupAudio();
    this.btnVoice.removeEventListener('click', this._handleVoiceClick);
    this.btnMute.removeEventListener('click', this.toggleSynth);
  }
}
