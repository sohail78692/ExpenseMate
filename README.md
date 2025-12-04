<div align="center">

# 💰 ExpenseMate

### Your Smart Personal Finance Companion

[![Made with Love](https://img.shields.io/badge/Made%20with-❤️-red.svg)](https://github.com/sohail78692)
[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?logo=next.js)](https://nextjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-green?logo=mongodb)](https://www.mongodb.com/)
[![Contributions Active](https://img.shields.io/badge/Contributions-Active-brightgreen.svg)](https://github.com/sohail78692/ExpenseMate)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**Track expenses • Set budgets • Achieve savings goals • Gain financial insights**

[Live Demo](https://expense-mate-beta.vercel.app) • [Report Bug](https://github.com/sohail78692/ExpenseMate/issues) • [Request Feature](https://github.com/sohail78692/ExpenseMate/issues)

</div>

---

## 📖 Table of Contents

- [✨ Features](#-features)
- [🎯 Why ExpenseMate?](#-why-expensemate)
- [🚀 Quick Start](#-quick-start)
- [🛠️ Tech Stack](#️-tech-stack)
- [📸 Screenshots](#-screenshots)
- [⚙️ Configuration](#️-configuration)
- [🔐 Authentication & Security](#-authentication--security)
- [📧 Email Features](#-email-features)
- [🎨 UI/UX Highlights](#-uiux-highlights)
- [🤝 Contributing](#-contributing)
- [📝 License](#-license)
- [👨‍💻 Author](#-author)

---

## ✨ Features

### 💸 Expense Management
- **Quick Expense Tracking** - Add expenses in seconds with an intuitive interface
- **Category Organization** - Pre-defined categories (Food, Transport, Shopping, etc.)
- **Smart Search & Filters** - Find any expense instantly
- **Bulk Operations** - Edit or delete multiple expenses at once
- **Expense Notes** - Add detailed notes to track context

### 📊 Analytics & Insights
- **Interactive Dashboard** - Real-time overview of your financial health
- **Visual Charts** - Beautiful pie charts and trend graphs
- **Calendar Heatmap** - See your spending patterns at a glance
- **Category Breakdown** - Understand where your money goes
- **Daily/Monthly Trends** - Track spending over time
- **Timezone-Aware Analytics** - Accurate data regardless of your location

### 💰 Budget Management
- **Monthly Budgets** - Set limits for different categories
- **Progress Tracking** - Visual progress bars with real-time updates
- **Budget Alerts** - Get notified when approaching limits
- **Flexible Periods** - Custom budget periods
- **Historical Comparison** - Compare spending across months

### 🎯 Savings Goals
- **Goal Setting** - Create savings goals with target amounts
- **Progress Visualization** - Beautiful progress indicators
- **Deadline Tracking** - Stay motivated with target dates
- **Multiple Goals** - Track several goals simultaneously
- **Achievement Celebrations** - Celebrate when you reach your goals

### 👤 User Management
- **Secure Authentication** - Email/password with NextAuth.js
- **Profile Customization** - Upload profile pictures, update info
- **Password Management** - Secure password reset via email
- **Account Verification** - Admin-approved verification system
- **Dark/Light Mode** - Toggle between themes
- **Account Deletion** - Full data removal with double confirmation

### 📧 Email Notifications
- **Password Reset** - Beautiful HTML emails with secure tokens
- **Verification Requests** - Admin receives verification requests
- **Account Verified** - Users get confirmation emails
- **Professional Templates** - Responsive, branded email designs

---

## 🎯 Why ExpenseMate?

**ExpenseMate** isn't just another expense tracker—it's your personal financial assistant built with modern web technologies and a focus on user experience.

### 🌟 What Makes It Special?

- **🎨 Beautiful Design** - Modern, glassmorphic UI with smooth animations
- **⚡ Lightning Fast** - Optimized with parallel queries and efficient data fetching
- **🌍 Timezone Smart** - Works correctly regardless of where you are
- **📱 Responsive** - Perfect experience on desktop, tablet, and mobile
- **🔒 Secure** - Industry-standard authentication and data protection
- **🎯 User-Focused** - Every feature designed with real users in mind
- **🚀 Production Ready** - Deployed on Vercel with MongoDB Atlas

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- MongoDB database (local or Atlas)
- Gmail account (for email features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sohail78692/ExpenseMate.git
   cd ExpenseMate
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # MongoDB
   MONGODB_URI=your_mongodb_connection_string
   
   # NextAuth
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_secret_key_here
   
   # Email (Gmail)
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-gmail-app-password
   ```

4. **Generate NextAuth Secret**
   ```bash
   openssl rand -base64 32
   ```

5. **Set up Gmail App Password**
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Enable 2-Factor Authentication
   - Generate an App Password for "Mail"
   - Use that password in `EMAIL_PASSWORD`

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 🛠️ Tech Stack

### Frontend
- **[Next.js 16](https://nextjs.org/)** - React framework with App Router
- **[React 19](https://react.dev/)** - UI library
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first styling
- **[shadcn/ui](https://ui.shadcn.com/)** - Beautiful component library
- **[Recharts](https://recharts.org/)** - Data visualization
- **[Lucide Icons](https://lucide.dev/)** - Modern icon set
- **[date-fns](https://date-fns.org/)** - Date manipulation

### Backend
- **[Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)** - Serverless functions
- **[NextAuth.js](https://next-auth.js.org/)** - Authentication
- **[MongoDB](https://www.mongodb.com/)** - NoSQL database
- **[Mongoose](https://mongoosejs.com/)** - MongoDB ODM
- **[bcryptjs](https://www.npmjs.com/package/bcryptjs)** - Password hashing
- **[Nodemailer](https://nodemailer.com/)** - Email sending

### DevOps & Deployment
- **[Vercel](https://vercel.com/)** - Hosting & deployment
- **[MongoDB Atlas](https://www.mongodb.com/atlas)** - Cloud database
- **[Git](https://git-scm.com/)** - Version control

---

## 📸 Screenshots

### Dashboard
![Dashboard](https://via.placeholder.com/800x450/667eea/ffffff?text=Dashboard+View)
*Real-time overview of your finances with quick stats and recent expenses*

### Analytics
![Analytics](https://via.placeholder.com/800x450/764ba2/ffffff?text=Analytics+Page)
*Visual insights with charts, trends, and calendar heatmap*

### Expense Management
![Expenses](https://via.placeholder.com/800x450/667eea/ffffff?text=Expense+List)
*Comprehensive expense list with search, filter, and bulk actions*

### Budget Tracking
![Budgets](https://via.placeholder.com/800x450/764ba2/ffffff?text=Budget+Overview)
*Set and track budgets with visual progress indicators*

---

## ⚙️ Configuration

### Database Setup

1. **MongoDB Atlas** (Recommended for production)
   - Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Get your connection string
   - Add to `MONGODB_URI` in `.env.local`

2. **Local MongoDB**
   ```bash
   # Install MongoDB locally
   # Then use:
   MONGODB_URI=mongodb://localhost:27017/expensemate
   ```

### Email Configuration

The app uses Gmail SMTP for sending emails. To set up:

1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password:
   - Visit [App Passwords](https://myaccount.google.com/apppasswords)
   - Select "Mail" and "Other (Custom name)"
   - Copy the 16-character password
3. Add to `.env.local`:
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=xxxx-xxxx-xxxx-xxxx
   ```

### Deployment to Vercel

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository

3. **Add Environment Variables**
   - In Vercel project settings → Environment Variables
   - Add all variables from `.env.local`
   - Important: Update `NEXTAUTH_URL` to your production URL

4. **Deploy**
   - Vercel auto-deploys on every push to main

---

## 🔐 Authentication & Security

### Features
- **Secure Password Hashing** - bcrypt with salt rounds
- **JWT Sessions** - Secure, stateless authentication
- **CSRF Protection** - Built-in with NextAuth.js
- **Password Reset** - Secure token-based reset flow
- **Account Verification** - Admin-approved verification system
- **Session Management** - Automatic session refresh

### Security Best Practices
- Passwords are never stored in plain text
- Reset tokens expire after 1 hour
- Verification links use secure tokens
- All API routes are protected
- Environment variables for sensitive data

---

## 📧 Email Features

### Password Reset Flow
1. User requests password reset
2. System generates secure token
3. Beautiful email sent with reset link
4. Link expires after 1 hour
5. User sets new password

### Account Verification Flow
1. User clicks "Request Verification"
2. Admin receives email notification
3. Admin clicks "Verify Account" in email
4. User's account is verified
5. User receives confirmation email

### Email Templates
- Responsive HTML design
- Gradient headers with animations
- Clear call-to-action buttons
- Professional branding
- Mobile-friendly layout

---

## 🎨 UI/UX Highlights

### Design System
- **Color Palette** - Purple gradient theme (#667eea → #764ba2)
- **Typography** - Geist Sans & Geist Mono fonts
- **Spacing** - Consistent 8px grid system
- **Animations** - Smooth transitions and micro-interactions
- **Glassmorphism** - Modern frosted glass effects

### User Experience
- **Instant Feedback** - Loading states and success messages
- **Error Handling** - Clear, helpful error messages
- **Keyboard Shortcuts** - Efficient navigation
- **Accessibility** - ARIA labels and semantic HTML
- **Progressive Enhancement** - Works without JavaScript

### Dark Mode
- Automatic system detection
- Manual toggle in profile
- Optimized color contrast
- Smooth theme transitions

---

## 🤝 Contributing

Contributions are **actively welcomed**! This project is built with ❤️ and we'd love your help to make it even better.

### How to Contribute

1. **Fork the repository**
   ```bash
   # Click the "Fork" button on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/ExpenseMate.git
   cd ExpenseMate
   ```

3. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

4. **Make your changes**
   - Write clean, readable code
   - Follow existing code style
   - Add comments where needed
   - Test thoroughly

5. **Commit your changes**
   ```bash
   git commit -m "Add: amazing new feature"
   ```

6. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```

7. **Open a Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Describe your changes clearly

### Contribution Guidelines

- **Code Style** - Follow the existing patterns
- **Commits** - Use clear, descriptive commit messages
- **Testing** - Test your changes locally
- **Documentation** - Update README if needed
- **Issues** - Check existing issues before creating new ones

### Areas for Contribution

- 🐛 Bug fixes
- ✨ New features
- 📝 Documentation improvements
- 🎨 UI/UX enhancements
- ⚡ Performance optimizations
- 🌍 Internationalization (i18n)
- ♿ Accessibility improvements

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### What this means:
- ✅ Commercial use
- ✅ Modification
- ✅ Distribution
- ✅ Private use
- ⚠️ Liability and warranty limitations

---

## 👨‍💻 Author

<div align="center">

### **Made with ❤️ by Sohail**

[![GitHub](https://img.shields.io/badge/GitHub-sohail78692-black?logo=github)](https://github.com/sohail78692)
[![Email](https://img.shields.io/badge/Email-sohail786akh@gmail.com-red?logo=gmail)](mailto:sohail786akh@gmail.com)

**Passionate about building beautiful, functional web applications**

</div>

---

## 🙏 Acknowledgments

- **Next.js Team** - For the amazing framework
- **Vercel** - For seamless deployment
- **shadcn** - For the beautiful component library
- **MongoDB** - For the flexible database
- **All Contributors** - For making this project better

---

## 📊 Project Stats

![GitHub stars](https://img.shields.io/github/stars/sohail78692/ExpenseMate?style=social)
![GitHub forks](https://img.shields.io/github/forks/sohail78692/ExpenseMate?style=social)
![GitHub watchers](https://img.shields.io/github/watchers/sohail78692/ExpenseMate?style=social)

---

## 🗺️ Roadmap

### Upcoming Features
- [ ] 📱 Mobile app (React Native)
- [ ] 🔔 Push notifications
- [ ] 📊 Advanced analytics with AI insights
- [ ] 💳 Bank account integration
- [ ] 📤 Export to CSV/PDF
- [ ] 🌐 Multi-language support
- [ ] 👥 Shared budgets for families
- [ ] 🎯 Smart spending recommendations
- [ ] 📈 Investment tracking
- [ ] 🤖 Chatbot assistant

---

## 💡 Support

If you find this project helpful, please consider:

- ⭐ Starring the repository
- 🐛 Reporting bugs
- 💡 Suggesting new features
- 🤝 Contributing code
- 📢 Sharing with others

---

<div align="center">

### 🌟 Star this repo if you like it! 🌟

**Built with passion, deployed with confidence**

[⬆ Back to Top](#-expensemate)

</div>
