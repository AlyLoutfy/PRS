// The 19 PRS Academy topics from the Figma "Lehrplan" frame (03_Web Design).
// German copy is from the design; English/Spanish are translations for review.
// `category` groups the topics into the four areas named in the curriculum intro.
import type { Locale } from '../i18n';

export type CourseFormat = 'workshop' | 'seminar';
export type CourseCategory = 'modelling' | 'solvency' | 'reserving' | 'reinsurance';

export interface Course {
  id: string;
  format: CourseFormat;
  hours: number;
  category: CourseCategory;
  title: Record<Locale, string>;
  text: Record<Locale, string>;
}

const W: Pick<Course, 'format' | 'hours'> = { format: 'workshop', hours: 16 };
const S: Pick<Course, 'format' | 'hours'> = { format: 'seminar', hours: 3 };

export const courses: Course[] = [
  {
    id: 'methodik', ...W, category: 'modelling',
    title: { de: 'Aktuarielle Methodik', en: 'Actuarial methodology', es: 'Metodología actuarial' },
    text: {
      de: 'Grundlagen der aktuariellen Modellierung, von sauberer Programmierung in Excel und VBA über Glättung, Kalibrierung und Simulation bis zu Pricing, Reservierung und Marktrisiken.',
      en: 'The foundations of actuarial modelling, from clean programming in Excel and VBA through smoothing, calibration and simulation to pricing, reserving and market risk.',
      es: 'Fundamentos de la modelización actuarial: desde una programación limpia en Excel y VBA, pasando por el suavizado, la calibración y la simulación, hasta la tarificación, las reservas y los riesgos de mercado.',
    },
  },
  {
    id: 'marktrisiko', ...S, category: 'modelling',
    title: { de: 'Marktrisikomodelle', en: 'Market risk models', es: 'Modelos de riesgo de mercado' },
    text: {
      de: 'Geometrische Brownsche Bewegung, Schocks sowie Aktien-, Zins- und Kreditmodelle.',
      en: 'Geometric Brownian motion, shocks, and equity, interest-rate and credit models.',
      es: 'Movimiento browniano geométrico, shocks y modelos de renta variable, tipos de interés y crédito.',
    },
  },
  {
    id: 'abhaengigkeiten', ...W, category: 'modelling',
    title: { de: 'Modellierung von Abhängigkeiten', en: 'Modelling dependencies', es: 'Modelización de dependencias' },
    text: {
      de: 'Wie sich Abhängigkeiten zwischen Risiken modellieren lassen: von Monte-Carlo-Simulation und Korrelationen über Copulas und Tail-Abhängigkeiten bis zu Lévy-Copulas für Prozesse.',
      en: 'How dependencies between risks can be modelled: from Monte Carlo simulation and correlations through copulas and tail dependence to Lévy copulas for processes.',
      es: 'Cómo modelizar las dependencias entre riesgos: desde la simulación de Monte Carlo y las correlaciones, pasando por las cópulas y la dependencia en las colas, hasta las cópulas de Lévy para procesos.',
    },
  },
  {
    id: 'kalibrierung', ...W, category: 'modelling',
    title: { de: 'Modellkalibrierung', en: 'Model calibration', es: 'Calibración de modelos' },
    text: {
      de: 'Wie Verteilungen und Abhängigkeiten an Daten angepasst werden, mit Plots, Momentenmethode, Maximum Likelihood und Tests. Dazu die Fragen jeder Kalibrierung: Schwanz, Verzerrung, Parameter- und Modellrisiko.',
      en: 'How distributions and dependencies are fitted to data, using plots, the method of moments, maximum likelihood and tests. Plus the questions every calibration raises: tails, bias, parameter and model risk.',
      es: 'Cómo ajustar distribuciones y dependencias a los datos, con gráficos, el método de los momentos, máxima verosimilitud y pruebas. Además, las preguntas de toda calibración: colas, sesgo, riesgo de parámetros y riesgo de modelo.',
    },
  },
  {
    id: 'validierung', ...W, category: 'modelling',
    title: { de: 'Modellvalidierung', en: 'Model validation', es: 'Validación de modelos' },
    text: {
      de: 'Warum und wie Modelle validiert werden: Verfahren und Organisation, Backtesting, Kreuzvalidierung, Sensitivitätsanalysen, Reverse Stress Tests und Plausibilisierung, auch bei zugekauften Modellen.',
      en: 'Why and how models are validated: procedures and organisation, backtesting, cross-validation, sensitivity analyses, reverse stress tests and plausibility checks — including for purchased models.',
      es: 'Por qué y cómo se validan los modelos: procedimientos y organización, backtesting, validación cruzada, análisis de sensibilidad, pruebas de estrés inversas y verificaciones de plausibilidad, también en modelos adquiridos.',
    },
  },
  {
    id: 'esg', ...W, category: 'modelling',
    title: { de: 'Ökonomische Szenariogeneratoren', en: 'Economic scenario generators', es: 'Generadores de escenarios económicos' },
    text: {
      de: 'Modelle für Aktien, Zinsen, Spreads, Inflation und Wechselkurse, von der geometrischen Brownschen Bewegung bis zu Vasicek und Hull-White. Dazu risikoneutral versus realweltlich und Validierung.',
      en: 'Models for equities, interest rates, spreads, inflation and exchange rates, from geometric Brownian motion to Vasicek and Hull-White. Plus risk-neutral versus real-world, and validation.',
      es: 'Modelos para acciones, tipos de interés, diferenciales, inflación y tipos de cambio, desde el movimiento browniano geométrico hasta Vasicek y Hull-White. Además, neutral al riesgo frente a mundo real, y validación.',
    },
  },
  {
    id: 'pricing-rv', ...W, category: 'reinsurance',
    title: {
      de: 'Pricing und Strukturierung in der Rückversicherung',
      en: 'Pricing and structuring in reinsurance',
      es: 'Tarificación y estructuración en el reaseguro',
    },
    text: {
      de: 'Die vier klassischen Vertragsarten und ihr Pricing mit On-Leveling, Zuschlägen sowie Erfahrungs-, Exposure- und Naturgefahrentarifierung. Dazu Long-Tail-Sparten, alternativer Risikotransfer und Optimierung.',
      en: 'The four classic treaty types and their pricing with on-levelling, loadings, and experience, exposure and natural-catastrophe rating. Plus long-tail lines, alternative risk transfer and optimisation.',
      es: 'Los cuatro tipos clásicos de contrato y su tarificación con on-leveling, recargos y tarificación por experiencia, por exposición y de catástrofes naturales. Además, ramos de cola larga, transferencia alternativa de riesgos y optimización.',
    },
  },
  {
    id: 'reservierungsrisiko', ...S, category: 'reserving',
    title: { de: 'Reservierungsrisiko', en: 'Reserve risk', es: 'Riesgo de reservas' },
    text: {
      de: 'Mack Chain Ladder, Half-Mack, Bootstrap und die Entwicklung einzelner Schäden.',
      en: 'Mack chain ladder, half-Mack, bootstrap and the development of individual claims.',
      es: 'Chain ladder de Mack, Half-Mack, bootstrap y el desarrollo de siniestros individuales.',
    },
  },
  {
    id: 'orsa', ...W, category: 'solvency',
    title: {
      de: 'Risiko-, Kapital- und Solvenzmodelle aus ORSA-Sicht',
      en: 'Risk, capital and solvency models from an ORSA perspective',
      es: 'Modelos de riesgo, capital y solvencia desde la perspectiva ORSA',
    },
    text: {
      de: 'Aufbau eines Solvenzmodells von der ökonomischen Bilanz über Risikoaggregation und Rückversicherung bis zu Mehrjahresprojektionen. Der Use Test umfasst Portfolioplanung, Rückversicherungsoptimierung und Kapitalallokation.',
      en: 'Building a solvency model from the economic balance sheet through risk aggregation and reinsurance to multi-year projections. The use test covers portfolio planning, reinsurance optimisation and capital allocation.',
      es: 'Construcción de un modelo de solvencia desde el balance económico, pasando por la agregación de riesgos y el reaseguro, hasta proyecciones plurianuales. El use test abarca la planificación de la cartera, la optimización del reaseguro y la asignación de capital.',
    },
  },
  {
    id: 'risikoabhaengigkeiten', ...S, category: 'modelling',
    title: { de: 'Risikoabhängigkeiten', en: 'Risk dependencies', es: 'Dependencias entre riesgos' },
    text: {
      de: 'Korrelationen und ihre Fallstricke, Kausalmodelle, Copulas und Tail-Abhängigkeit.',
      en: 'Correlations and their pitfalls, causal models, copulas and tail dependence.',
      es: 'Las correlaciones y sus trampas, modelos causales, cópulas y dependencia en las colas.',
    },
  },
  {
    id: 'risikokalibrierung', ...S, category: 'modelling',
    title: { de: 'Risikokalibrierung', en: 'Risk calibration', es: 'Calibración de riesgos' },
    text: {
      de: 'Anpassung von Verteilungen mit PP- und QQ-Plots, Momentenmethode, Maximum Likelihood und Tests, dazu das Parameterrisiko.',
      en: 'Fitting distributions with PP and QQ plots, the method of moments, maximum likelihood and tests, plus parameter risk.',
      es: 'Ajuste de distribuciones con gráficos PP y QQ, el método de los momentos, máxima verosimilitud y pruebas, además del riesgo de parámetros.',
    },
  },
  {
    id: 'rueckversicherung', ...S, category: 'reinsurance',
    title: { de: 'Rückversicherung', en: 'Reinsurance', es: 'Reaseguro' },
    text: {
      de: 'Zweck der Rückversicherung, proportionale und nichtproportionale Verträge, Erfahrungs- und Exposure-Tarifierung, Long-Tail-Sparten, Zuschläge und Optimierung.',
      en: 'The purpose of reinsurance, proportional and non-proportional treaties, experience and exposure rating, long-tail lines, loadings and optimisation.',
      es: 'Finalidad del reaseguro, contratos proporcionales y no proporcionales, tarificación por experiencia y por exposición, ramos de cola larga, recargos y optimización.',
    },
  },
  {
    id: 'solvency-ii', ...W, category: 'solvency',
    title: { de: 'Standardformel von Solvency II', en: 'The Solvency II standard formula', es: 'La fórmula estándar de Solvencia II' },
    text: {
      de: 'Aufbau der Standardformel von der ökonomischen Bilanz über Kapitalkostenmarge und Mindestkapital bis zu den Risikomodulen des Solvenzkapitals und der Verlustausgleichsfähigkeit.',
      en: 'The structure of the standard formula, from the economic balance sheet through the risk margin and minimum capital to the risk modules of the solvency capital requirement and loss-absorbing capacity.',
      es: 'Estructura de la fórmula estándar: desde el balance económico, pasando por el margen de riesgo y el capital mínimo, hasta los módulos de riesgo del capital de solvencia y la capacidad de absorción de pérdidas.',
    },
  },
  {
    id: 'sst', ...W, category: 'solvency',
    title: {
      de: 'Standardmodell des Schweizer Solvenztests (SST)',
      en: 'The Swiss Solvency Test (SST) standard model',
      es: 'El modelo estándar del Swiss Solvency Test (SST)',
    },
    text: {
      de: 'Grundsätze des SST, risikotragendes Kapital aus der ökonomischen Bilanz und Zielkapital aus Versicherungs-, Markt- und Kreditrisiken sowie deterministischen Stressszenarien.',
      en: 'Principles of the SST, risk-bearing capital from the economic balance sheet, and target capital from insurance, market and credit risks as well as deterministic stress scenarios.',
      es: 'Principios del SST, capital disponible a partir del balance económico y capital objetivo a partir de los riesgos de seguro, mercado y crédito, así como de escenarios de estrés deterministas.',
    },
  },
  {
    id: 'stochastische-reservierung', ...W, category: 'reserving',
    title: { de: 'Stochastische Reservierung', en: 'Stochastic reserving', es: 'Reservas estocásticas' },
    text: {
      de: 'Warum Reserven stochastisch berechnet werden und wie: mit statistischen Methoden wie Mack Chain Ladder, mit Bootstrap und Markov Chain Monte Carlo sowie anhand der Entwicklung einzelner Schäden.',
      en: 'Why reserves are calculated stochastically, and how: with statistical methods such as Mack chain ladder, with bootstrapping and Markov chain Monte Carlo, and based on the development of individual claims.',
      es: 'Por qué las reservas se calculan de forma estocástica y cómo: con métodos estadísticos como el chain ladder de Mack, con bootstrap y Monte Carlo mediante cadenas de Markov, y a partir del desarrollo de siniestros individuales.',
    },
  },
  {
    id: 'simulationen', ...S, category: 'modelling',
    title: {
      de: 'Stochastische Simulationen und Risikomasse',
      en: 'Stochastic simulations and risk measures',
      es: 'Simulaciones estocásticas y medidas de riesgo',
    },
    text: {
      de: 'Versicherungsrisiken, Erzeugung stochastischer Ereignisse, Beschleunigung von Monte-Carlo-Simulationen sowie Risikomasse und Kohärenz.',
      en: 'Insurance risks, generating stochastic events, accelerating Monte Carlo simulations, and risk measures and coherence.',
      es: 'Riesgos de seguro, generación de eventos estocásticos, aceleración de simulaciones de Monte Carlo, y medidas de riesgo y coherencia.',
    },
  },
  {
    id: 'stressszenarien', ...W, category: 'solvency',
    title: { de: 'Stressszenarien', en: 'Stress scenarios', es: 'Escenarios de estrés' },
    text: {
      de: 'Szenarien für Modellvalidierung, ORSA und Aufsicht: seltene Ein- und Mehrrisikoereignisse, SST- und Solvency-II-Szenarien, EIOPA-Stresstests sowie Szenarien für Aktiven und Passiven.',
      en: 'Scenarios for model validation, ORSA and supervision: rare single- and multi-risk events, SST and Solvency II scenarios, EIOPA stress tests, and scenarios for assets and liabilities.',
      es: 'Escenarios para la validación de modelos, el ORSA y la supervisión: eventos poco frecuentes de uno o varios riesgos, escenarios del SST y de Solvencia II, pruebas de estrés de EIOPA y escenarios para activos y pasivos.',
    },
  },
  {
    id: 'underwriting', ...W, category: 'reinsurance',
    title: { de: 'Underwriting in der Rückversicherung', en: 'Underwriting in reinsurance', es: 'Suscripción en el reaseguro' },
    text: {
      de: 'Der Rückversicherungsprozess vom Underwriting über Aktuariat, Schaden und Rechnungswesen bis zum Rechtsrahmen mit Klauseln und Vertragswortlaut. Vertiefung zu Naturgefahren und alternativem Risikotransfer.',
      en: 'The reinsurance process from underwriting through actuarial, claims and accounting to the legal framework with clauses and treaty wording. With a deep dive into natural catastrophes and alternative risk transfer.',
      es: 'El proceso de reaseguro desde la suscripción, pasando por el área actuarial, siniestros y contabilidad, hasta el marco jurídico con cláusulas y redacción contractual. Profundización en catástrofes naturales y transferencia alternativa de riesgos.',
    },
  },
  {
    id: 'vt-risikomodelle', ...S, category: 'modelling',
    title: {
      de: 'Versicherungstechnische Risikomodelle',
      en: 'Insurance risk models',
      es: 'Modelos de riesgo técnico de seguros',
    },
    text: {
      de: 'Aggregierte, kollektive, individuelle und Exposure-Modelle im Überblick.',
      en: 'An overview of aggregate, collective, individual and exposure models.',
      es: 'Panorama de los modelos agregados, colectivos, individuales y de exposición.',
    },
  },
];
