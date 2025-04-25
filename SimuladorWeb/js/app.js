// simuladorEntrevistasPOO.js

// —— Clases de soporte —— //

class DataManager {
  constructor(storageKey = "datosAspirante") {
    this.storageKey = storageKey;
    this.datosAspirante = null;
  }

  load() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      this.datosAspirante = raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.warn("LocalStorage corrupto, limpiando y redirigiendo.", e);
      localStorage.removeItem(this.storageKey);
      this.datosAspirante = null;
    }
    return this.datosAspirante;
  }

  requireDataOrRedirect(redirectUrl = "../index.html") {
    if (!this.load()) window.location.href = redirectUrl;
    return this.datosAspirante;
  }
}

class Timer {
  constructor(displayElem, duration = 60, onTimeout = () => {}) {
    this.displayElem = displayElem;
    this.duration = duration;
    this.onTimeout = onTimeout;
    this._remaining = duration;
    this._intervalId = null;
  }

  start() {
    this.reset();
    this._intervalId = setInterval(() => {
      this._remaining--;
      this.updateDisplay();
      if (this._remaining <= 0) {
        this.stop();
        this.onTimeout();
      }
    }, 1000);
  }

  reset() {
    this.stop();
    this._remaining = this.duration;
    this.updateDisplay();
  }

  stop() {
    if (this._intervalId) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }
  }

  updateDisplay() {
    this.displayElem.textContent = `${this._remaining}s`;
  }
}

class SpeechController {
  constructor(btnVoice, btnMute, lang = "es-MX") {
    this.btnVoice = btnVoice;
    this.btnMute = btnMute;
    this.lang = lang;
    this.synthEnabled = true;
    this.recognition = null;
    this._setupMuteButton();
  }

  _setupMuteButton() {
    this.btnMute.addEventListener("click", () => this.toggleSynth());
    this._updateMuteUI();
  }

  speak(text) {
    if (!this.synthEnabled) return;
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = this.lang;
    speechSynthesis.speak(utt);
  }

  startRecognition(onResult, timeout = 10000) {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Tu navegador no soporta reconocimiento de voz.");
      return;
    }
    if (this.recognition) {
      this.recognition.stop();
      return;
    }
    const rec = new webkitSpeechRecognition();
    this.recognition = rec;
    rec.lang = this.lang;
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.timeout = timeout;

    rec.onstart = () => {
      this.btnVoice.textContent = "🎙️ Grabando...";
      this.btnVoice.classList.add("active");
    };
    rec.onend = () => {
      this.btnVoice.textContent = "🎤 Hablar";
      this.btnVoice.classList.remove("active");
      this.recognition = null;
    };
    rec.onerror = e => {
      console.error("Error de reconocimiento:", e.error);
      alert(`Error: ${e.error}`);
    };
    rec.onresult = event => {
      const text = (event.results[0] && event.results[0][0])
        ? event.results[0][0].transcript
        : null;
      onResult(text);
    };
    rec.start();
  }

  toggleSynth() {
    this.synthEnabled = !this.synthEnabled;
    speechSynthesis.cancel();
    this._updateMuteUI();
    console.log(`Síntesis de voz: ${this.synthEnabled ? "ACTIVA" : "PAUSADA"}`);
  }

  _updateMuteUI() {
    this.btnMute.textContent = this.synthEnabled ? "🔇 Silenciar Voz" : "🔊 Activar Voz";
    this.btnMute.classList.toggle("btn-danger", !this.synthEnabled);
    this.btnMute.classList.toggle("btn-success", this.synthEnabled);
  }
}

class PDFReportGenerator {
  constructor(respuestas, datosAspirante, config, jsPDF){
    this.respuestas = respuestas;
    this.d = datosAspirante;
    this.config = config;
    this.jsPDF = jsPDF;
  }

