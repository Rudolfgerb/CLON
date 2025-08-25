export type NotificationPriority = 'low' | 'medium' | 'high';

export interface PushNotificationTemplate {
  title: string;
  message: string;
  priority: NotificationPriority;
}

export const pushNotificationTemplates: Record<string, PushNotificationTemplate> = {
  job_acceptance: {
    title: "{{helper}} hat deinen Job '{{job}}' angenommen!",
    message: 'Chat jetzt öffnen',
    priority: 'high'
  },
  new_applicant: {
    title: "{{count}} neue Bewerbungen für deinen Job '{{job}}'",
    message: '',
    priority: 'medium'
  },
  job_reminder: {
    title: "Dein Job '{{job}}' startet in 1 Stunde",
    message: '',
    priority: 'high'
  },
  payment_released: {
    title: "{{amount}}€ für '{{job}}' wurden freigegeben!",
    message: 'Jetzt auszahlen',
    priority: 'high'
  },
  karma_update: {
    title: '+{{karma}} Karma! Du bist jetzt Level {{level}}',
    message: '🏆',
    priority: 'low'
  },
  new_job_nearby: {
    title: "NEU: '{{job}}' ({{distance}}) - {{price}}€",
    message: 'Jetzt ansehen',
    priority: 'high'
  },
  leaderboard_update: {
    title: 'Platz {{rank}} in {{region}}!',
    message: 'Top {{percent}}% der Helfer 🔥',
    priority: 'medium'
  },
  verification_success: {
    title: 'ID-Verifikation abgeschlossen! Vollzugriff aktiv',
    message: '',
    priority: 'high'
  }
};

export interface EmailTemplate {
  subject: string;
  intro: string;
}

export const emailTemplates: Record<string, EmailTemplate> = {
  registration: {
    subject: 'Willkommen bei Mutuus! Bestätige dein Konto',
    intro: 'Verifizierungslink, App-Download-Links'
  },
  password_reset: {
    subject: 'Passwort zurücksetzen für dein Mutuus-Konto',
    intro: 'Reset-Link (24h gültig)'
  },
  job_confirmation: {
    subject: "Job angenommen: {{job}}",
    intro: 'Job-Details, Helfer-Profil, Chat-Link'
  },
  payment_confirmation: {
    subject: 'Zahlung erhalten: {{amount}}€ für {{job}}',
    intro: 'Transaktions-ID, Steuer-PDF'
  },
  weekly_digest: {
    subject: 'Deine Woche bei Mutuus: {{amount}}€ + {{karma}} Karma',
    intro: 'Statistiken, Top-Jobs der Woche'
  },
  karma_report: {
    subject: 'Dein Karma-Report: {{karma}} gute Taten!',
    intro: 'Abzeichen, Vergleich mit Vorher'
  },
  invitation_reminder: {
    subject: '{{friend}}, dein Freund wartet auf dich!',
    intro: 'Persönliche Nachricht, Nochmaliger Link'
  },
  mini_job_warning: {
    subject: 'Achtung: Du näherst dich der 556€-Grenze',
    intro: 'Aktueller Stand, Steuerhinweise'
  }
};

