import type { Express } from "express";
import { authStorage } from "./storage";
import { isAuthenticated } from "./replitAuth";

// Register auth-specific routes
export function registerAuthRoutes(app: Express): void {
  // Public diagnostic - no auth required, shows session state
  // Also repairs missing DB records from session claims
  app.get("/api/auth/session-check", async (req: any, res) => {
    const userId = req.user?.claims?.sub;
    const isAuth = req.isAuthenticated?.() || false;
    let dbUser = null;
    let repaired = false;
    let repairError: string | null = null;
    const claims = req.user?.claims;
    
    if (userId) {
      try {
        dbUser = await authStorage.getUser(userId);
      } catch (e) {}
      
      // If user is authenticated but has no DB record, create one from session claims
      if (!dbUser && isAuth && claims) {
        try {
          console.log(`[SESSION-CHECK] Repairing missing DB record for user ${userId} (${claims.email})`);
          dbUser = await authStorage.upsertUser({
            id: userId,
            email: claims.email || `unknown-${userId}@replit.user`,
            firstName: claims.first_name || 'Unknown',
            lastName: claims.last_name || 'User',
            profileImageUrl: claims.profile_image_url,
          });
          repaired = true;
          console.log(`[SESSION-CHECK] Successfully created DB record for user ${userId}`);
        } catch (upsertErr: any) {
          repairError = upsertErr?.message || String(upsertErr);
          console.error(`[SESSION-CHECK] Failed to repair DB record:`, repairError);
        }
      }
    }
    
    res.json({
      timestamp: new Date().toISOString(),
      hasSession: !!req.session,
      sessionId: req.session?.id?.substring(0, 8) + '...',
      isAuthenticated: isAuth,
      hasUser: !!req.user,
      userId: userId || null,
      hasClaims: !!claims,
      claimsKeys: claims ? Object.keys(claims) : [],
      claimsEmail: claims?.email || null,
      repaired,
      repairError,
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
      let user = await authStorage.getUser(userId);
      
      // If user is authenticated but has no database record, create one from session claims
      // This handles the case where the auth callback's upsert failed silently
      if (!user && userId && req.user.claims) {
        console.log(`[/api/auth/user] User ${userId} authenticated but missing from DB - creating record from session claims`);
        try {
          user = await authStorage.upsertUser({
            id: userId,
            email: req.user.claims.email,
            firstName: req.user.claims.first_name,
            lastName: req.user.claims.last_name,
            profileImageUrl: req.user.claims.profile_image_url,
          });
          console.log(`[/api/auth/user] Created missing user record: ${userId}, email=${user?.email}`);
        } catch (upsertError) {
          console.error(`[/api/auth/user] Failed to create missing user record:`, upsertError);
        }
      }
      
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