  async _cargarImagen(url) {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.src = url;
    });
  }

  async generateAndSave() {
    const doc = new this.jsPDF();
    let y = 45;
    const margen = 20;
    const ancho = doc.internal.pageSize.width - 2 * margen;

    // Encabezado
    const [logoIzq, logoDer] = await Promise.all([
      this._cargarImagen(this.config.logos.izquierdo),
      this._cargarImagen(this.config.logos.derecho)
    ]);
    doc.setFillColor(...this.config.colores.header);
    doc.rect(0,0, doc.internal.pageSize.width, 40, 'F');
    doc.addImage(logoIzq, 'PNG', 10, 5, 30, 30);
    doc.addImage(logoDer, 'PNG', doc.internal.pageSize.width-40, 5, 30, 30);
    doc.setFontSize(this.config.fuentes.titulo);
    doc.setFont("helvetica","bold");
    doc.setTextColor(255,255,255);
    doc.text("INFORME DE ENTREVISTA TÉCNICA", doc.internal.pageSize.width/2,25,null,"center");

    const agregarSeccion = (titulo, contenido) => {
      doc.setFontSize(this.config.fuentes.seccion);
      doc.setFont("helvetica","bold");
      doc.setTextColor(...this.config.colores.titulo);
      doc.text(titulo, margen, y);
      y += 10;
      doc.setDrawColor(...this.config.colores.titulo);
      doc.setLineWidth(0.5);
      doc.line(margen, y, margen+30, y);
      y += 15;
      doc.setFontSize(this.config.fuentes.cuerpo);
      doc.setFont("helvetica","normal");
      doc.setTextColor(...this.config.colores.texto);
      const lines = doc.splitTextToSize(contenido, ancho);
      lines.forEach(line => {
        if (y > 260) { doc.addPage(); y=40; }
        doc.text(line, margen, y);
        y += 7;
      });
      y += 20;
    };

    // Secciones
    agregarSeccion("INFORMACIÓN DEL CANDIDATO",
      `Nombre: ${this.d.nombre||"N/A"} ${this.d.apellidos||""}\n` +
      `Control: ${this.d.control||"N/A"}\n` +
      `Contacto: ${this.d.correo||"N/A"} | ${this.d.telefono||"N/A"}`
    );

    const stats = {
      total: this.respuestas.length,
      tecnicas: this.respuestas.filter(r=>r.modulo==='tecnicas').length,
      blandas: this.respuestas.filter(r=>r.modulo==='blandas').length,
      promedio: Math.round(
        this.respuestas.reduce((acc,r)=>acc+r.respuesta.length,0) /
        (this.respuestas.length||1)
      )
    };
    agregarSeccion("ESTADÍSTICAS DE LA ENTREVISTA",
      `Total: ${stats.total}\n• Técnicas: ${stats.tecnicas}\n• Blandas: ${stats.blandas}\n`+
      `Longitud promedio: ${stats.promedio} caracteres`
    );
    this.respuestas.forEach((item,i)=>{
      const tipo = item.modulo==='tecnicas'?"TÉCNICA":"BLANDA";
      agregarSeccion(`PREGUNTA ${i+1}`,
        `Tipo: ${tipo}\nPregunta: ${item.pregunta}\nRespuesta: ${item.respuesta}\n`+
        `Feedback: ${item.feedback}`
      );
    });

    // Pie de página
    doc.setFillColor(...this.config.colores.piePagina);
    doc.rect(0,285, doc.internal.pageSize.width,15,'F');
    doc.setFontSize(this.config.fuentes.pequeño);
    doc.setTextColor(255,255,255);
    doc.text("Documento oficial - Tecnológico Nacional de México | LITP", margen,292);
    doc.text(`Generado: ${new Date().toLocaleDateString()}`, doc.internal.pageSize.width-margen,292,null,'right');

    doc.save(`Informe_${this.d.nombre||""}_${this.d.control||""}.pdf`);
  }
}

class PreviewModal {
  constructor(containerElem, respuestas, datosAspirante) {
    this.container = containerElem;
    this.respuestas = respuestas;
    this.d = datosAspirante;
  }

