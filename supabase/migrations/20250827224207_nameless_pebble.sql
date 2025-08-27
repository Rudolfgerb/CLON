/*
  # Seed Initial Data

  1. Job Categories
    - Development, Design, Marketing, Business, Writing, Other
  
  2. Admin Roles & Permissions
    - Super Admin with all permissions
    - Regular Admin with limited permissions
  
  3. Example Data (Development only)
    - Sample job posts
    - Test user profiles
*/

-- Insert job categories
INSERT INTO job_categories (name, description, icon, color) VALUES
  ('Entwicklung', 'Programmierung, Web Development, Apps', 'Code', 'from-blue-500 to-blue-600'),
  ('Design', 'UI/UX, Grafik Design, Illustration', 'Palette', 'from-purple-500 to-purple-600'),
  ('Marketing', 'Social Media, SEO, Content Marketing', 'TrendingUp', 'from-green-500 to-green-600'),
  ('Business', 'Beratung, Projektmanagement, Analyse', 'Briefcase', 'from-indigo-500 to-indigo-600'),
  ('Schreiben', 'Texte, Übersetzungen, Lektorat', 'PenTool', 'from-orange-500 to-orange-600'),
  ('Daten', 'Analyse, Eingabe, Recherche', 'Database', 'from-teal-500 to-teal-600'),
  ('Support', 'Kundenservice, Testing, QA', 'HeadphonesIcon', 'from-pink-500 to-pink-600'),
  ('Sonstiges', 'Andere Aufgaben und Projekte', 'MoreHorizontal', 'from-gray-500 to-gray-600')
ON CONFLICT (name) DO NOTHING;

-- Create admin roles with permissions
INSERT INTO admin_roles (name, permissions) VALUES
  ('Super Admin', '{"manage_users": true, "manage_jobs": true, "manage_payments": true, "manage_roles": true, "view_analytics": true, "moderate_content": true, "system_settings": true}'),
  ('User Admin', '{"manage_users": true, "view_profiles": true, "moderate_content": true}'),
  ('Job Admin', '{"manage_jobs": true, "view_analytics": true, "moderate_content": true}'),
  ('Payment Admin', '{"manage_payments": true, "view_analytics": true}')
ON CONFLICT (name) DO NOTHING;

-- Only insert example data in development environment
-- Note: In production, remove this section or add proper environment check
DO $$
BEGIN
  -- Check if we're in development (you can modify this condition)
  IF current_setting('app.environment', true) = 'development' OR 
     NOT EXISTS (SELECT 1 FROM profiles LIMIT 1) THEN
    
    -- Insert sample job posts (only if no jobs exist)
    INSERT INTO job_posts (
      title, description, category_id, job_type, location, difficulty_level,
      budget_type, budget_amount, payment_type, cash_amount, karma_amount,
      deadline, deliverables, tags, creator_id, visibility
    ) VALUES
    (
      'React Dashboard erstellen',
      'Benötige einen modernen React Dashboard mit TypeScript. Sollte responsive sein und Charts enthalten.',
      (SELECT id FROM job_categories WHERE name = 'Entwicklung'),
      'cash',
      'Remote',
      'medium',
      'fixed',
      350.00,
      'cash',
      350.00,
      0,
      NOW() + INTERVAL '14 days',
      'Vollständiges React Dashboard mit TypeScript, Charts und responsivem Design',
      ARRAY['React', 'TypeScript', 'Dashboard', 'Charts'],
      (SELECT id FROM profiles WHERE email LIKE '%admin%' LIMIT 1),
      'public'
    ),
    (
      'Logo Design für Startup',
      'Kreatives Logo für neues Tech-Startup. Minimalistisch und modern.',
      (SELECT id FROM job_categories WHERE name = 'Design'),
      'mixed',
      'Remote', 
      'easy',
      'fixed',
      150.00,
      'mixed',
      120.00,
      200,
      NOW() + INTERVAL '7 days',
      'Logo in verschiedenen Formaten (PNG, SVG, PDF) plus Brandguide',
      ARRAY['Logo', 'Design', 'Branding', 'Startup'],
      (SELECT id FROM profiles WHERE email LIKE '%admin%' LIMIT 1),
      'public'
    ),
    (
      'Website Testing und Feedback',
      'Teste unsere neue Website und gib detailliertes Feedback zu UX und Bugs.',
      (SELECT id FROM job_categories WHERE name = 'Support'),
      'karma',
      'Remote',
      'easy',
      'fixed',
      0,
      'karma',
      0,
      150,
      NOW() + INTERVAL '3 days',
      'Detailliertes Feedback-Dokument mit Screenshots und Verbesserungsvorschlägen',
      ARRAY['Testing', 'UX', 'Feedback', 'Website'],
      (SELECT id FROM profiles WHERE email LIKE '%admin%' LIMIT 1),
      'public'
    )
    WHERE EXISTS (SELECT 1 FROM profiles WHERE email LIKE '%admin%' LIMIT 1);
    
    RAISE NOTICE 'Sample data inserted successfully';
  ELSE
    RAISE NOTICE 'Skipping sample data - production environment detected';
  END IF;
END $$;