// Spanish — translated from the German copy in the PRS_Rebranding Figma file. Needs client review.
import type { Content } from './de';

const es: Content = {
  code: 'es',
  htmlLang: 'es',
  name: 'Español',
  meta: {
    siteName: 'PRS Prime Re Solutions',
    description:
      'PRS es una empresa independiente de actuarias y actuarios experimentados con sede en Zug: modelos, productos y procesos, normas y regulación, y la PRS Academy.',
  },
  ui: {
    skip: 'Saltar al contenido',
    menu: 'Menú',
    close: 'Cerrar',
    search: 'Buscar',
    searchOpen: 'Abrir búsqueda',
    searchPlaceholder: 'Buscar: p. ej. Solvencia II, cópulas, equipo',
    searchEmpty: 'Sin resultados para',
    searchKeys: { move: 'navegar', open: 'abrir', close: 'cerrar' },
    groups: { pages: 'Páginas', courses: 'Plan de estudios', people: 'Equipo' },
    language: 'Idioma',
    home: 'Inicio',
    scroll: 'Desplazar',
    scale: 'Escala 1 : 25 000',
    elevation: 'm s. n. m.',
    reliefNote: 'Lupa: modelo de terreno generativo',
    prev: 'Anterior',
    next: 'Siguiente',
    all: 'Todos',
    topicOne: 'tema',
    topicMany: 'temas',
    filterSearch: 'Buscar tema',
    noCourses: 'Ningún tema coincide con estos filtros.',
    request: 'Solicitar',
    requestSubject: 'Solicitud',
    learnMore: 'Más información',
    countdown: { label: 'Comienza en', days: 'días', hours: 'h', minutes: 'min', running: 'El evento está en curso.' },
    globeHint: 'Arrastre para girar el globo',
    introPlace: 'Zug · Suiza',
    introSince: 'Desde 2011',
    countries: { ch: 'Suiza', si: 'Eslovenia', mx: 'México', pe: 'Perú', ec: 'Ecuador' },
    format: { workshop: 'Taller', seminar: 'Seminario', hours: 'horas' },
    categories: {
      modelling: 'Modelización de riesgos',
      solvency: 'Solvencia',
      reserving: 'Reservas',
      reinsurance: 'Reaseguro',
    },
    clientsNote: 'Logotipos provisionales: PRS proporcionará los originales.',
    portraitNote: 'Retrato pendiente',
    figure: 'Fig.',
    flow: ['Datos', 'Modelo', 'Producto', 'Informe'],
    band: ['Banda de tolerancia', 'Desviación', 'corregido'],
    illo: { models: 'Simulación', products: 'Proceso', standards: 'Revisión' },
  },
  nav: {
    expertise: 'Expertise',
    about: 'Sobre nosotros',
    contact: 'Contacto',
    mega: [
      {
        title: 'Expertise',
        page: 'expertise',
        links: [
          { label: 'Nuestros servicios', page: 'expertise', hash: 'services' },
          { label: 'Cómo trabajamos', page: 'expertise', hash: 'approach' },
          { label: 'PRS Academy', page: 'academy' },
          { label: 'Plan de estudios', page: 'curriculum' },
          { label: 'Nuestros clientes', page: 'expertise', hash: 'clients' },
        ],
      },
      {
        title: 'Sobre nosotros',
        page: 'about',
        links: [
          { label: 'Sobre nosotros', page: 'about' },
          { label: 'Nuestro equipo', page: 'team' },
          { label: 'Novedades', page: 'news' },
        ],
      },
      { title: 'Contacto', page: 'contact', links: [] },
    ],
  },
  footer: {
    claim: 'Experts for Experts.',
    claimSub: 'En Zug desde 2011.',
    offices: { ch: 'Suiza (sede central)', si: 'Eslovenia', mx: 'México', pe: 'Perú' },
    imprint: 'Aviso legal',
    privacy: 'Privacidad',
    credits: 'Créditos de imagen',
    linkedin: 'LinkedIn',
    copyright: '© 2026 PRS Prime Re Solutions AG',
  },
  testimonials: [
    {
      quote: 'Valoramos el rigor técnico, el cuestionamiento constructivo y el criterio pragmático de PRS.',
      name: 'Peter Middelkamp',
      role: 'Head of Financial Market and Credit Risk Modelling, Swiss Re',
    },
    {
      quote:
        'PRS no solo desarrolló en tiempo récord un sofisticado modelo interno de riesgos, sino que además capacitó al personal de Europa Re en su uso.',
      name: 'Eugene Gurenko',
      role: 'Lead Insurance Specialist, Banco Mundial',
    },
    {
      quote:
        'Presentaron los resultados a nuestro consejo de administración de forma brillante. Más allá de la calidad excepcional de su trabajo, nos conquistaron con encanto y buen humor.',
      name: 'Alvaro Villamor',
      role: 'Chief Executive Officer, Telefónica Insurance',
    },
  ],
  event: {
    start: '2026-11-27T09:00:00+01:00',
    end: '2026-12-07T18:00:00+01:00',
    date: '27 de noviembre – 7 de diciembre de 2026',
    title: 'Supervisión actuarial en el marco de la NIIF 17',
    text: 'De los fundamentos a la aplicación práctica: el taller enseña métodos para evaluar y revisar actuarialmente la implementación de la NIIF 17. Ejercicios prácticos profundizan los conocimientos.',
    meta: ['15 horas', '5 sesiones', 'En español'],
    label: 'Próximo evento',
  },
  home: {
    title: 'Experiencia actuarial desde Zug',
    hero: {
      title: 'El conocimiento se fortalece cuando se aplica, se cuestiona y se comparte.',
      sub: 'Por eso comenzamos cada mandato con una pregunta y lo terminamos con un conocimiento que permanece con usted.',
    },
    intro: {
      label: 'Experts for Experts',
      text: 'PRS es una empresa independiente de actuarias y actuarios experimentados, convencida de que los profesionales merecen un interlocutor a su altura. Fundada en Zug en 2011, PRS trabaja hoy en cinco países y pertenece íntegramente a sus colaboradores.',
    },
    facts: [
      { value: 2011, suffix: '', label: 'fundada en Zug', plain: true },
      { value: 5, suffix: '', label: 'países en los que trabaja PRS' },
      { value: 100, suffix: ' %', label: 'propiedad de sus colaboradores' },
      { value: 900, suffix: '+', label: 'alumni de la PRS Academy' },
    ],
    services: {
      title: 'Nuestros servicios',
      label: 'Tailored Thinking',
      text: 'Ninguna situación es igual a otra. Por eso elaboramos cada respuesta a partir de sus datos y dentro de su marco regulatorio. Entre varias opciones plausibles, elegimos, con base en nuestra experiencia, la más sólida desde el punto de vista técnico.',
      cta: 'Más información',
      items: [
        { key: 'models', title: 'Modelos', text: 'Desarrollamos y revisamos modelos de tarificación, reservas y solvencia.' },
        { key: 'products', title: 'Productos y procesos', text: 'Desarrollamos productos y modelos, diseñamos procesos y hacemos que los datos puedan analizarse.' },
        { key: 'standards', title: 'Normas y regulación', text: 'Verificamos si sus modelos y procesos cumplen la normativa vigente y le mostramos dónde no lo hacen.' },
      ],
    },
    method: {
      title: 'Precisos en el método, sencillos en la colaboración.',
      text: 'Desde nuestra fundación, PRS representa un trabajo actuarial que pregunta, recalcula y sigue siendo trazable. Usted tiene acceso directo a nosotros y trabaja con las mismas personas desde la primera conversación hasta el cierre.',
    },
    approach: {
      title: 'Cómo trabajamos',
      items: [
        {
          title: 'Expertise in Practice',
          text: 'Aplicamos nuestro conocimiento: desarrollamos y revisamos modelos actuariales y asumimos funciones actuariales. Donde no existe un método establecido, lo creamos.',
        },
        {
          title: 'Expertise Shared',
          text: 'Transmitimos nuestro conocimiento: a sus equipos durante el mandato, a profesionales en la PRS Academy y a la profesión a través de las asociaciones actuariales.',
          cta: 'Conocer la Academy',
        },
      ],
    },
    about: {
      title: 'Sobre nosotros',
      label: 'Valor para decir la verdad',
      text: 'PRS pertenece a sus colaboradores y no tiene inversores externos. Juzgamos con independencia y decimos lo que muestran nuestros análisis, aunque resulte incómodo.',
      cta: 'Conózcanos',
    },
    audience: {
      title: 'Para todos los que asumen o supervisan riesgos.',
      text: 'Trabajamos para aseguradoras de vida, no vida, accidentes y salud, reaseguradoras y cautivas, desde pequeñas compañías hasta grandes grupos. A algunas las acompañamos desde hace más de diez años; a otras, en una única pregunta difícil.',
    },
    clients: { title: 'Nuestros clientes' },
  },
  expertise: {
    title: 'Expertise',
    intro: {
      label: 'Nuestros servicios',
      text: 'Las decisiones en seguros se basan en modelos, datos y normativas que cambian continuamente. Por eso cuestionamos los supuestos antes de utilizarlos y elaboramos resultados que se sostienen en la práctica. Trabajamos en tres ámbitos: modelos, productos y procesos, y normas y regulación.',
      cta: 'Ver resumen de servicios',
    },
    services: [
      {
        key: 'models',
        title: 'Modelos',
        text: 'Damos forma a sus sistemas financieros y económicos con modelos actuariales.',
        bullets: ['Tarificación', 'Reservas', 'Modelos de riesgo, capital y solvencia'],
      },
      {
        key: 'products',
        title: 'Productos y procesos',
        text: 'Desarrollamos productos, optimizamos el reaseguro y diseñamos procesos actuariales.',
        bullets: ['Desarrollo de productos', 'Optimización del reaseguro', 'Procesos actuariales', 'Cumplimiento y gobernanza'],
      },
      {
        key: 'standards',
        title: 'Normas y regulación',
        text: 'Nos aseguramos de que sus productos y procesos cumplan la normativa vigente.',
        bullets: [
          'Regímenes de solvencia SST y Solvencia II',
          'Actuario responsable y función actuarial',
          'Implementación regulatoria',
          'Cumplimiento e informes',
        ],
      },
    ],
    approach: {
      label: 'Cómo trabajamos',
      text: 'Resolvemos cuestiones actuariales y, al hacerlo, fortalecemos a sus equipos. Por eso aplicamos nuestro conocimiento, lo cuestionamos en cada mandato y lo transmitimos. Así no se queda con nosotros, sino que crece con usted y en toda la profesión.',
      items: [
        {
          title: 'Expertise in Practice',
          art: 'syndics',
          text: 'Desarrollamos modelos actuariales. Asumimos tareas y funciones como la del actuario responsable o la función actuarial. Revisamos modelos existentes y trabajamos en preguntas que aún no tienen una respuesta estándar. Para ello combinamos los conocimientos científicos más recientes con una implementación pragmática en su empresa.',
        },
        {
          title: 'Expertise Shared',
          art: 'merryFamily',
          text: 'Al final de un mandato entregamos íntegramente modelos, herramientas y documentación y, si es necesario, capacitamos a sus equipos en su uso. Así fortalecemos sus propias capacidades. De esta misma idea nació la PRS Academy.',
        },
      ],
    },
    academy: {
      label: 'PRS Academy',
      text: 'El conocimiento no solo debe surtir efecto en los mandatos. Por eso, en la PRS Academy formamos a profesionales que aplican métodos actuariales en su propio trabajo. En formaciones internas a medida, talleres externos y seminarios, unimos el estado actual de la disciplina con la práctica.',
      card: {
        title: 'PRS Academy',
        text: 'Formación continua en la que lleva la teoría actuarial a la práctica.',
        cta: 'Conocer la PRS Academy',
      },
    },
    clients: {
      label: 'Nuestros clientes',
      text: 'Desde 2011 trabajamos para aseguradoras y reaseguradoras, cautivas y reguladores. Nuestros interlocutores evalúan, gestionan o supervisan riesgos: como actuarios, gestores de riesgos o responsables financieros, en auditoría interna o en la supervisión.',
    },
  },
  academy: {
    title: 'PRS Academy',
    intro: {
      label: 'PRS Academy',
      text: 'El conocimiento se fortalece cuando se comparte. Por eso, desde 2015, la PRS Academy forma a profesionales que evalúan, gestionan o supervisan riesgos. En talleres, seminarios y formaciones internas en su empresa, llevamos el estado académico de la disciplina a la práctica.',
      cta: 'Ver plan de estudios',
    },
    stats: [
      { value: 900, suffix: '+', label: 'Alumni' },
      { value: 8, suffix: '', label: 'Idiomas de enseñanza' },
      { value: 11, suffix: '', label: 'Años de PRS Academy' },
    ],
    formats: [
      {
        key: 'workshop',
        title: 'Taller (16 horas)',
        art: 'orrery',
        text: 'Un taller trata un tema en 16 horas, desde los fundamentos hasta los métodos avanzados. Lo imparten actuarios experimentados de PRS. A petición, también realizamos el taller en su empresa.',
        cta: 'Solicitar un taller',
      },
      {
        key: 'seminar',
        title: 'Seminario (3 horas)',
        art: 'astronomer',
        text: 'Un seminario ofrece en 3 horas una introducción compacta a un tema. Lo imparten actuarios experimentados de PRS. Es ideal si desea conocer primero un ámbito nuevo. A petición, también realizamos el seminario en su empresa.',
        cta: 'Solicitar un seminario',
      },
    ],
    curriculum: { label: 'Nuestro plan de estudios', cta: 'Los 19 temas en detalle' },
  },
  curriculum: {
    title: 'Plan de estudios',
    label: 'Nuestro plan de estudios',
    text: 'Impartimos 19 temas de modelización de riesgos, solvencia, reservas y reaseguro. Puede solicitarnos cualquiera de ellos, por separado o combinados, y si lo desea, en sus propias instalaciones.',
  },
  about: {
    title: 'Sobre nosotros',
    intro: {
      label: 'Sobre nosotros',
      text: 'Somos actuarias y actuarios experimentados con acceso directo para nuestros clientes. Por eso usted tiene los mismos interlocutores desde la primera conversación hasta el cierre.',
    },
    cards: [
      { key: 'story', title: 'Nuestra historia', art: 'census', text: 'PRS se fundó en Zug en 2011. Desde 2015, la PRS Academy transmite nuestro conocimiento a profesionales.', page: 'academy', cta: '' },
      { key: 'team', title: 'Nuestro equipo', art: 'harvesters', text: 'Nuestro equipo reúne a actuarias y actuarios con amplia experiencia en distintas disciplinas y mercados.', page: 'team', cta: 'Conózcanos' },
      { key: 'ownership', title: 'Propiedad e independencia', art: 'gisze', text: 'PRS pertenece íntegramente a sus colaboradores. No tenemos inversores externos y estamos libres de intereses ajenos.', page: '', cta: '' },
      { key: 'reach', title: 'Alcance internacional', art: 'ambassadors', text: 'Trabajamos en Suiza, Eslovenia, México, Perú y Ecuador. Nuestros clientes están en todo el mundo, de pequeños a grandes.', page: 'contact', cta: '' },
      { key: 'services', title: 'Resumen de servicios', art: 'goldsmith', text: 'Nuestro conocimiento abarca desde modelos, productos y procesos hasta normas y regulación.', page: 'expertise', cta: '' },
      { key: 'news', title: 'Novedades', art: 'erasmus', text: 'Informamos sobre proyectos actuales, temas técnicos y talleres. Descubra lo que está pasando en PRS.', page: 'news', cta: '' },
    ],
  },
  team: {
    title: 'Equipo',
    label: 'Nuestro equipo',
    text: 'Una pregunta actuarial rara vez requiere una sola disciplina. Por eso PRS reúne a actuarias y actuarios con experiencia complementaria en cinco países. Para cada mandato formamos el equipo adecuado, con el que usted trabaja de forma directa y de igual a igual.',
  },
  contact: {
    title: 'Contacto',
    label: 'Contacto',
    text: 'Usted tiene acceso directo a nosotros y trabaja con las mismas personas desde la primera conversación hasta el cierre.',
    write: 'solutions@prs-zug.com',
    presence: 'Presencia',
  },
  news: {
    title: 'Novedades',
    label: 'Novedades',
    text: 'Informamos sobre proyectos actuales, temas técnicos y talleres. Descubra lo que está pasando en PRS.',
    more: 'Próximamente, más artículos.',
  },
  legal: {
    title: 'Aviso legal y privacidad',
    imprint: 'Aviso legal',
    privacy: 'Privacidad',
    credits: 'Créditos de imagen',
    photoCredit: 'Fotografía alpina (página de inicio):',
    placeholder: 'Texto provisional: PRS proporcionará el texto jurídicamente vinculante.',
    creditsIntro:
      'Las pinturas son reproducciones de dominio público de Wikimedia Commons. El modelo de terreno de la lupa de la página de inicio se calcula en tiempo real en el navegador y no representa un lugar real.',
  },
};

export default es;