  show() {
    const d = this.d;
    this.container.innerHTML = `
      <h5>📌 Datos del Aspirante</h5>
      <p><strong>Nombre:</strong> ${d.nombre||"N/A"} ${d.apellidos||""}</p>
      <p><strong>Correo:</strong> ${d.correo||"N/A"}</p>
      <p><strong>Teléfono:</strong> ${d.telefono||"N/A"}</p><hr>
      <h5>🗂️ Resumen de la Entrevista</h5>
    `;
    this.respuestas.forEach((it,ix)=>{
      this.container.innerHTML += `
        <div class="mb-3">
          <p><strong>P${ix+1}:</strong> ${it.pregunta}</p>
          <p><strong>R:</strong> ${it.respuesta}</p>
          <p><strong>🧠:</strong> ${it.feedback}</p>
        </div>
      `;
    });
  }
}

// —— Clase principal POO —— //

class InterviewSimulator {
  constructor(config) {
    // Configuración inicial y DOM
    this.config = config;
    this.dataMgr = new DataManager();
    this.datosAspirante = this.dataMgr.requireDataOrRedirect();
    this.preguntasTec = config.preguntasTecnicas;
    this.preguntasBland = config.preguntasBlandas;
    this.respuestasUsuario = [];
    this.moduloActual = null;
    this.indice = -1;

    // Elementos y controladores
    this.cardBienvenida = document.getElementById("bienvenidaCard");
    this.nombreElem = document.getElementById("nombreUsuario");
    this.controlElem = document.getElementById("controlUsuario");
    this.preguntaElem = document.getElementById("pregunta");
    this.feedbackElem = document.getElementById("feedback");
    this.respuestaInput = document.getElementById("respuesta");
    this.timer = new Timer(
      document.getElementById("timer"),
      config.tiempoPregunta,
      () => this._onTimeout()
    );
    this.speech = new SpeechController(
      document.getElementById("btnVoz"),
      document.getElementById("btnMute"),
      "es-MX"
    );

    // Botones
    document.getElementById("btnComenzar").addEventListener("click", ()=>this.startInterview());
    document.getElementById("btnSiguiente").addEventListener("click", ()=>this.nextQuestion());
    document.getElementById("btnVoz").addEventListener("click", ()=>
      this.speech.startRecognition(text=>{ if(text) this.respuestaInput.value=text; else this.showNoVoice(); })
    );
    document.getElementById("btnVistaPrevia").addEventListener("click", ()=>this.preview.show());
    ["btnDescargarPDF","descargarDesdeModal"].forEach(id=>{
      document.getElementById(id).addEventListener("click", ()=>this.generatePDF());
    });

    // Preview y PDF gen
    this.preview = new PreviewModal(
      document.getElementById("vistaPreviaContenido"),
      this.respuestasUsuario,
      this.datosAspirante
    );
    this.pdfGen = new PDFReportGenerator(
      this.respuestasUsuario,
      this.datosAspirante,
      config.pdfConfig,
      window.jspdf.jsPDF
    );
  }

  startInterview() {
    this.moduloActual = 'tecnicas';
    this.indice = 0;
    this.respuestasUsuario.length = 0;
    // UI show/hide
    document.getElementById("inicioEntrevista").classList.add("d-none");
    this.cardBienvenida.classList.remove("d-none");
    this.nombreElem.textContent = `${this.datosAspirante.nombre} ${this.datosAspirante.apellidos}`;
    this.controlElem.textContent = this.datosAspirante.control;
    document.getElementById("pregunta").classList.remove("d-none");
    document.getElementById("moduloActual").classList.remove("d-none");
    document.getElementById("moduloActual").textContent = "Módulo: Habilidades Técnicas";
    this.showQuestion();
  }

  startSoftModule() {
    this.moduloActual = 'blandas';
    this.indice = 0;
    this.feedbackElem.textContent = "✅ Fin módulo técnico. Ahora preguntas blandas.";
    this.feedbackElem.classList.remove("d-none");
    setTimeout(()=>{
      this.feedbackElem.classList.add("d-none");
      document.getElementById("moduloActual").textContent = "Módulo: Habilidades Blandas";
      this.showQuestion();
    }, 3000);
  }

