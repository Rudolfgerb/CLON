// Application constants and configuration

export const APP_CONFIG = {
  name: 'Mutuus',
  version: '1.0.0',
  api: {
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000
  },
  pagination: {
    defaultPageSize: 10,
    maxPageSize: 100
  },
  file: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
  }
};

export const JOB_CATEGORIES = [
  { id: 'programming', label: 'Programmierung', icon: '💻', color: 'blue' },
  { id: 'design', label: 'Design', icon: '🎨', color: 'purple' },
  { id: 'writing', label: 'Textarbeit', icon: '✍️', color: 'green' },
  { id: 'translation', label: 'Übersetzung', icon: '🌐', color: 'indigo' },
  { id: 'marketing', label: 'Marketing', icon: '📈', color: 'pink' },
  { id: 'consulting', label: 'Beratung', icon: '💡', color: 'yellow' },
  { id: 'data', label: 'Datenanalyse', icon: '📊', color: 'cyan' },
  { id: 'video', label: 'Video & Animation', icon: '🎬', color: 'red' },
  { id: 'music', label: 'Audio & Musik', icon: '🎵', color: 'orange' },
  { id: 'other', label: 'Andere', icon: '📋', color: 'gray' }
];

export const DIFFICULTY_LEVELS = [
  { 
    id: 'easy', 
    label: 'Einfach', 
    color: 'green', 
    description: 'Grundkenntnisse ausreichend',
    minKarma: 0
  },
  { 
    id: 'medium', 
    label: 'Mittel', 
    color: 'yellow', 
    description: 'Solide Erfahrung erforderlich',
    minKarma: 100
  },
  { 
    id: 'hard', 
    label: 'Schwer', 
    color: 'red', 
    description: 'Expertenwissen benötigt',
    minKarma: 500
  }
];

export const TIME_COMMITMENTS = [
  { 
    id: 'part_time', 
    label: 'Teilzeit', 
    description: 'Weniger als 20h/Woche',
    hoursPerWeek: '< 20h'
  },
  { 
    id: 'full_time', 
    label: 'Vollzeit', 
    description: '40h/Woche oder mehr',
    hoursPerWeek: '40h+'
  },
  { 
    id: 'flexible', 
    label: 'Flexibel', 
    description: 'Nach Vereinbarung',
    hoursPerWeek: 'Flexibel'
  }
];

export const JOB_STATUSES = [
  { id: 'open', label: 'Offen', color: 'green', icon: '🟢' },
  { id: 'in_progress', label: 'In Bearbeitung', color: 'blue', icon: '🔵' },
  { id: 'completed', label: 'Abgeschlossen', color: 'purple', icon: '🟣' },
  { id: 'cancelled', label: 'Abgebrochen', color: 'red', icon: '🔴' }
];

export const APPLICATION_STATUSES = [
  { id: 'pending', label: 'Wartend', color: 'yellow', icon: '🟡' },
  { id: 'accepted', label: 'Angenommen', color: 'green', icon: '🟢' },
  { id: 'rejected', label: 'Abgelehnt', color: 'red', icon: '🔴' },
  { id: 'withdrawn', label: 'Zurückgezogen', color: 'gray', icon: '⚫' }
];

export const PAYMENT_TYPES = [
  { 
    id: 'cash', 
    label: 'Cash Job', 
    icon: '💰', 
    color: 'green',
    description: 'Bezahlung in Euro für professionelle Arbeit'
  },
  { 
    id: 'karma', 
    label: 'Karma Job', 
    icon: '⭐', 
    color: 'purple',
    description: 'Community-Hilfe mit Karma-Belohnung'
  },
  { 
    id: 'mixed', 
    label: 'Gemischt', 
    icon: '🎯', 
    color: 'blue',
    description: 'Kombination aus Cash und Karma'
  }
];

export const BUDGET_TYPES = [
  { 
    id: 'fixed', 
    label: 'Festpreis', 
    description: 'Einmaliger Betrag für das gesamte Projekt',
    icon: '💵'
  },
  { 
    id: 'hourly', 
    label: 'Stundensatz', 
    description: 'Bezahlung pro Arbeitsstunde',
    icon: '⏰'
  }
];

