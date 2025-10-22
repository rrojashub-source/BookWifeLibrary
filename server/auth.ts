// Reference: javascript_auth_all_persistance blueprint
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser, insertUserSchema } from "@shared/schema";
import { z } from "zod";

// Validate SESSION_SECRET at startup
if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET environment variable is required for authentication");
}

// Login-specific schema (only username and password needed)
const loginSchema = insertUserSchema.pick({ username: true, password: true });

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  try {
    const parts = stored.split(".");
    if (parts.length !== 2) {
      // Malformed stored password - reject
      return false;
    }
    const [hashed, salt] = parts;
    if (!hashed || !salt) {
      return false;
    }
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    return timingSafeEqual(hashedBuf, suppliedBuf);
  } catch (error) {
    // Any error in comparison = invalid password
    return false;
  }
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false, { message: "Usuario o contraseña incorrectos" });
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Registration disabled - this is a private application
  app.post("/api/register", async (req, res, next) => {
    return res.status(403).json({ 
      error: "Registro deshabilitado", 
      message: "Esta es una aplicación privada. El registro público está deshabilitado."
    });
    
    /* ORIGINAL REGISTRATION CODE - DISABLED FOR SECURITY
    try {
      // Validate input
      const validation = insertUserSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          error: "Datos de registro inválidos", 
          details: validation.error.errors 
        });
      }

      const { username, password } = validation.data;

      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: "El nombre de usuario ya existe" });
      }

      const user = await storage.createUser({
        username,
        password: await hashPassword(password),
      });

      req.login(user, (err) => {
        if (err) return next(err);
        // Don't send password back to client
        const { password: _, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      next(error);
    }
    */
  });

  app.post("/api/login", (req, res, next) => {
    // Validate input
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        error: "Datos de login inválidos", 
        details: validation.error.errors 
      });
    }

    passport.authenticate("local", (err: any, user: SelectUser | false, info: any) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ error: "Credenciales incorrectas" });
      }
      
      req.login(user, (err) => {
        if (err) return next(err);
        // Don't send password back to client
        const { password: _, ...userWithoutPassword } = user;
        res.status(200).json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    // Don't send password back to client
    const { password, ...userWithoutPassword } = req.user!;
    res.json(userWithoutPassword);
  });
}
