export const PROVINCES = [
  "Distrito Nacional",
  "Azua",
  "Baoruco",
  "Barahona",
  "Dajabón",
  "Duarte",
  "Elías Piña",
  "El Seibo",
  "Espaillat",
  "Hato Mayor",
  "Hermanas Mirabal",
  "Independencia",
  "La Altagracia",
  "La Romana",
  "La Vega",
  "María Trinidad Sánchez",
  "Monseñor Nouel",
  "Monte Cristi",
  "Monte Plata",
  "Pedernales",
  "Peravia",
  "Puerto Plata",
  "Samaná",
  "San Cristóbal",
  "San José de Ocoa",
  "San Juan",
  "San Pedro de Macorís",
  "Sánchez Ramírez",
  "Santiago",
  "Santiago Rodríguez",
  "Santo Domingo",
  "Valverde",
];
export const CATEGORIES = [
  "Tecnología y emergencias",
  "Privacidad y seguridad",
  "Accidentes de tránsito",
  "Activación SOS",
  "GPS y ubicación",
  "Sensores móviles",
  "Ideas para mejorar Alerta RD",
  "Experiencias ciudadanas",
];
export const FEATURES = [
  {
    id: "sos",
    title: "Botón SOS",
    short: "Menos pasos para solicitar ayuda.",
    icon: "siren",
    image: "sos",
    detail:
      "Una activación desde la aplicación iniciaría el protocolo que cada persona configure. Se estudiarán mecanismos de confirmación, cancelación y prevención de falsas alarmas.",
  },
  {
    id: "gps",
    title: "Ubicación GPS",
    short: "Compartir dónde necesitas ayuda.",
    icon: "map",
    image: "gps",
    detail:
      "La ubicación se compartiría durante una alerta con destinatarios autorizados. La precisión depende del dispositivo, los permisos y el entorno. No se propone rastreo permanente.",
  },
  {
    id: "contacts",
    title: "Contactos de emergencia",
    short: "Conectar con quienes te cuidan.",
    icon: "users",
    image: "contactos",
    detail:
      "Cada persona elegiría previamente a sus contactos de confianza. El envío y la recepción dependerían de conectividad y disponibilidad del servicio; no equivalen a un despacho de emergencias.",
  },
  {
    id: "physical",
    title: "Activación física",
    short: "Una alternativa sin abrir la app.",
    icon: "smartphone",
    image: "botones",
    detail:
      "Se investigará la viabilidad de patrones con botones físicos. Android e iOS imponen restricciones distintas, por lo que esta función no está garantizada en todos los teléfonos.",
  },
  {
    id: "accident",
    title: "Detección de accidentes",
    short: "Sensores que podrían reconocer un impacto.",
    icon: "car",
    image: "accidente",
    detail:
      "Acelerómetro, giroscopio, GPS y cambios bruscos de movimiento podrían combinarse para detectar posibles accidentes. Requiere validación técnica y una cuenta regresiva que permita cancelar falsas alarmas.",
  },
  {
    id: "audio",
    title: "Audio de emergencia",
    short: "Una opción bajo tu control.",
    icon: "mic",
    image: "audio",
    detail:
      "Un posible registro de audio requeriría consentimiento previo, permisos del sistema y revisión de la regulación aplicable. Debe ser configurable, limitado y protegido. Este foro no activa el micrófono.",
  },
  {
    id: "medical",
    title: "Información médica",
    short: "Solo lo que decidas configurar.",
    icon: "heart",
    image: "medicos",
    detail:
      "La propuesta contempla información básica de emergencia elegida por la persona. Este foro no solicita ni almacena historias clínicas, diagnósticos ni datos médicos.",
  },
  {
    id: "tracking",
    title: "Seguimiento",
    short: "Entender el estado de una alerta.",
    icon: "activity",
    image: "seguimiento",
    detail:
      "Una vista del estado de la alerta permitiría distinguir preparación, envío y confirmación. Una notificación enviada no debe presentarse como ayuda garantizada ni respuesta institucional.",
  },
  {
    id: "history",
    title: "Historial",
    short: "Consultar eventos anteriores.",
    icon: "history",
    image: "proximamente",
    detail:
      "Registro de eventos con opciones de consulta, eliminación y retención limitada. El diseño de estas opciones se definirá a partir de la investigación y las pruebas de privacidad.",
  },
] as const;
export const OFFICIAL_DEBATES = [
  {
    id: "debate-accidentes",
    category: CATEGORIES[2],
    title: "¿Debería Alerta RD detectar automáticamente accidentes?",
    body: "Los sensores podrían reconocer un posible impacto y abrir una cuenta regresiva. ¿Qué confirmaciones ayudarían a evitar falsas alarmas? Comparte tus argumentos a favor, tus dudas y las condiciones que considerarías necesarias.",
  },
  {
    id: "debate-botones",
    category: CATEGORIES[3],
    title: "¿Y si pudieras activar una alerta sin desbloquear el teléfono?",
    body: "Estamos explorando la viabilidad de los botones físicos. ¿En qué situaciones tendría sentido? ¿Qué patrón sería fácil de recordar y difícil de activar por accidente?",
  },
  {
    id: "debate-datos",
    category: CATEGORIES[4],
    title: "¿Qué información debería enviarse durante una emergencia?",
    body: "Ubicación, un mensaje breve y contactos configurados son algunas posibilidades. ¿Qué información sería necesaria y qué datos deberían quedar fuera?",
  },
  {
    id: "debate-audio",
    category: CATEGORIES[1],
    title: "¿Debería permitirse configurar grabación de audio?",
    body: "Esta posibilidad requiere consentimiento, permisos y una revisión de sus implicaciones. ¿Qué controles sobre duración, destinatarios y eliminación necesitarías para confiar en ella?",
  },
  {
    id: "debate-privacidad",
    category: CATEGORIES[1],
    title: "¿Cuáles deberían ser los límites de privacidad?",
    body: "Diseñemos los límites desde el principio. ¿Quién podría acceder a los datos, durante cuánto tiempo y con qué posibilidades de revocar el acceso?",
  },
];
const yesNo = ["Sí", "No", "No estoy seguro/a"];
export const SURVEY_QUESTIONS = [
  {
    id: "useful",
    title: "¿Consideras útil una aplicación como Alerta RD?",
    options: yesNo,
    required: true,
  },
  { id: "intent", title: "¿La utilizarías?", options: yesNo, required: true },
  {
    id: "priority",
    title: "¿Qué función consideras más importante?",
    options: FEATURES.map((f) => f.title),
    required: true,
  },
  {
    id: "location",
    title: "¿Compartirías tu ubicación durante una emergencia?",
    options: ["Sí, durante la alerta", "No", "Necesito más información"],
    required: true,
  },
  {
    id: "audio",
    title:
      "¿Permitirías audio durante una alerta si aceptaste previamente esa configuración?",
    options: [
      "Sí, con control sobre la grabación",
      "No",
      "Necesito más información",
    ],
    required: true,
  },
  {
    id: "buttons",
    title: "¿Consideras útil activar una alerta mediante botones físicos?",
    options: yesNo,
    required: true,
  },
  {
    id: "accidents",
    title: "¿Consideras útil la detección automática de accidentes?",
    options: yesNo,
    required: true,
  },
  {
    id: "recipient",
    title: "¿Quién debería recibir inicialmente una alerta?",
    options: ["Contactos familiares", "Servicios autorizados", "Ambos", "Otro"],
    required: true,
  },
  {
    id: "concern",
    title: "¿Cuál sería tu principal preocupación?",
    options: [
      "Privacidad",
      "Falsas alarmas",
      "Seguridad de datos",
      "Dependencia de internet",
      "Uso indebido",
      "Otra",
    ],
    required: true,
  },
  {
    id: "idea",
    title: "¿Qué función agregarías?",
    type: "text",
    required: false,
  },
  {
    id: "experience",
    title:
      "¿Has vivido una situación donde necesitaste solicitar ayuda de emergencia?",
    options: ["Sí", "No", "Prefiero no responder"],
    required: false,
  },
  {
    id: "province",
    title: "¿Desde qué provincia participas?",
    options: [...PROVINCES, "Prefiero no responder"],
    required: true,
  },
  {
    id: "age",
    title: "¿Cuál es tu rango de edad?",
    options: [
      "Menos de 18",
      "18–24",
      "25–34",
      "35–44",
      "45–54",
      "55+",
      "Prefiero no responder",
    ],
    required: true,
  },
];
export const CONSENT_VERSION = "2026-09-v1";