export const AVAILABILITY_OPTIONS = [
  { value: 'sofort', label: 'Sofort verfügbar' },
  { value: '1-week', label: 'In 1 Woche' },
  { value: '2-weeks', label: 'In 2 Wochen' },
  { value: '1-month', label: 'In 1 Monat' },
  { value: 'flexible', label: 'Flexibel' }
];

export const PRIORITY_LEVELS = [
  { 
    id: 'low', 
    label: 'Niedrig', 
    color: 'green', 
    description: 'Zeit bis zur Deadline',
    icon: '📅'
  },
  { 
    id: 'medium', 
    label: 'Normal', 
    color: 'yellow', 
    description: 'Durchschnittliche Dringlichkeit',
    icon: '⏰'
  },
  { 
    id: 'high', 
    label: 'Hoch', 
    color: 'red', 
    description: 'Schnelle Bearbeitung gewünscht',
    icon: '🚨'
  }
];

// Validation constants
export const VALIDATION_RULES = {
  job: {
    title: { min: 3, max: 200 },
    description: { min: 50, max: 5000 },
    deliverables: { min: 20, max: 2000 },
    requirements: { max: 1000 },
    tags: { max: 10 },
    expectedDuration: { min: 1, max: 1000 }
  },
  application: {
    coverLetter: { min: 50, max: 2000 },
    experience: { max: 1500 },
    name: { min: 2, max: 100 }
  },
  karma: {
    min: 10,
    max: 10000,
    dailyLimit: 1000
  },
  cash: {
    min: 5.00,
    max: 50000.00
  }
};

// Commission rates
export const COMMISSION_CONFIG = {
  standard: {
    rate: 0.098, // 9.8%
    label: 'Standard'
  },
  premium: {
    rate: 0.05, // 5%
    label: 'Premium'
  }
};

// Karma system configuration
export const KARMA_CONFIG = {
  levels: [
    { level: 1, requiredKarma: 0, title: 'Neuling', color: 'gray' },
    { level: 2, requiredKarma: 100, title: 'Lehrling', color: 'blue' },
    { level: 3, requiredKarma: 500, title: 'Experte', color: 'green' },
    { level: 4, requiredKarma: 1500, title: 'Meister', color: 'purple' },
    { level: 5, requiredKarma: 5000, title: 'Großmeister', color: 'gold' }
  ],
  rewards: {
    jobCompletion: 50,
    firstJob: 100,
    dailyLogin: 5,
    profileComplete: 25,
    premiumUpgrade: 200
  },
  exchangeRate: 0.003 // 1 Karma = 0.003 EUR
};

// Notification types
export const NOTIFICATION_TYPES = {
  APPLICATION_RECEIVED: 'application_received',
  APPLICATION_ACCEPTED: 'application_accepted',
  APPLICATION_REJECTED: 'application_rejected',
  JOB_ASSIGNED: 'job_assigned',
  JOB_COMPLETED: 'job_completed',
  JOB_CANCELLED: 'job_cancelled',
  DEADLINE_APPROACHING: 'deadline_approaching',
  MESSAGE_RECEIVED: 'message_received',
  PAYMENT_RECEIVED: 'payment_received',
  KARMA_EARNED: 'karma_earned'
};

// Theme configuration
export const THEME_CONFIG = {
  colors: {
    primary: {
      50: '#eff6ff',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8'
    },
    success: {
      50: '#f0fdf4',
      500: '#22c55e',
      600: '#16a34a'
    },
    warning: {
      50: '#fffbeb',
      500: '#f59e0b',
      600: '#d97706'
    },
    danger: {
      50: '#fef2f2',
      500: '#ef4444',
      600: '#dc2626'
    }
  },
  gradients: {
    cash: 'from-green-500 to-green-600',
    karma: 'from-purple-500 to-purple-600',
    primary: 'from-blue-500 to-blue-600',
    premium: 'from-yellow-500 to-orange-500'
  }
};

// Export utility functions for working with constants
export const getConstant = {
  categoryById: (id: string) => JOB_CATEGORIES.find(cat => cat.id === id),
  difficultyById: (id: string) => DIFFICULTY_LEVELS.find(diff => diff.id === id),
  statusById: (id: string) => JOB_STATUSES.find(status => status.id === id),
  karmaLevelByPoints: (karma: number) => {
    return KARMA_CONFIG.levels
      .slice()
      .reverse()
      .find(level => karma >= level.requiredKarma) || KARMA_CONFIG.levels[0];
  }
};