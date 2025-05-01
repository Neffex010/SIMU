export const QUESTIONS = {
  tecnicas: [
    "¿Qué conocimientos básicos tienes en cualquier área?",
    "¿Tienes conocimiento en cuanto a planeación estratégica?",
    "¿Sabes algún idioma extra aparte del español?",
    "¿Cuánta experiencia tienes en el puesto que solicitas? ¿Cuál sería tu experiencia?",
    "¿En cuántos proyectos has participado hasta ahora en relación con tu carrera?",
    "De ser el caso que has participado, ¿qué roles has tenido en los proyectos?",
    "Describe qué es un perfil full stack.",
    "Describe las plataformas de desarrollo que conozcas (N-Tier, etc.).",
    "¿Cuál es tu experiencia en el diseño de clases y manipulación de objetos en la programación (incluyendo los lenguajes)?",
    "Dar ejemplos de pequeños casos o cosas muy concretas para calificar sus respuestas ante estas situaciones.",
    "Describe los modelos de análisis de datos.",
    "¿Qué diferencias ves entre un hosting y una nube de cómputo?",
    "¿Por qué es importante clasificar tu experiencia (junior, semi senior y senior)?",
    "¿Puedes describir tu proceso para desarrollar un proyecto desde cero?",
    "¿Qué consideras más importante: la rapidez de entrega o la calidad del código? ¿Por qué?",
    "¿Qué frameworks o lenguajes de programación dominas actualmente?",
    "¿Tienes experiencia trabajando con bases de datos? ¿Qué tipo (relacional, no relacional)?",
    "¿Qué medidas de seguridad aplicas en tus desarrollos o implementaciones?",
    "¿Cómo asegurarías la escalabilidad de una aplicación o solución que desarrollas?",
    "¿Qué lenguajes de programación dominas y en qué proyectos los aplicaste?"
  ],
  blandas: [
    "¿Sabes colaborar en equipo?",
    "¿Sabes trabajar bajo presión?",
    "¿Cuentas con disponibilidad de tiempo?",
    "¿Cómo manejarías algún problema que se llegue a presentar en tu área?",
    "¿Cuáles son las aspiraciones que esperas?",
    "¿Cuáles son las técnicas y flaquezas que tienes?",
    "Realizar preguntas que sean un 4 para el candidato y saber la respuesta que da.",
    "¿Aparte de lo académico qué otros logros tienes por fuera?",
    "Exponer casos o situaciones difíciles para el candidato y saber qué es lo que haría.",
    "Una vez que terminas las actividades programadas por el líder de equipo, ¿qué actividades harías o te quedarías sin hacer nada?",
    "¿Consideras que el teléfono celular no se debería utilizar en horas laborales a menos que sea una emergencia?",
    "¿Cómo manejas la presión ante una entrega de un proyecto?",
    "¿Tu experiencia la compartirías con un compañero de trabajo?",
    "¿Consideras útil acercarte a un compañero de trabajo para consejos técnicos?",
    "¿Tú cómo te consideras: un líder o un seguidor de líder?",
    "¿Qué sueldo consideras justo para el rol que estás solicitando?",
    "¿Tienes experiencia laboral aplicando tus conocimientos en alguna empresa, o sería esta tu primera oportunidad?",
    "¿Cuéntame sobre un conflicto en equipo y cómo lo resolviste?"
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
    
  openAIEndpoint: '/.netlify/functions/openaiFeedback'
};
