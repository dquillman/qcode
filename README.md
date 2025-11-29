# 🚀 Code Q Projects

> A modern, interactive portfolio showcase platform built with Next.js 15, React 19, and TypeScript.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black.svg)
![React](https://img.shields.io/badge/React-19.1.0-61DAFB.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ Features

- 🎨 **Beautiful UI** - Modern gradient-based design with smooth animations
- 🖼️ **Multi-Image Carousel** - Support for up to 5 images per project
- 🎯 **Drag & Drop** - Reorder projects with intuitive drag-and-drop
- 🔐 **Admin System** - Secure password-protected project management
- 💾 **Dual Storage** - Browser localStorage + optional Google Sheets backup
- 📱 **Fully Responsive** - Optimized for mobile, tablet, and desktop
- ⚡ **Lightning Fast** - Built with Next.js 15 and Turbopack
- 🎭 **No Backend** - Runs entirely client-side

## 🎯 Live Demo

Visit the live site at: `http://localhost:3000` (or your deployed URL)

## 📸 Screenshots

![Homepage](docs/screenshots/homepage.png)
*Beautiful gradient homepage with project showcase*

![Admin Panel](docs/screenshots/admin.png)
*Intuitive admin interface for managing projects*

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ installed
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/code-q-projects.git
   cd code-q-projects
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Admin Access

Default admin password: `admin123`

⚠️ **Important:** Change the password in `src/components/ProjectsSection.tsx` line 199

## 📚 Documentation

- **[Setup Guide](SETUP_GOOGLE_SHEETS.md)** - Google Sheets integration
- **[Tech Stack](TECH_STACK.md)** - Complete list of technologies
- **[Project Description](PROJECT_DESCRIPTION.md)** - Detailed overview

## 🛠️ Tech Stack

- **Framework:** Next.js 15.5.4
- **UI Library:** React 19.1.0
- **Language:** TypeScript 5.x
- **Styling:** Tailwind CSS 4.x
- **Drag & Drop:** @dnd-kit
- **Cloud Storage:** Google Sheets API (optional)
- **Image Handling:** Next.js Image + Base64

## 🎨 Key Features Explained

### Multi-Image Carousel
Each project supports up to 5 images with:
- Arrow navigation (← →)
- Dot indicators
- Smooth transitions
- Hover-to-reveal controls

### Drag & Drop Reordering
Admin users can:
- Click the ☰ icon on any card
- Drag to desired position
- Auto-saves new order

### Admin Authentication
- Password-protected access
- 24-hour session
- Secure localStorage session
- Easy logout

### Google Sheets Integration
Optional backup to Google Sheets:
- One-click save
- Automatic timestamps
- Service account auth
- See [Setup Guide](SETUP_GOOGLE_SHEETS.md)

## 📁 Project Structure

```
code-q-projects/
├── src/
│   ├── app/              # Next.js app directory
│   │   ├── page.tsx      # Homepage
│   │   ├── admin/        # Admin page
│   │   └── api/          # API routes
│   ├── components/       # React components
│   ├── config/           # Configuration files
│   └── data/             # Data files
├── public/               # Static assets
├── docs/                 # Documentation
└── package.json
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file:

```env
# Google Sheets (Optional)
GOOGLE_SERVICE_ACCOUNT_KEY='your-service-account-json'
GOOGLE_SHEET_ID='your-spreadsheet-id'
```

### Admin Password

Edit `src/components/ProjectsSection.tsx`:

```typescript
const correctPassword = "your-secure-password"; // Line 199
```

## 🚢 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Visit [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables (if using Google Sheets)
5. Deploy!

### Deploy to Netlify

1. Build the project: `npm run build`
2. Deploy the `.next` folder
3. Add environment variables

### Deploy to Google Cloud Run

For production on Google Cloud Run with Cloud SQL (Postgres), follow the step-by-step guide in `DEPLOY.md`.

## 📝 Usage

### Adding a Project

1. Login as admin
2. Click "Add Project"
3. Fill in details:
   - Title
   - URL
   - Description
   - Tags (comma-separated)
   - Images (upload or paste URL)
4. Optionally check "Save to Google Sheets"
5. Click "Save Project"

### Editing a Project

1. Login as admin
2. Click "Edit" on any project card
3. Update fields
4. Click "Update Project"

### Reordering Projects

1. Login as admin
2. Click and drag the ☰ icon
3. Drop in new position
4. Order auto-saves

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Dave Quillman "Q"**

- Website: [Your Website]
- GitHub: [@YOUR_USERNAME](https://github.com/YOUR_USERNAME)
- LinkedIn: [Your LinkedIn]

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Tailwind CSS for the utility-first CSS
- @dnd-kit for the drag-and-drop library
- All open source contributors

## 📊 Project Stats

- **Version:** 1.0.0
- **Build Time:** ~20-30 hours
- **Lines of Code:** ~3000+
- **Components:** 10+
- **Dependencies:** 17

## 🐛 Bug Reports

Found a bug? Please open an issue on GitHub with:
- Description of the bug
- Steps to reproduce
- Expected behavior
- Screenshots (if applicable)

## 💡 Feature Requests

Have an idea? Open an issue with the "enhancement" label!

## 📈 Roadmap

- [ ] Contact form integration
- [ ] Project search/filter
- [ ] Light/dark mode toggle
- [ ] PWA support
- [ ] Analytics dashboard
- [ ] Video support
- [ ] Multi-language support

## ⭐ Show Your Support

Give a ⭐️ if this project helped you!

---

**Built with ❤️ by Dave Quillman "Q"**

*Last Updated: January 2025*
