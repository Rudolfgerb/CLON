# 🚀 Mutuus - Karma Exchange Platform

Eine moderne Job-Plattform die Geld und Karma-Punkte als Bezahlsystem nutzt. Benutzer können Cash Jobs für Einkommen und Karma Jobs für Community-Hilfe erstellen und bearbeiten.

## 🌟 Features

### 🎯 Core Features
- **Dual Payment System**: Cash Jobs (€) und Karma Jobs (Community Punkte)
- **3-Step Job Creation**: Intuitive Formular mit Medien-Upload
- **Smart Applications**: Bewerbungssystem mit Karma-Validierung
- **Premium Membership**: Reduzierte Provisionen (5% statt 9.8%)
- **Real-time Updates**: Live Benachrichtigungen und Status-Updates
- **Mobile-First Design**: Responsive auf allen Geräten

### 💼 Job Management
- **Multi-Step Creation**: Titel/Beschreibung → Details → Deadline/Payment
- **Media Upload**: Mehrere Dateien, Titelbild-Auswahl
- **Flexible Payment**: Stundensatz oder Festpreis
- **Tag System**: Kategorisierung und Filterung
- **Deadline Management**: Präzise Datum/Zeit Kontrolle

### 🏆 User System
- **Karma Points**: Community-basierte Währung
- **Level System**: Progression durch Aktivität
- **Premium Upgrades**: Stripe-Integration für Subscriptions
- **Profile Management**: Bio, Website, Skills
- **Review System**: Beidseitige Bewertungen nach Job-Completion

### 🛡️ Security & Admin
- **Row Level Security**: Comprehensive RLS policies
- **Admin Dashboard**: User/Job/Payment Management
- **Role-based Access**: User, Admin, Super Admin roles
- **Audit Logging**: Complete activity tracking

## 🛠️ Tech Stack

### Frontend
- **React 18** mit TypeScript
- **Tailwind CSS** für Styling
- **Lucide React** für Icons
- **Vite** als Build Tool

### Backend & Database
- **Supabase** (PostgreSQL, Auth, Storage, Edge Functions)
- **Row Level Security** für alle Tabellen
- **PostGIS** für Geodaten (Maps feature)
- **Real-time Subscriptions** für Live-Updates

### Payments & Integration
- **Stripe** für Zahlungen und Subscriptions
- **Webhook Handling** für Payment Events
- **Commission System** mit Premium-Rabatten
- **Wallet Management** für User Guthaben

### Development
- **TypeScript** für Type Safety
- **ESLint** für Code Quality
- **Vitest** für Testing
- **GitHub Actions** für CI/CD

## 🚀 Quick Start

### 1. Repository Setup
```bash
git clone https://github.com/yourusername/mutuus-platform
cd mutuus-platform
npm install
```

### 2. Environment Variables
```bash
cp .env.example .env
# Fill in your actual values in .env
```

### 3. Supabase Setup
1. Create new Supabase project
2. Run database migrations:
```bash
# Enable required extensions first in Supabase SQL Editor:
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- CREATE EXTENSION IF NOT EXISTS "pgcrypto";
-- CREATE EXTENSION IF NOT EXISTS "postgis";

# Then run migrations (files in /supabase/migrations/)
```

### 4. Stripe Setup
1. Create Stripe account
2. Add products in Stripe Dashboard:
   - Premium Subscription (€19.99/month)
   - Karma Package (1000 points for €2.99)
3. Set webhook URL to your Supabase Edge Function
4. Add keys to `.env`

### 5. Development
```bash
npm run dev
```

### 6. Production Deployment
```bash
npm run build
# Deploy to Vercel/Netlify
# Configure environment variables
```

## 📊 Database Schema

### Core Tables
- **profiles**: User profiles with karma, level, premium status
- **job_posts**: Main job table with flexible payment structure
- **job_categories**: Organized categories with icons/colors
- **job_media**: File upload system for jobs
- **job_applications**: Application system with status tracking
- **job_reviews**: Bidirectional review system

