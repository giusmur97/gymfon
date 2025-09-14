import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { PrismaClient } from "@prisma/client";
import session from "express-session";
import passport from "passport";
import { setupPassport } from "./auth/passport";
import authRoutes from "./routes/auth";
import coursesRoutes from "./routes/courses";
import uploadRoutes from "./routes/upload";
import clientsRoutes from "./routes/clients-simple";
import photosRoutes from "./routes/photos-simple";
import gdprRoutes from "./routes/gdpr";
import documentsRoutes from "./routes/documents";
import auditRoutes from "./routes/audit";
import calendarRoutes from "./routes/calendar";
import dashboardRoutes from "./routes/dashboard";

const app = express();
const prisma = new PrismaClient();

app.use(helmet());

// Flexible CORS: allow multiple local origins and configured list
const defaultOrigins = [
  process.env.FRONTEND_ORIGIN ?? "http://localhost:3000",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
];
const configuredOrigins = (process.env.CORS_ORIGINS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const allowedOrigins = Array.from(new Set([...defaultOrigins, ...configuredOrigins]));

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // allow server-to-server or curl
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 204,
  })
);
// Handle preflight requests explicitly for all routes
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    return res.status(204).end();
  }
  next();
});

app.use(express.json());
app.use(morgan("dev"));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));
app.use(
  session({
    secret: process.env.JWT_SECRET ?? "dev",
    resave: false,
    saveUninitialized: false,
  })
);
setupPassport();
app.use(passport.initialize());
app.use(passport.session());

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "gymfonty-api", time: new Date().toISOString() });
});

app.use("/auth", authRoutes);
// app.use("/api/courses", coursesRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/clients", clientsRoutes);
app.use("/api/photos", photosRoutes);
// app.use("/api/gdpr", gdprRoutes);
app.use("/api/documents", documentsRoutes);
// app.use("/api/audit", auditRoutes);
// app.use("/api/calendar", calendarRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/api/products", async (_req, res) => {
  // Mock data for development - replace with database call when ready
  const products = [
    {
      id: "1",
      name: "Proteine Whey",
      description: "Proteine del siero del latte di alta qualità",
      price: 29.99,
      category: "Integratori",
      createdAt: new Date()
    },
    {
      id: "2",
      name: "Creatina Monoidrato",
      description: "Creatina pura per prestazioni ottimali",
      price: 19.99,
      category: "Integratori",
      createdAt: new Date()
    }
  ];
  res.json(products);
});

app.get("/api/services", async (_req, res) => {
  // Mock data for development - replace with database call when ready
  const services = [
    {
      id: "1",
      title: "Personal Training",
      shortDesc: "Allenamento personalizzato one-to-one",
      priceOptions: { basic: { price: 50 } },
      createdAt: new Date()
    },
    {
      id: "2", 
      title: "Consulenza Nutrizionale",
      shortDesc: "Piano alimentare personalizzato",
      priceOptions: { basic: { price: 80 } },
      createdAt: new Date()
    },
    {
      id: "3",
      title: "Workout di Gruppo",
      shortDesc: "Allenamenti in piccoli gruppi",
      priceOptions: { basic: { price: 25 } },
      createdAt: new Date()
    }
  ];
  res.json(services);
});

app.get("/api/events", async (_req, res) => {
  // Mock data for development - replace with database call when ready
  const events = [
    {
      id: "1",
      title: "Workshop Nutrizione",
      description: "Impara i fondamenti della nutrizione sportiva",
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
      location: "Gym Fonty",
      maxParticipants: 20
    },
    {
      id: "2",
      title: "Competizione Crossfit",
      description: "Gara amichevole di crossfit",
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // In 2 weeks
      location: "Gym Fonty",
      maxParticipants: 50
    }
  ];
  res.json(events);
});

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => {
  console.log(`Gym Fonty API listening on http://localhost:${port}`);
});


