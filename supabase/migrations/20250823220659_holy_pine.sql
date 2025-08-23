/*
  # Create Basic Karma Jobs for Mutuus Platform

  1. New Jobs
    - Friend invitation job
    - Social media sharing job
    - Profile verification job
    - First job completion job
    - Community feedback job
    - Tutorial completion job
    - Profile completion job
    - Daily login streak job

  2. Security
    - Jobs are created by system (using a system user ID)
    - All jobs are active and available for users
    - Karma rewards are balanced for engagement
*/

-- Create basic karma jobs that enhance user experience
INSERT INTO jobs (
  id,
  title,
  description,
  category,
  location,
  job_type,
  karma_reward,
  estimated_hours,
  difficulty,
  tags,
  requirements,
  deliverables,
  status,
  created_by,
  created_at
) VALUES 
(
  gen_random_uuid(),
  '🤝 Lade einen Freund zu Mutuus ein',
  'Teile Mutuus mit deinen Freunden und helfe unserer Community zu wachsen! Sende eine Einladung an einen Freund und erhalte Karma-Punkte, wenn er sich registriert.',
  'other',
  'remote',
  'karma',
  150,
  1,
  'easy',
  '["Community", "Einladung", "Freunde", "Wachstum"]'::jsonb,
  'Du brauchst nur die E-Mail-Adresse eines Freundes',
  'Erfolgreiche Registrierung des eingeladenen Freundes',
  'active',
  '00000000-0000-0000-0000-000000000000',
  now()
),
(
  gen_random_uuid(),
  '📱 Teile Mutuus auf Social Media',
  'Hilf uns dabei, Mutuus bekannter zu machen! Teile einen Post über Mutuus auf deinen Social Media Kanälen (Instagram, Twitter, LinkedIn, Facebook) und zeige anderen, wie cool unsere Plattform ist.',
  'marketing',
  'remote',
  'karma',
  100,
  1,
  'easy',
  '["Social Media", "Marketing", "Teilen", "Community"]'::jsonb,
  'Aktiver Social Media Account (Instagram, Twitter, LinkedIn oder Facebook)',
  'Screenshot des geteilten Posts mit Mutuus-Erwähnung',
  'active',
  '00000000-0000-0000-0000-000000000000',
  now()
),
(
  gen_random_uuid(),
  '✅ Verifiziere dein Profil',
  'Vervollständige dein Mutuus-Profil und werde ein verifizierter Nutzer! Füge ein Profilbild hinzu, schreibe eine kurze Bio und verknüpfe deine Social Media Accounts.',
  'other',
  'remote',
  'karma',
  75,
  1,
  'easy',
  '["Profil", "Verifizierung", "Bio", "Authentizität"]'::jsonb,
  'Vollständiges Mutuus-Profil mit allen Pflichtfeldern',
  'Verifiziertes Profil mit Profilbild, Bio und mindestens einem Social Link',
  'active',
  '00000000-0000-0000-0000-000000000000',
  now()
),
(
  gen_random_uuid(),
  '🎯 Schließe deinen ersten Job ab',
  'Werde aktiv in der Mutuus-Community! Bewirb dich auf einen Job und schließe ihn erfolgreich ab. Das zeigt anderen Nutzern, dass du zuverlässig bist.',
  'other',
  'remote',
  'karma',
  200,
  2,
  'medium',
  '["Erster Job", "Zuverlässigkeit", "Community", "Erfahrung"]'::jsonb,
  'Aktives Mutuus-Profil und Bereitschaft, einen Job zu übernehmen',
  'Erfolgreich abgeschlossener erster Job mit positiver Bewertung',
  'active',
  '00000000-0000-0000-0000-000000000000',
  now()
),
(
  gen_random_uuid(),
  '💬 Gib Community-Feedback',
  'Hilf uns, Mutuus zu verbessern! Teile dein Feedback über die Plattform mit uns - was gefällt dir, was könnte besser sein? Deine Meinung ist wichtig für unsere Entwicklung.',
  'other',
  'remote',
  'karma',
  50,
  1,
  'easy',
  '["Feedback", "Verbesserung", "Community", "Meinung"]'::jsonb,
  'Mindestens 1 Woche Erfahrung mit Mutuus',
  'Detailliertes Feedback (mindestens 200 Wörter) über deine Mutuus-Erfahrung',
  'active',
  '00000000-0000-0000-0000-000000000000',
  now()
),
(
  gen_random_uuid(),
  '📚 Absolviere das Mutuus-Tutorial',
  'Lerne alle Funktionen von Mutuus kennen! Gehe durch unser interaktives Tutorial und entdecke, wie du Jobs findest, dich bewirbst und dein Karma aufbaust.',
  'other',
  'remote',
  'karma',
  25,
  1,
  'easy',
  '["Tutorial", "Lernen", "Funktionen", "Onboarding"]'::jsonb,
  'Neues Mutuus-Konto (weniger als 7 Tage alt)',
  'Vollständig abgeschlossenes Tutorial mit allen Modulen',
  'active',
  '00000000-0000-0000-0000-000000000000',
  now()
),
(
  gen_random_uuid(),
  '📝 Vervollständige dein Profil zu 100%',
  'Mache dein Mutuus-Profil komplett! Fülle alle Profilfelder aus: Name, Bio, Skills, Erfahrung, Portfolio-Links und Kontaktinformationen. Ein vollständiges Profil erhöht deine Chancen auf Jobs.',
  'other',
  'remote',
  'karma',
  100,
  1,
  'easy',
  '["Profil", "Vollständigkeit", "Skills", "Portfolio"]'::jsonb,
  'Registriertes Mutuus-Konto',
  'Profil zu 100% ausgefüllt mit allen verfügbaren Feldern',
  'active',
  '00000000-0000-0000-0000-000000000000',
  now()
),
(
  gen_random_uuid(),
  '🔥 Erreiche eine 7-Tage Login-Streak',
  'Bleib aktiv in der Mutuus-Community! Logge dich 7 Tage hintereinander ein und zeige dein Engagement. Regelmäßige Aktivität hilft dir, keine Jobs zu verpassen.',
  'other',
  'remote',
  'karma',
  125,
  1,
  'medium',
  '["Login", "Streak", "Aktivität", "Engagement"]'::jsonb,
  'Registriertes Mutuus-Konto',
  '7 aufeinanderfolgende Tage mit Login-Aktivität',
  'active',
  '00000000-0000-0000-0000-000000000000',
  now()
),
(
  gen_random_uuid(),
  '⭐ Bewerte deinen ersten abgeschlossenen Job',
  'Gib Feedback zu deiner ersten Job-Erfahrung! Bewerte den Auftraggeber und den Job, um anderen Nutzern zu helfen und das Vertrauen in der Community zu stärken.',
  'other',
  'remote',
  'karma',
  75,
  1,
  'easy',
  '["Bewertung", "Feedback", "Vertrauen", "Community"]'::jsonb,
  'Mindestens einen abgeschlossenen Job auf Mutuus',
  'Abgegebene Bewertung für Auftraggeber und Job',
  'active',
  '00000000-0000-0000-0000-000000000000',
  now()
),
(
  gen_random_uuid(),
  '🎨 Erstelle deinen ersten eigenen Job',
  'Werde vom Job-Suchenden zum Job-Anbieter! Erstelle deinen ersten eigenen Job auf Mutuus und erlebe die Plattform aus einer anderen Perspektive.',
  'other',
  'remote',
  'karma',
  150,
  1,
  'medium',
  '["Job erstellen", "Auftraggeber", "Perspektive", "Erfahrung"]'::jsonb,
  'Verifiziertes Mutuus-Profil',
  'Erfolgreich erstellter und veröffentlichter Job',
  'active',
  '00000000-0000-0000-0000-000000000000',
  now()
);

-- Create indexes for better performance on karma jobs
CREATE INDEX IF NOT EXISTS idx_jobs_karma_type ON jobs(job_type) WHERE job_type = 'karma';
CREATE INDEX IF NOT EXISTS idx_jobs_karma_active ON jobs(status, job_type) WHERE status = 'active' AND job_type = 'karma';