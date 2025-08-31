# 🗳️ VoteChain-AI-95

**Secure Blockchain-Inspired Voting System with AI-Powered Face Recognition**

A cutting-edge digital voting platform that combines blockchain-inspired security with advanced facial recognition technology to ensure secure, transparent, and tamper-proof elections.

![VoteChain-AI-95](public/og-image.png)

## 🚀 Live Demo

**Public URL**: [https://voteguard.loca.lt](https://voteguard.loca.lt)

*Access the live demo with real SMS OTP and face recognition authentication*

## ✨ Key Features

### 🔐 **Multi-Layer Security**
- **SMS OTP Authentication** - Multi-provider SMS system (Twilio, Fast2SMS, TextLocal)
- **AI Face Recognition** - Advanced facial verification with liveness detection
- **Blockchain-Inspired** - Immutable vote records with cryptographic hashing
- **JWT Token Security** - Secure session management with custom verification

### 🎯 **Smart Authentication Flow**
1. **Phone Verification** → SMS OTP to registered mobile number
2. **Face Enrollment** → Secure biometric registration with encryption
3. **Face Verification** → Anti-spoofing liveness detection
4. **Secure Voting** → Blockchain-simulated vote casting with audit trails

### 📊 **Real-Time Analytics**
- **Admin Dashboard** - Live voting statistics and metrics
- **Security Monitoring** - Real-time audit logs and alerts
- **Vote Visualization** - Interactive charts and data insights
- **Fraud Detection** - Advanced security monitoring system

### 🌐 **Cross-Platform Access**
- **Mobile Responsive** - Optimized for all device types
- **Camera Integration** - Real-time face detection and verification
- **Public URL Access** - LocalTunnel integration for remote testing
- **Real-Time Updates** - Live vote counting and results

## 🛠️ Technology Stack

### **Frontend**
- **React 18.3.1** - Modern UI framework
- **TypeScript 5.5.3** - Type-safe development
- **Vite 5.4.1** - Lightning-fast build tool
- **Tailwind CSS 3.4.11** - Utility-first styling
- **shadcn/ui** - Beautiful component library
- **Framer Motion** - Smooth animations

### **Authentication & Security**
- **Supabase** - Backend-as-a-Service with Row Level Security
- **JWT Tokens** - Secure authentication with custom verification
- **AES-GCM Encryption** - Encrypted face descriptor storage
- **Rate Limiting** - Protection against abuse and attacks

### **AI & Recognition**
- **face-api.js** - Advanced facial recognition library
- **Liveness Detection** - Anti-spoofing movement verification
- **Real-time Processing** - Live camera feed analysis
- **Confidence Scoring** - Accurate face matching algorithms

### **Communication**
- **Twilio SMS** - Primary SMS provider
- **Fast2SMS** - Backup SMS service
- **TextLocal** - Additional SMS fallback
- **Socket.io** - Real-time communication

## 📋 Quick Start

### **Prerequisites**
- Node.js 18+ and npm
- Modern web browser with camera access
- Mobile phone for SMS verification

### **Installation**

```bash
# Clone the repository
git clone <repository-url>
cd votechain-ai-95-main

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

### **Public Deployment**

```bash
# Start public server with LocalTunnel
./start-public.sh

# Stop public server
./stop-public.sh
```

## ⚙️ Configuration

### **Environment Variables**

Create a `.env` file based on `.env.example`:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# SMS Provider Configuration (choose one or multiple for fallback)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_number

# Security
JWT_SECRET=your_jwt_secret_key
FACE_ENCRYPTION_KEY=your_face_encryption_key

# Demo Mode (set to false for production)
DEMO_MODE=true
```

### **SMS Providers Setup**

The system supports multiple SMS providers with automatic fallback:

1. **Twilio** (Primary) - Enterprise-grade SMS delivery
2. **Fast2SMS** (Backup) - Indian SMS provider
3. **TextLocal** (Fallback) - Additional SMS service

## 🏗️ Project Structure

```
votechain-ai-95-main/
├── src/
│   ├── components/           # React components
│   │   ├── auth/            # Authentication components
│   │   ├── camera/          # Face recognition components
│   │   └── admin/           # Admin dashboard components
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility functions
│   └── integrations/        # External service integrations
├── supabase/
│   ├── functions/           # Edge functions
│   └── migrations/          # Database schema
├── public/
│   ├── models/             # Face recognition models
│   └── lovable-uploads/    # Static assets
└── scripts/                # Deployment scripts
```

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run preview         # Preview production build

# Deployment
./start-public.sh       # Start public deployment
./stop-public.sh        # Stop public deployment

# Code Quality
npm run lint            # Run ESLint
npm run type-check      # TypeScript type checking
```

## 🗄️ Database Schema

### **Core Tables**
- `users` - User profiles with phone and verification status
- `votes` - Immutable vote records with blockchain-inspired hashing
- `face_enrollment` - Encrypted facial recognition data
- `security_alerts` - Audit logs and security monitoring
- `voting_schedule` - Admin-controlled voting periods

### **Security Features**
- **Row Level Security (RLS)** - Database-level access control
- **Encrypted Storage** - Face descriptors encrypted at rest
- **Audit Logging** - Comprehensive security event tracking
- **Rate Limiting** - Protection against brute force attacks

## 📱 Usage Guide

### **For Voters**
1. **Registration** - Enter phone number for SMS verification
2. **OTP Verification** - Enter 6-digit code from SMS
3. **Face Enrollment** - Register facial biometric data
4. **Vote Casting** - Select candidate and confirm vote
5. **Verification** - Receive vote confirmation with hash

### **For Administrators**
1. **Admin Login** - Secure admin authentication
2. **Dashboard Access** - Real-time voting statistics
3. **Security Monitoring** - View audit logs and alerts
4. **Vote Management** - Control voting periods and settings
5. **Analytics** - Detailed voting insights and reports

## 🔒 Security Features

### **Authentication Security**
- Multi-factor authentication (SMS + Face)
- JWT token-based session management
- Secure OTP generation and validation
- Rate limiting on authentication attempts

### **Biometric Security**
- Liveness detection to prevent spoofing
- Encrypted face descriptor storage
- Confidence threshold validation
- Anti-replay attack protection

### **Vote Security**
- Blockchain-inspired immutable records
- Cryptographic vote hashing
- Duplicate vote prevention
- Audit trail for all transactions

### **Infrastructure Security**
- Row Level Security (RLS) policies
- HTTPS/TLS encryption in transit
- Environment variable protection
- Secure API endpoint design

## 🚀 Deployment Options

### **Local Development**
```bash
npm run dev
# Access at http://localhost:5173
```

### **Public Testing (LocalTunnel)**
```bash
./start-public.sh
# Access at https://voteguard.loca.lt
```

### **Production Deployment**
- **Netlify** - Recommended for static deployment
- **Vercel** - Alternative static hosting
- **Custom Server** - Self-hosted with Docker
- **Supabase Edge Functions** - Serverless backend

## 🧪 Testing

### **Manual Testing**
1. **Phone Verification** - Test SMS delivery
2. **Face Recognition** - Verify camera access and detection
3. **Vote Flow** - Complete end-to-end voting process
4. **Admin Functions** - Test dashboard and analytics
5. **Security** - Attempt unauthorized access

### **Mobile Testing**
- Use public URL for real device testing
- Test camera functionality on mobile
- Verify SMS delivery to mobile numbers
- Check responsive design across devices

## 🐛 Troubleshooting

### **Common Issues**

**Camera Access Denied**
```bash
# Ensure HTTPS or localhost
# Check browser permissions
# Verify camera hardware
```

**SMS Not Received**
```bash
# Check phone number format
# Verify SMS provider credentials
# Test with different providers
```

**Face Recognition Fails**
```bash
# Ensure good lighting
# Check camera quality
# Verify model files loaded
```

**Build Errors**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📚 API Documentation

### **Authentication Endpoints**
- `POST /auth-request-otp` - Request SMS OTP
- `POST /auth-verify-otp` - Verify OTP and get JWT
- `POST /face-enrollment` - Enroll face biometric
- `POST /auth-face-verify` - Verify face for login

### **Voting Endpoints**
- `POST /vote` - Cast vote with verification
- `GET /vote-status` - Check if user has voted
- `GET /voting-schedule` - Get voting period info

### **Admin Endpoints**
- `GET /admin-stats` - Real-time voting statistics
- `GET /admin-logs` - Security audit logs
- `POST /admin-controls` - Manage voting settings

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### **Development Guidelines**
- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write comprehensive tests for new features
- Update documentation for API changes
- Ensure mobile responsiveness

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **face-api.js** - Facial recognition library
- **Supabase** - Backend infrastructure
- **Tailwind CSS** - Styling framework
- **shadcn/ui** - Component library
- **Twilio** - SMS service provider

## 📞 Support

For support and questions:
- **Issues** - GitHub Issues for bug reports
- **Discussions** - GitHub Discussions for questions
- **Documentation** - Check the `/docs` folder
- **Email** - Contact maintainers directly

---

**Built with ❤️ for secure and transparent digital democracy**
