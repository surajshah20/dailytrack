import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import reflectionRoutes from './routes/reflectionRoutes.js';
import calendarRoutes from './routes/calendarRoutes.js';

const app = express();

app.set('trust proxy', 1);

// Dynamic CORS configuration allowing localhost and any *.vercel.app domain
const allowedOrigins = [
  'http://localhost:5173',
  process.env.CLIENT_URL
].filter(Boolean);

const isAllowedOrigin = (origin) =>
  allowedOrigins.includes(origin) ||
  // your own Vercel deployments only, e.g. dailytrack-abc123-yourname.vercel.app
  /^https:\/\/dailytrack[a-z0-9-]*\.vercel\.app$/.test(origin);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || isAllowedOrigin(origin)) return callback(null, true);
    const err = new Error(`CORS blocked for origin: ${origin}`);
    err.status = 403;
    return callback(err);
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Support both /api/* and /* so missing /api in Vercel never causes a 404
app.use(['/api/auth', '/auth'], authRoutes);
app.use(['/api/categories', '/categories'], categoryRoutes);
app.use(['/api/tasks', '/tasks'], taskRoutes);
app.use(['/api/work-sessions', '/work-sessions'], sessionRoutes);
app.use(['/api/reports', '/reports'], reportRoutes);
app.use(['/api/reflections', '/reflections'], reflectionRoutes);
app.use(['/api/calendar', '/calendar'], calendarRoutes);

app.get(['/api/health', '/health'], (req, res) => {
  res.status(200).json({
    success: true,
    message: 'DailyTrack API is healthy',
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    name: 'DailyTrack API',
    status: 'online'
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  const status = err.status || 500;
  res.status(status).json({ success: false, message: err.message || 'Internal Server Error' });
});

export default app;