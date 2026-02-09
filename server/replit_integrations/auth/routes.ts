import type { Express } from "express";
import { authStorage } from "./storage";
import { isAuthenticated } from "./replitAuth";

// Register auth-specific routes
export function registerAuthRoutes(app: Express): void {
  // Public diagnostic - no auth required, shows session state
  app.get("/api/auth/session-check", async (req: any, res) => {
    const userId = req.user?.claims?.sub;
    const isAuth = req.isAuthenticated?.() || false;
    let dbUser = null;
    
    if (userId) {
      try {
        dbUser = await authStorage.getUser(userId);
      } catch (e) {}
    }
    
    res.json({
      timestamp: new Date().toISOString(),
      hasSession: !!req.session,
      sessionId: req.session?.id?.substring(0, 8) + '...',
      isAuthenticated: isAuth,
      hasUser: !!req.user,
      userId: userId || null,
      dbUser: dbUser ? {
        id: dbUser.id,
        email: dbUser.email,
        isAdmin: dbUser.isAdmin,
        teamId: dbUser.teamId,
      } : null,
      cookies: Object.keys(req.cookies || {}),
      hostname: req.hostname,
    });
  });

  // Diagnostic endpoint - shows what the server sees for debugging
  app.get("/api/auth/debug", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub;
      const dbUser = await authStorage.getUser(userId);
      
      res.json({
        timestamp: new Date().toISOString(),
        sessionUserId: userId,
        dbUser: dbUser ? {
          id: dbUser.id,
          email: dbUser.email,
          isAdmin: dbUser.isAdmin,
          isAdminType: typeof dbUser.isAdmin,
          teamId: dbUser.teamId,
        } : null,
        adminCheck: {
          equalsTrue: (dbUser?.isAdmin as unknown) === true,
          equalsStringTrue: dbUser?.isAdmin === 'true',
          equalsSuperAdmin: dbUser?.isAdmin === 'super_admin',
          wouldRedirectToAdmin: (dbUser?.isAdmin as unknown) === true || dbUser?.isAdmin === 'true' || dbUser?.isAdmin === 'super_admin',
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get current authenticated user
  // Uses session-stored user (populated at login) with fresh database fallback
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub;
      
      // Always fetch FRESH data from database to ensure latest isAdmin/teamId
      // This is critical because admin status might change between logins
      const user = await authStorage.getUser(userId);
      
      // Update the session with fresh data for subsequent requests
      if (user) {
        req.user.dbUser = user;
      }
      
      // Debug logging for production troubleshooting
      console.log(`[/api/auth/user] userId=${userId}, isAdmin=${user?.isAdmin}, teamId=${user?.teamId}`);
      
      // Prevent any HTTP caching of user data
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      res.set('Surrogate-Control', 'no-store');
      
      const sessionPreview = (req.session as any)?.preview;
      const hasSessionPreview = sessionPreview?.role != null;
      const userResponse = user ? {
        ...user,
        previewRole: hasSessionPreview ? sessionPreview.role : (user.previewRole || null),
        previewOrgId: hasSessionPreview ? sessionPreview.orgId : (user.previewOrgId || null),
        inStudentPreview: hasSessionPreview 
          ? sessionPreview.role === "student" 
          : (user.inStudentPreview || false),
        previewModeOrgId: hasSessionPreview 
          ? (sessionPreview.role === "student" ? sessionPreview.orgId : null)
          : (user.previewModeOrgId || null),
        inInstructorPreview: hasSessionPreview 
          ? sessionPreview.role === "educator" 
          : (user.inInstructorPreview || false),
        instructorPreviewOrgId: hasSessionPreview 
          ? (sessionPreview.role === "educator" ? sessionPreview.orgId : null)
          : (user.instructorPreviewOrgId || null),
        inDemoPreview: hasSessionPreview 
          ? sessionPreview.role === "demo" 
          : (user.inDemoPreview || false),
        demoPreviewOrgId: hasSessionPreview 
          ? (sessionPreview.role === "demo" ? sessionPreview.orgId : null)
          : (user.demoPreviewOrgId || null),
      } : user;
      res.json(userResponse);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
}
