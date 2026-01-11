import type { Express } from "express";
import { authStorage } from "./storage";
import { isAuthenticated } from "./replitAuth";

// Register auth-specific routes
export function registerAuthRoutes(app: Express): void {
  // Get current authenticated user - ALWAYS fetch fresh from database
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Always fetch fresh user data from database
      const user = await authStorage.getUser(userId);
      
      // Debug logging for production troubleshooting
      console.log(`[AUTH DEBUG] User ${userId}: isAdmin=${user?.isAdmin}, teamId=${user?.teamId}`);
      
      // Prevent any HTTP caching of user data
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      res.set('Surrogate-Control', 'no-store');
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
}
