# Canvas App Creator

> Full-stack application for creating canvas-based apps with React frontend and Express backend

## 🚀 Quick Start

```bash
# Install dependencies and start both frontend and backend
pnpm run dev:full
```

- **Frontend**: http://localhost:3010
- **Backend**: http://localhost:8010

## 📁 Project Structure

```
canvas-app-creator/
├── frontend/          # React + TypeScript + Vite + TailwindCSS
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── contexts/      # React contexts
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API services
│   │   └── constants/     # Application constants
│   └── package.json
├── backend/           # Express + TypeScript + SQLite
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── services/      # Business logic
│   │   ├── repositories/  # Data access layer
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Express middleware
│   │   ├── database/      # Database configuration
│   │   └── types/         # TypeScript types
│   └── package.json
├── shared/            # Shared types and utilities
└── package.json       # Root package.json with scripts
```

## 🛠️ Development

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm

### Available Scripts

- `pnpm run dev:full` - Start both frontend and backend with auto-restart
- `pnpm run frontend` - Start only frontend development server
- `pnpm run backend` - Start only backend development server

### Individual Development

**Frontend only:**
```bash
cd frontend
pnpm install
pnpm dev
```

**Backend only:**
```bash
cd backend
pnpm install
pnpm dev
```

## 🎨 Features

### Frontend
- ⚡ **Vite** - Fast build tool and dev server
- ⚛️ **React 18** - Modern React with hooks
- 🎨 **TailwindCSS** - Utility-first CSS framework
- 📱 **Responsive Design** - Mobile-first approach
- 🧩 **Component Library** - Reusable UI components
- 🎯 **TypeScript** - Type safety and better DX

### Backend
- 🚀 **Express.js** - Fast, unopinionated web framework
- 📊 **SQLite** - Lightweight database
- 🔒 **CORS** - Cross-origin resource sharing
- 📁 **File Upload** - Multer integration
- 🎯 **TypeScript** - Type safety
- 🔄 **Auto-restart** - Development with tsx watch

### Application Features
- 🎨 **Canvas Creation Wizard** - Step-by-step app creation
- ⚙️ **Project Settings** - Customizable default configurations
- 🎭 **Multiple Themes** - Light/Dark mode support
- 📱 **Responsive Layout** - Works on all devices
- 🔧 **Integration Support** - API and MCP server integrations
- 💾 **Local Storage** - Persistent user preferences

## 🏗️ Architecture

### Frontend Architecture
- **Component-based** - Modular and reusable components
- **Context API** - State management for global data
- **Custom Hooks** - Reusable logic extraction
- **Service Layer** - API communication abstraction

### Backend Architecture
- **Layered Architecture** - Controllers, Services, Repositories
- **Database Layer** - SQLite with better-sqlite3
- **Middleware** - CORS, file upload, error handling
- **Type Safety** - Shared types between frontend and backend

## 🔧 Configuration

### Environment Variables

**Backend (.env):**
```env
PORT=8010
NODE_ENV=development
DATABASE_PATH=./database.db
```

### Port Configuration
- Frontend: **3010** (configured in vite.config.ts)
- Backend: **8010** (configured in .env and index.ts)

## 📦 Dependencies

### Frontend
- React 18 + React DOM
- React Router DOM
- TailwindCSS + PostCSS
- Lucide React (icons)
- Zustand (state management)
- Vite + TypeScript

### Backend
- Express.js
- better-sqlite3
- CORS + Multer
- dotenv + uuid
- TypeScript + tsx

## 🚀 Deployment

### Build for Production

```bash
# Build frontend
cd frontend && pnpm build

# Build backend
cd backend && pnpm build

# Start production server
cd backend && pnpm start
```

### Docker Support (Coming Soon)
- Multi-stage Docker build
- Production-ready containers
- Docker Compose for full stack

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React team for the amazing framework
- Vite team for the blazing fast build tool
- TailwindCSS for the utility-first CSS framework
- Express.js community for the robust backend framework

---

Made with ❤️ by [xploryngDAO](https://github.com/xploryngDAO)