  showQuestion() {
    const list = this.moduloActual==='tecnicas'? this.preguntasTec : this.preguntasBland;
    if (this.indice >= list.length) return this.moduloActual==='tecnicas'? this.startSoftModule() : this.endInterview();

    const texto = list[this.indice];
    this.preguntaElem.textContent = texto;
    this.preguntaElem.classList.add("fade-in");
    setTimeout(()=> this.preguntaElem.classList.remove("fade-in"), 500);
    this.respuestaInput.value = '';
    this.feedbackElem.classList.add("d-none");
    this.timer.reset(); this.timer.start();
    this.speech.speak(texto);
  }

  nextQuestion() {
    this._collectAnswer();
  }

  _onTimeout() {
    this._collectAnswer();
  }

  async _collectAnswer() {
    this.timer.stop();
    const text = this.respuestaInput.value.trim();
    if (!text) return this.showNoAnswer();
    try {
      const analysis = await this._fetchFeedback(text);
      this.respuestasUsuario.push({
        modulo: this.moduloActual,
        pregunta: this.moduloActual==='tecnicas'? this.preguntasTec[this.indice] : this.preguntasBland[this.indice],
        respuesta: text,
        feedback: analysis
      });
      this.feedbackElem.textContent = `🧠 Feedback: ${analysis}`;
      this.feedbackElem.classList.remove("d-none");
      this.indice++;
      setTimeout(()=>this.showQuestion(), 4000);
    } catch (e) {
      console.error(e);
      this.feedbackElem.textContent = "❌ Error analizando respuesta.";
      this.feedbackElem.classList.remove("d-none");
    }
  }

  showNoVoice() {
    this.feedbackElem.textContent = "No se detectó voz.";
    this.feedbackElem.classList.remove("d-none");
  }

  showNoAnswer() {
    this.feedbackElem.textContent = "⚠️ No se detectó una respuesta.";
    this.feedbackElem.classList.remove("d-none");
  }

  async _fetchFeedback(text) {
    const resp = await fetch(APP_SETTINGS.openAIEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${APP_SETTINGS.openAIKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'Eres un experto en entrevistas laborales. Evalúa respuestas de candidatos y proporciona retroalimentación útil.' },
          { role: 'user', content: `Evalúa esta respuesta y devuelve un JSON con "feedback" (texto útil para mejorar) y "score" (número del 1 al 5). Respuesta: "${text}"` }
        ],
        temperature: 0.5
      })
    });
    const data = await resp.json();
    try {
      const feedbackObject = JSON.parse(data.choices[0].message.content.trim());
      return feedbackObject;
    } catch (e) {
      // fallback si no responde en formato JSON
      return {
        feedback: data.choices[0].message.content.trim(),
        score: 3
      };
    }
  }
  

  endInterview() {
    this.preguntaElem.textContent = "✅ Entrevista finalizada. ¡Buen trabajo!";
    document.getElementById("btnVistaPrevia").classList.remove("d-none");
    document.getElementById("btnDescargarPDF").classList.remove("d-none");
  }

  generatePDF() {
    this.pdfGen.generateAndSave();
  }
}

// —— Inicialización —— //

document.addEventListener("DOMContentLoaded", () => {
  const simulator = new InterviewSimulator({
    preguntasTecnicas: [
      "¿Qué lenguajes de programación dominas y en qué proyectos los aplicaste?"
    ],
    preguntasBlandas: [
      "¿Cuéntame sobre un conflicto en equipo y cómo lo resolviste?"
    ],
    tiempoPregunta: 60,
    openAIKey: "TU_API_KEY_AQUÍ",
    openAIEndpoint: "https://api.openai.com/v1/chat/completions",
    pdfConfig: {
      colores: { header:[13,59,102], piePagina:[13,59,102], titulo:[230,57,70], texto:[51,51,51] },
      fuentes: { titulo:16, seccion:12, cuerpo:10, pequeño:8 },
      logos: { izquierdo:'/image/Tecnologico_Nacional_de_Mexico.svg.png', derecho:'./image/LITP.png' }
    }
  });
});
