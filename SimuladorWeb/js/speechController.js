// src/speechController.js

// Asegúrate de tener APP_SETTINGS con openAIKey y openAISpeechEndpoint definidos en tu proyecto.
export class SpeechController {
  constructor(btnVoice, btnMute, lang = "es-MX") {
    this.btnVoice = btnVoice;
    this.btnMute = btnMute;
    this.lang = lang;

    // Control de síntesis y reconocimiento
    this.synthEnabled = true;       // Permite/deshabilita síntesis de voz
    this.remoteTTS    = true;       // Permite/deshabilita TTS vía API OpenAI
    this.recognition  = null;
    this.isRecording  = false;
    this._timeoutId   = null;

    // Opciones de reconocimiento y reposo
    this.continuous   = false;
    this.pauseDuration= 0;

    // Ajustes de voz (pitch, rate, volume)
    this.voiceSettings = { pitch: 1, rate: 1, volume: 1 };

    // Monta listeners en botones
    this._setupButtons();
  }

  // ========================
  // Configuración de UI
  // ========================
  _setupButtons() {
    this.btnVoice.addEventListener("click", () => this._handleVoiceClick());
    this.btnMute.addEventListener("click",  () => this._handleMuteClick());
    this._updateMuteUI();
  }

  _handleVoiceClick() {
    if (this.isRecording) this.stopRecognition();
    else this.startRecognition(this._onEvent.bind(this));
  }

  _handleMuteClick() {
    this.toggleSynth();
    this._updateMuteUI();
  }

  _updateMuteUI() {
    // Texto e indicador de estado
    this.btnMute.textContent = this.synthEnabled
      ? "🔇 Silenciar Voz"
      : "🔊 Activar Voz";

    // Clases Bootstrap (o tus clases) para diferenciar
    this.btnMute.classList.toggle("btn-danger", !this.synthEnabled);
    this.btnMute.classList.toggle("btn-success", this.synthEnabled);
  }

  // ========================
  // Eventos internos
  // ========================
  _onEvent(event) {
    switch (event.type) {
      case "start":
        this.btnVoice.textContent = "🎙️ Grabando...";
        this.btnVoice.classList.add("active");
        break;
      case "end":
        this.btnVoice.textContent = "🎤 Hablar";
        this.btnVoice.classList.remove("active");
        break;
      case "error":
        alert(`Error de reconocimiento: ${event.error}`);
        break;
      case "result":
        if (this.onResult) this.onResult(event.transcript);
        break;
    }
  }

  // ========================
  // Síntesis de voz híbrida
  // ========================
  async speak(text) {
    if (!this.synthEnabled) return;

    if (this.remoteTTS) {
      try {
        const response = await fetch(APP_SETTINGS.openAISpeechEndpoint, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${APP_SETTINGS.openAIKey}`,
            "Content-Type":  "application/json"
          },
          body: JSON.stringify({
            model:           "gpt-4o-mini-tts",
            input:           text,
            voice:           "coral",       // alloy, echo, fable...
            response_format: "mp3"
          })
        });

        if (!response.ok) throw new Error(`Status ${response.status}`);
        const audioBlob = await response.blob();
        const audioUrl  = URL.createObjectURL(audioBlob);
        const audio     = new Audio(audioUrl);
        audio.volume    = this.voiceSettings.volume;
        audio.play();
        return;  // Éxito: salimos antes del fallback
      } catch (err) {
        console.warn("TTS remota falló, usando nativa:", err);
      }
    }

    // Fallback a síntesis nativa
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang   = this.lang;
    utt.pitch  = this.voiceSettings.pitch;
    utt.rate   = this.voiceSettings.rate;
    utt.volume = this.voiceSettings.volume;
    speechSynthesis.speak(utt);
  }

  // Permite ajustar pitch, rate y volume dinámicamente
  setVoiceSettings({ pitch, rate, volume }) {
    if (pitch  != null) this.voiceSettings.pitch  = pitch;
    if (rate   != null) this.voiceSettings.rate   = rate;
    if (volume != null) this.voiceSettings.volume = volume;
  }

  // Alterna entre TTS remota y nativa
  toggleRemoteTTS() {
    this.remoteTTS = !this.remoteTTS;
    return this.remoteTTS;
  }

  // ========================
  // Reconocimiento de voz
  // ========================
  startRecognition(onResult, { timeout = 10000, continuous = false, pauseBetween = 500 } = {}) {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      alert("Tu navegador no soporta reconocimiento de voz.");
      return;
    }

    this.onResult     = onResult;
    this.continuous   = continuous;
    this.pauseDuration= pauseBetween;

    this.recognition = new Recognition();
    this.recognition.lang            = this.lang;
    this.recognition.interimResults  = false;
    this.recognition.maxAlternatives = 1;
    this.recognition.continuous      = continuous;

    this.recognition.onstart  = () => this._onEvent({ type: "start" });
    this.recognition.onend    = () => this._handleEnd(continuous, onResult, timeout);
    this.recognition.onerror  = e => this._onEvent({ type: "error", error: e.error });
    this.recognition.onresult = ev => {
      const text = ev.results[0]?.[0]?.transcript || "";
      this._onEvent({ type: "result", transcript: text });
    };

    this.recognition.start();
    this.isRecording = true;
    this._timeoutId  = setTimeout(() => this.stopRecognition(), timeout);
  }

  _handleEnd(continuous, onResult, timeout) {
    this.isRecording = false;
    clearTimeout(this._timeoutId);
    this._onEvent({ type: "end" });

    if (continuous) {
      setTimeout(() =>
        this.startRecognition(onResult, { timeout, continuous, pauseBetween: this.pauseDuration }),
        this.pauseDuration
      );
    }
  }

  stopRecognition() {
    if (!this.recognition) return;
    this.recognition.stop();
    this.isRecording = false;
    clearTimeout(this._timeoutId);
    this._onEvent({ type: "end" }); // Asegura actualización UI
  }

  // ========================
  // Control de estado de entrevista
  // ========================
  toggleSynth() {
    this.synthEnabled = !this.synthEnabled;
    speechSynthesis.cancel();
    return this.synthEnabled;
  }

  setInterviewState(active) {
    this.interviewActive = active;
    if (!active) this.stopRecognition();
  }
}
