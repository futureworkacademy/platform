import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { authStorage } from "./storage";

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: true,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: "lax" as const,
      maxAge: sessionTtl,
    },
  });
}

// Session user type - stores both OIDC tokens and complete database user
interface SessionUser {
  // OIDC token data (needed for token refresh)
  claims: any;
  access_token: string;
  refresh_token?: string;
  expires_at: number;
  // Complete database user (includes isAdmin, teamId, etc.)
  dbUser: any;
}

function updateUserSession(
  user: SessionUser,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertAndFetchUser(claims: any): Promise<any> {
  // Build user data from OIDC claims
  const userData: any = {
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  };
  
  // Handle is_admin claim if present (for testing and admin provisioning)
  // This allows OIDC provider to set admin status
  if (claims["is_admin"]) {
    userData.isAdmin = claims["is_admin"];
    console.log(`[AUTH UPSERT] Setting isAdmin from claims: ${claims["is_admin"]}`);
  }
  
  // First upsert the user (creates or updates with OIDC data)
  await authStorage.upsertUser(userData);
  
  // Then fetch the COMPLETE user record from database (includes isAdmin, teamId, etc.)
  const dbUser = await authStorage.getUser(claims["sub"]);
  return dbUser;
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const claims = tokens.claims();
    const user: SessionUser = {} as SessionUser;
    
    // Store OIDC tokens for refresh
    updateUserSession(user, tokens);
    
    // Fetch COMPLETE user from database (includes isAdmin, teamId)
    const dbUser = await upsertAndFetchUser(claims);
    user.dbUser = dbUser;
    
    console.log(`[AUTH VERIFY] User ${claims?.sub}: isAdmin=${dbUser?.isAdmin}, teamId=${dbUser?.teamId}`);
    
    verified(null, user);
  };

  // Keep track of registered strategies
  const registeredStrategies = new Set<string>();

  // Helper function to ensure strategy exists for a domain
  const ensureStrategy = (domain: string) => {
    const strategyName = `replitauth:${domain}`;
    if (!registeredStrategies.has(strategyName)) {
      const strategy = new Strategy(
        {
          name: strategyName,
          config,
          scope: "openid email profile offline_access",
          callbackURL: `https://${domain}/api/callback`,
        },
        verify
      );
      passport.use(strategy);
      registeredStrategies.add(strategyName);
    }
  };

  // Serialize stores complete user (with dbUser) in session
  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    const hostname = req.hostname;
    ensureStrategy(hostname);
    passport.authenticate(`replitauth:${hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    const hostname = req.hostname;
    ensureStrategy(hostname);
    passport.authenticate(`replitauth:${hostname}`, async (err: any, user: SessionUser) => {
      if (err || !user) {
        console.log(`[AUTH CALLBACK] Error or no user, redirecting to login`);
        return res.redirect("/api/login");
      }
      
      req.logIn(user, async (loginErr) => {
        if (loginErr) {
          console.log(`[AUTH CALLBACK] Login error:`, loginErr);
          return res.redirect("/api/login");
        }
        
        // Fetch fresh user data from database to ensure we have latest admin status
        // This is more robust than relying on session-stored dbUser
        const userId = user.claims?.sub;
        let dbUser = user.dbUser;
        
        // If dbUser is missing from session, fetch fresh from database
        if (!dbUser && userId) {
          console.log(`[AUTH CALLBACK] dbUser missing, fetching fresh from database`);
          try {
            dbUser = await authStorage.getUser(userId);
            // Update session with fresh data
            user.dbUser = dbUser;
          } catch (error) {
            console.error(`[AUTH CALLBACK] Error fetching user:`, error);
          }
        }
        
        console.log(`[AUTH CALLBACK] hostname=${hostname}, userId=${dbUser?.id || userId}, isAdmin=${dbUser?.isAdmin}, isAdminType=${typeof dbUser?.isAdmin}`);
        
        // Redirect admins directly to /super-admin
        // Handle both boolean true AND string 'true'/'super_admin' for robustness
        const isAdminValue = dbUser?.isAdmin;
        const isAdmin = isAdminValue === true || isAdminValue === 'true' || isAdminValue === 'super_admin';
        
        if (dbUser && isAdmin) {
          console.log(`[AUTH CALLBACK] Admin detected (isAdmin=${isAdminValue}), redirecting to /super-admin`);
          return res.redirect('/super-admin');
        }
        
        // Default redirect for non-admins or if dbUser is missing
        console.log(`[AUTH CALLBACK] Non-admin or missing dbUser, redirecting to /`);
        return res.redirect('/');
      });
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};
