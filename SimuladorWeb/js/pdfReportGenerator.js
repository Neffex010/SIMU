export class PDFReportGenerator {
  constructor(respuestas, datosAspirante, config, jsPDF) {
    this.respuestas = respuestas;
    this.d = datosAspirante;
    this.config = config;
    this.jsPDF = jsPDF;
  }

  async _loadImage(url) {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.src = url;
    });
  }

  async generateAndSave() {
    const doc = new this.jsPDF();
    let y = 45;
    const margin = 20;
    const width = doc.internal.pageSize.width - 2 * margin;

    // Encabezado
    const [logoLeft, logoRight] = await Promise.all([
      this._loadImage(this.config.logos.izquierdo),
      this._loadImage(this.config.logos.derecho)
    ]);
    doc.setFillColor(...this.config.colores.header);
    doc.rect(0, 0, doc.internal.pageSize.width, 40, 'F');
    doc.addImage(logoLeft, 'PNG', 10, 5, 30, 30);
    doc.addImage(logoRight, 'PNG', doc.internal.pageSize.width - 40, 5, 30, 30);
    doc.setFontSize(this.config.fuentes.titulo);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("INFORME DE ENTREVISTA TÉCNICA", doc.internal.pageSize.width / 2, 25, null, "center");

    const addSection = (title, content) => {
      doc.setFontSize(this.config.fuentes.seccion);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...this.config.colores.titulo);
      doc.text(title, margin, y);
      y += 10;
      doc.setDrawColor(...this.config.colores.titulo);
      doc.line(margin, y, margin + 30, y);
      y += 15;
      doc.setFontSize(this.config.fuentes.cuerpo);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...this.config.colores.texto);
      const lines = doc.splitTextToSize(content, width);
      lines.forEach(line => {
        if (y > 260) { doc.addPage(); y = 40; }
        doc.text(line, margin, y);
        y += 7;
      });
      y += 20;
    };

    // Secciones
    addSection("INFORMACIÓN DEL CANDIDATO",
      `Nombre: ${this.d.nombre || "N/A"} ${this.d.apellidos || ""}\n` +
      `Control: ${this.d.control || "N/A"}\n` +
      `Contacto: ${this.d.correo || "N/A"} | ${this.d.telefono || "N/A"}`
    );

    const stats = {
      total: this.respuestas.length,
      tecnicas: this.respuestas.filter(r => r.modulo === 'tecnicas').length,
      blandas: this.respuestas.filter(r => r.modulo === 'blandas').length,
      promedio: Math.round(
        this.respuestas.reduce((acc, r) => acc + r.respuesta.length, 0) /
        (this.respuestas.length || 1)
      )
    };
    this.respuestas.forEach((item, i) => {
      const type = item.modulo === 'tecnicas' ? 'TÉCNICA' : 'BLANDA';
      const fb = item.feedback;

      // Construimos un string legible según si fb es objeto o cadena
      let feedbackText;
      if (typeof fb === 'object' && fb !== null) {
        feedbackText =
          'Fortalezas:\n' +
          (fb.fortalezas || []).map(f => `• ${f}`).join('\n') +
          '\n\n' +
          'Oportunidades:\n' +
          (fb.mejoras || []).map(m => `• ${m}`).join('\n') +
          '\n\n' +
          'Tip:\n' +
          (fb.tip || '');
      } else {
        feedbackText = fb;  // Si algo salió mal, lo imprimimos tal cual
      }

      addSection(
        `PREGUNTA ${i + 1}`,
        `Tipo: ${type}\n` +
        `Pregunta: ${item.pregunta}\n` +
        `Respuesta: ${item.respuesta}\n\n` +
        feedbackText
      );
    });
    doc.setFillColor(...this.config.colores.piePagina);
    doc.rect(0, 285, doc.internal.pageSize.width, 15, 'F');
    doc.setFontSize(this.config.fuentes.pequeño);
    doc.setTextColor(255, 255, 255);
    doc.text("Documento oficial - Tecnológico Nacional de México | LITP", margin, 292);
    doc.text(`Generado: ${new Date().toLocaleDateString()}`, doc.internal.pageSize.width - margin, 292, null, 'right');

    doc.save(`Informe_${this.d.nombre || ""}_${this.d.control || ""}.pdf`);
  }
}
