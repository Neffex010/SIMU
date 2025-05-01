export const QUESTIONS = {
  tecnicas: [
    // Preguntas técnicas adaptadas a recién graduados
    "¿Qué tecnologías o lenguajes aprendiste durante tu carrera? ¿Cuál dominas mejor?",
    "¿Tuviste algún curso o proyecto donde practicaras planeación de proyectos? Cuéntame.",
    "¿Qué nivel de inglés tienes? (u otro idioma)",
    "¿Realizaste prácticas profesionales o servicio social? ¿Qué hiciste allí?",
    "Durante la carrera, ¿en cuántos proyectos académicos trabajaste? ¿Qué rol tuviste?",
    "¿Qué entiendes por 'desarrollador full stack'? ¿Crees que es tu perfil?",
    "¿Qué arquitecturas de software viste en la universidad? (Ej: MVC, cliente-servidor)",
    "¿Cómo aplicaste la programación orientada a objetos en tus proyectos escolares?",
    "Si te pido resolver [problema técnico básico, ej: un CRUD], ¿cómo lo harías?",
    "¿Qué métodos de análisis de datos aprendiste? ¿Los aplicaste en algún proyecto?",
    "¿Sabes la diferencia entre un hosting y la nube? ¿Has usado alguno?",
    "¿Cómo desarrollarías un proyecto pequeño desde cero? Explica tu proceso.",
    "¿Qué frameworks o herramientas tecnológicas usaste en la universidad?",
    "¿Has trabajado con bases de datos? ¿Qué tipo (SQL o NoSQL) y para qué?",
    "¿Qué prácticas de seguridad básicas aplicarías en un desarrollo web?",
    "¿Cómo asegurarías que una aplicación escolar pueda crecer?"
  ],
  blandas: [
    // Preguntas blandas para evaluar actitud y adaptabilidad
    "¿Cómo te describirías trabajando en equipo? Pon un ejemplo de la escuela.",
    "¿Cómo manejas los plazos ajustados? Ejemplo: cuando tenías que entregar un proyecto escolar.",
    "¿Tienes disponibilidad de horario? ¿Qué limitaciones podrías tener?",
    "Si un compañero no colabora en un trabajo en equipo, ¿qué harías?",
    "¿Qué esperas aprender en tus primeros años de trabajo?",
    "¿Cuáles son tus mayores fortalezas y qué área te gustaría mejorar?",
    "Además de la carrera, ¿qué habilidades has aprendido por tu cuenta? (Ej: cursos, hobbies técnicos)",
    "Si no sabes resolver un problema técnico, ¿qué pasos seguirías?",
    "Al terminar tus tareas asignadas, ¿cómo aprovecharías el tiempo?",
    "¿Qué opinas del uso del celular en el trabajo?",
    "¿Cómo organizas tu tiempo cuando tienes múltiples pendientes?",
    "¿Te gustaría mentoría de alguien con más experiencia? ¿Por qué?",
    "¿Prefieres seguir instrucciones o proponer tus propias ideas? Ejemplo.",
    "Según el mercado y tu perfil, ¿qué salario esperarías?",
    "¿Has tenido algún conflicto en equipo durante la escuela? ¿Cómo lo solucionaste?"
  ]
};

export const PDF_CONFIG = {
  colores: {
    header: [13, 59, 102],
    piePagina: [13, 59, 102],
    titulo: [230, 57, 70],
    texto: [51, 51, 51]
  },
  fuentes: {
    titulo: 16,
    seccion: 12,
    cuerpo: 10,
    pequeño: 8
  },
  logos: {
    izquierdo: '/image/Tecnologico_Nacional_de_Mexico.svg.png',
    derecho: './image/LITP.png'
  }
};

export const APP_SETTINGS = {
  tiempoPregunta: 60,
    
  openAIEndpoint: '/.netlify/functions/openaiFeedback',
  openAISpeechEndpoint: '/.netlify/functions/openaiSpeech'
};
