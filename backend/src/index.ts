import express from 'express';
import cors from 'cors';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { initializeDatabase } from './database/init';
import projectRoutes from './routes/projects';
import settingsRoutes from './routes/settings';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app: express.Application = express();
const PORT = process.env.PORT || 8010;

// Initialize database
initializeDatabase();

// Middleware
app.use(cors({
  origin: ['http://localhost:3010', 'http://127.0.0.1:3010'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/projects', projectRoutes);
app.use('/api/settings', settingsRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;