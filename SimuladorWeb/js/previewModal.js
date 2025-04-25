// ---------- src/previewModal.js ----------
export class PreviewModal {
  constructor(containerElem, respuestas, datosAspirante) {
    this.container = containerElem;
    this.respuestas = respuestas;
    this.d = datosAspirante;
  }

  show() {
    // Limpias el contenedor
    this.container.innerHTML = '';

    // Cabecera de datos del aspirante
    const header = document.createElement('div');
    header.innerHTML = `
      <h5>📌 Datos del Aspirante</h5>
      <p><strong>Nombre:</strong> ${this.d.nombre || "N/A"} ${this.d.apellidos || ""}</p>
      <p><strong>Correo:</strong> ${this.d.correo || "N/A"}</p>
      <p><strong>Teléfono:</strong> ${this.d.telefono || "N/A"}</p>
      <hr>
      <h5>🗂️ Resumen de la Entrevista</h5>
    `;
    this.container.appendChild(header);

    // Cada respuesta
    this.respuestas.forEach((it, ix) => {
      const block = document.createElement('div');
      block.classList.add('mb-3', 'feedback-section');

      // Pregunta y respuesta
      const pq = document.createElement('p');
      pq.innerHTML = `<strong>P${ix + 1}:</strong> ${it.pregunta}`;
      const pr = document.createElement('p');
      pr.innerHTML = `<strong>R:</strong> ${it.respuesta}`;
      block.append(pq, pr);

      // Feedback: objeto o string
      const fb = it.feedback;
      if (typeof fb === 'object' && fb !== null) {
        // Fortalezas
        const h4f = document.createElement('h6');
        h4f.textContent = '🔍 Fortalezas';
        const ulF = document.createElement('ul');
        (fb.fortalezas || []).forEach(f => {
          const li = document.createElement('li');
          li.textContent = f;
          ulF.appendChild(li);
        });

        // Oportunidades
        const h4m = document.createElement('h6');
        h4m.textContent = '⚙️ Oportunidades';
        const ulM = document.createElement('ul');
        (fb.mejoras || []).forEach(m => {
          const li = document.createElement('li');
          li.textContent = m;
          ulM.appendChild(li);
        });

        // Tip
        const h4t = document.createElement('h6');
        h4t.textContent = '💡 Tip';
        const pt = document.createElement('p');
        pt.textContent = fb.tip || '';

        block.append(h4f, ulF, h4m, ulM, h4t, pt);
      } else {
        // Fallback simple
        const pfb = document.createElement('p');
        pfb.innerHTML = `<strong>🧠 Feedback:</strong> ${fb}`;
        block.appendChild(pfb);
      }

      this.container.appendChild(block);
    });
  }

}
