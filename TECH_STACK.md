# 🛠️ Code Q - Tech Stack & Tools

A comprehensive list of all technologies, frameworks, and tools used in this project.

---

## 🎨 Frontend Framework

### **Next.js 15.5.4**
- React-based framework for building web applications
- Server-side rendering (SSR) and static site generation (SSG)
- File-based routing system
- Built-in image optimization
- **Turbopack** - Ultra-fast bundler for development

---

## ⚛️ UI Library

### **React 19.1.0**
- Component-based UI library
- Hooks for state management
- Virtual DOM for performance
- **react-dom** - DOM-specific methods for React

---

## 🎨 Styling

### **Tailwind CSS 4.x**
- Utility-first CSS framework
- Responsive design utilities
- Custom color palette (slate, blue, purple, pink gradients)
- Dark theme by default
- **@tailwindcss/postcss** - PostCSS plugin for Tailwind

### **Custom Gradients**
- Blue-purple-pink gradient for branding
- Slate gradient backgrounds
- Glass morphism effects (backdrop-blur)

---

## 📝 Language

### **TypeScript 5.x**
- Static type checking
- Enhanced IDE support
- Type-safe API calls
- Interfaces for Project data structure

---

## 🗂️ Data Storage

### **localStorage**
- Browser-based storage for local projects
- Session management for admin authentication
- Project order persistence
- Quota management (with warnings)

### **Google Sheets (Optional)**
- Cloud storage for project backups
- Real-time collaboration
- **googleapis** - Official Google APIs client library

---

## 🖼️ Image Handling

### **Next.js Image Component**
- Automatic image optimization
- Lazy loading
- Responsive images
- Support for external URLs
- **Base64 encoding** for uploaded images

---

## 🎭 Drag & Drop

### **@dnd-kit**
- Modern drag-and-drop library
- Accessible (keyboard support)
- Touch-friendly
- Smooth animations
- **@dnd-kit/core** - Core functionality
- **@dnd-kit/sortable** - Sortable list utilities
- **@dnd-kit/utilities** - Helper utilities

---

## 🔐 Authentication

### **Custom Admin System**
- Password-based authentication
- Session management (24-hour expiry)
- localStorage-based sessions
- Client-side validation

---

## 📦 Package Manager

### **npm**
- Dependency management
- Script execution
- Package versioning

---

## 🧹 Code Quality

### **ESLint 9.x**
- JavaScript/TypeScript linting
- **eslint-config-next** - Next.js-specific rules
- **@eslint/eslintrc** - ESLint configuration

---

## 🎯 Development Tools

### **Turbopack**
- Fast development server
- Hot module replacement (HMR)
- Incremental compilation

### **Git**
- Version control
- Branch management
- Commit history

---

## 🌐 APIs & Integration

### **Google Sheets API**
- Project data backup
- Service account authentication
- OAuth 2.0

### **Next.js API Routes**
- `/api/projects` - GET/POST projects
- `/api/projects/[id]` - PUT/DELETE specific project
- `/api/sheets` - Google Sheets integration

---

## 📱 Responsive Design

### **Breakpoints**
- **Mobile**: Default (< 640px)
- **Tablet**: sm: (≥ 640px)
- **Desktop**: lg: (≥ 1024px)

### **Grid System**
- 1 column on mobile
- 2 columns on tablet
- 3 columns on desktop

---

## 🎨 UI Components

### **Custom Components**
- **ProjectCard** - Project display with image carousel
- **ProjectsSection** - Main project grid with drag-and-drop
- **Admin Login Form** - Authentication UI
- **Image Upload** - File picker with preview

---

## 🖼️ Image Features

### **Multi-Image Carousel**
- Up to 5 images per project
- Navigation arrows (← →)
- Dot indicators
- Auto-rotation on arrow click
- Hover-to-reveal controls

---

## 🎭 Animations & Transitions

### **Tailwind Transitions**
- Hover effects (lift, border glow)
- Smooth color transitions
- Opacity changes
- Transform animations

### **CSS Animations**
- Card hover lift (-translate-y)
- Button hover states
- Drag opacity changes
- Gradient shifts

---

## 📊 Data Structure

