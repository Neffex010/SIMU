document.getElementById("formDatos").addEventListener("submit", function (e) {
  e.preventDefault();

  const datos = {
    control: document.getElementById("control").value,
    nombre: document.getElementById("nombre").value,
    apellidos: document.getElementById("apellidos").value,
    correo: document.getElementById("correo").value,
    telefono: document.getElementById("telefono").value,
  };

  localStorage.setItem("datosAspirante", JSON.stringify(datos));
  window.location.href = "simulador.html";
});

/* function reproducirMensajeBienvenida() {
  const mensaje =
    "¡Bienvenido al Simulador de Entrevistas del Instituto Tecnológico de Pachuca! Por favor, completa tus datos para comenzar.";
  const synth = window.speechSynthesis;

  function speakWhenVoicesAreReady() {
    const voices = synth.getVoices();
    if (!voices.length) {
      setTimeout(speakWhenVoicesAreReady, 100);
      return;
    }

    const vozSabina = voices.find((voice) =>
      voice.name.toLowerCase().includes("sabina") ||
      (voice.lang.startsWith("es") && voice.name.toLowerCase().includes("female"))
    );

    const utterance = new SpeechSynthesisUtterance(mensaje);
    utterance.lang = "es-MX";
    if (vozSabina) {
      utterance.voice = vozSabina;
    }
    synth.speak(utterance);
  }

  if (!synth.getVoices().length) {
    synth.onvoiceschanged = speakWhenVoicesAreReady;
  } else {
    speakWhenVoicesAreReady();
  }
} */



const toggleBtn = document.getElementById('toggleDarkMode');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

function applyDarkMode(dark) {
  document.body.classList.toggle('dark-mode', dark);
  localStorage.setItem('darkMode', dark);
}

// Activar según sistema o preferencia guardada
const saved = localStorage.getItem('darkMode');
if (saved !== null) {
  applyDarkMode(saved === 'true');
} else {
  applyDarkMode(prefersDark.matches);
}

// Toggle manual
toggleBtn.addEventListener('click', () => {
  const isDark = document.body.classList.contains('dark-mode');
  applyDarkMode(!isDark);
});
//  — Header sticky & shrink on scroll —
const header = document.querySelector('header');
window.addEventListener('scroll', () => {
  header.classList.toggle('shrink', window.scrollY > 50);
});


/* window.addEventListener("load", reproducirMensajeBienvenida); */