### Admin & System
- **admin_roles**: Role-based permissions
- **user_admin_roles**: User-to-role mappings
- **notifications**: System notifications
- **karma_transactions**: Karma point tracking
- **wallet_transactions**: Money transaction tracking

## 🔐 Security

### Authentication
- **Supabase Auth**: Email/Password authentication
- **Row Level Security**: All tables protected
- **Role-based Access**: Granular permissions
- **JWT Tokens**: Secure session management

### Payment Security
- **Stripe Integration**: PCI-compliant payment processing
- **Webhook Validation**: Signed webhook verification
- **Commission Tracking**: Transparent fee calculation
- **Audit Trails**: Complete transaction logging

### Data Protection
- **GDPR Compliance**: User data control
- **Data Encryption**: Sensitive data protected
- **Access Logging**: User activity tracking
- **Privacy Controls**: User data management

## 📱 API Endpoints

### Supabase Edge Functions
```
POST /functions/v1/stripe-checkout
POST /functions/v1/stripe-webhook
GET  /functions/v1/job-recommendations
POST /functions/v1/send-notification
```

### Database RPC Functions
```sql
-- Business Logic
process_job_application(job_id, applicant_id, message)
complete_job_with_payment(job_id, rating, review)
process_karma_purchase(user_id, karma_amount, payment_amount)
calculate_commission(amount, is_premium)

-- Admin Functions
get_admin_statistics(date_range)
moderate_content(content_id, action)
```

## 🧪 Testing

### Setup Tests
```bash
npm run test          # Unit tests
npm run test:e2e      # End-to-end tests
npm run test:db       # Database tests
```

### Test Coverage
- **Component Tests**: All UI components
- **Integration Tests**: API endpoints
- **Database Tests**: RLS policies and functions
- **E2E Tests**: Complete user flows

## 🔄 Development Workflow

### Branch Strategy
- `main`: Production-ready code
- `develop`: Integration branch
- `feature/*`: Feature development
- `hotfix/*`: Critical fixes

### Code Quality
```bash
npm run lint          # ESLint check
npm run format        # Prettier formatting
npm run type-check    # TypeScript validation
```

## 🚀 Deployment

### Frontend (Vercel/Netlify)
1. Connect GitHub repository
2. Set environment variables
3. Configure build settings:
   - Build command: `npm run build`
   - Output directory: `dist`

### Backend (Supabase)
1. Edge Functions auto-deploy from Git
2. Database migrations via Supabase CLI
3. Environment variables in Supabase Dashboard

### Stripe Configuration
1. Set webhook URL to Supabase Edge Function
2. Configure products and pricing
3. Test payments in sandbox mode

## 📈 Monitoring & Analytics

### Error Tracking
- **Sentry Integration**: Error monitoring
- **Custom Logging**: Business logic tracking
- **Performance Monitoring**: Response time tracking

### Business Metrics
- **User Activity**: Registration, engagement
- **Job Metrics**: Creation, completion rates
- **Payment Analytics**: Revenue, commission tracking
- **Karma Economy**: Point circulation analysis

## 🤝 Contributing

### Development Setup
1. Fork repository
2. Create feature branch
3. Follow code style guidelines
4. Add tests for new features
5. Submit pull request

### Code Standards
- **TypeScript**: Strict type checking
- **ESLint**: Code quality enforcement
- **Prettier**: Consistent formatting
- **Conventional Commits**: Clear commit messages

## 📞 Support

- **Documentation**: [docs.mutuus-app.de](https://docs.mutuus-app.de)
- **Issues**: GitHub Issues für Bugs und Features
- **Email**: support@mutuus-app.de
- **Discord**: Community Server

## 📄 License

MIT License - siehe [LICENSE](LICENSE) file für Details.

## 🔗 Links

- **Production**: [https://app.mutuus-app.de](https://app.mutuus-app.de)
- **Staging**: [https://staging.mutuus-app.de](https://staging.mutuus-app.de)  
- **Documentation**: [https://docs.mutuus-app.de](https://docs.mutuus-app.de)
- **Status Page**: [https://status.mutuus-app.de](https://status.mutuus-app.de)