### **Project Type**
```typescript
{
  id: string;              // Unique identifier
  title: string;           // Project name
  url: string;             // Project link
  description: string;     // Description
  tags: string[];          // Technology tags
  imageUrl?: string;       // Legacy single image
  images?: string[];       // Up to 5 images
  source?: "default" | "local" | "server";
}
```

---

## 🔧 Configuration Files

- **package.json** - Dependencies and scripts
- **tsconfig.json** - TypeScript configuration
- **eslint.config.mjs** - ESLint rules
- **postcss.config.mjs** - PostCSS settings
- **next.config.ts** - Next.js configuration
- **tailwind.config.js** - Tailwind customization
- **.env.local** - Environment variables (not in git)
- **.gitignore** - Files to exclude from git

---

## 📁 Project Structure

```
qcode/
├── src/
│   ├── app/
│   │   ├── page.tsx           # Homepage
│   │   ├── layout.tsx         # Root layout
│   │   ├── globals.css        # Global styles
│   │   ├── admin/
│   │   │   └── page.tsx       # Admin page
│   │   └── api/
│   │       ├── projects/
│   │       │   ├── route.ts   # Project CRUD
│   │       │   └── [id]/
│   │       │       └── route.ts
│   │       └── sheets/
│   │           └── route.ts   # Google Sheets API
│   ├── components/
│   │   ├── ProjectCard.tsx
│   │   ├── ProjectsSection.tsx
│   │   ├── ProjectCards.tsx
│   │   └── ProjectCard.tsx
│   └── data/
│       ├── projects.ts        # Default projects
│       └── projects.json      # Server projects
├── public/
├── .env.local                 # Environment variables
├── package.json
├── tsconfig.json
├── next.config.ts
├── SETUP_GOOGLE_SHEETS.md     # Setup guide
├── TECH_STACK.md             # This file
└── README.md

```

---

## 🚀 Scripts

```bash
npm run dev      # Start development server (Turbopack)
npm run build    # Build for production (Turbopack)
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

## 🌟 Key Features

1. **Drag-and-Drop Reordering** - Rearrange projects visually
2. **Multi-Image Carousel** - Up to 5 images per project
3. **Admin Authentication** - Password-protected editing
4. **Google Sheets Integration** - Optional cloud backup
5. **Image Upload** - File upload or URL paste
6. **Responsive Design** - Mobile, tablet, desktop
7. **Local Storage** - Offline persistence
8. **Edit/Delete Projects** - Full CRUD operations
9. **Beautiful UI** - Gradients, animations, modern design
10. **Type Safety** - Full TypeScript support

---

## 📦 Total Dependencies

**Production:**
- react (19.1.0)
- react-dom (19.1.0)
- next (15.5.4)
- googleapis (latest)
- @dnd-kit/core (latest)
- @dnd-kit/sortable (latest)
- @dnd-kit/utilities (latest)

**Development:**
- typescript (^5)
- @types/node (^20)
- @types/react (^19)
- @types/react-dom (^19)
- @tailwindcss/postcss (^4)
- tailwindcss (^4)
- eslint (^9)
- eslint-config-next (15.5.4)
- @eslint/eslintrc (^3)

**Total:** 428 packages (including dependencies)

---

## 🎨 Color Palette

**Gradients:**
- Primary: `from-blue-400 via-purple-400 to-pink-400`
- Background: `from-slate-900 via-slate-800 to-slate-900`
- Cards: `from-slate-800/50 to-slate-900/50`

**Accent Colors:**
- Blue: `blue-300` to `blue-600`
- Red: `red-300` to `red-500`
- Slate: `slate-200` to `slate-900`

---

## 💾 Storage Limits

- **localStorage**: ~5-10MB (browser dependent)
- **Image uploads**: Max 500KB per image
- **Total images**: Up to 5 per project
- **Projects**: Limited by localStorage quota

---

## 🔒 Security Features

- Environment variables for sensitive data
- Service account authentication (Google)
- Admin password protection
- Session expiry (24 hours)
- No server-side user data storage

---

## 📱 Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES2017+ required
- localStorage required
- File API required (for image uploads)

---

**Last Updated:** January 2025
**Version:** 1.0.0
**Author:** Dave Quillman "Q"
