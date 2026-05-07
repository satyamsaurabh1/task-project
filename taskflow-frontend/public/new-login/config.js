/* =====================================================
   TASKFLOW — OAUTH CONFIGURATION
   Replace these with your actual credentials.

   Google:  https://console.cloud.google.com/
   GitHub:  https://github.com/settings/developers
   ===================================================== */

const OAUTH_CONFIG = {
  google: {
    clientId: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
  },
  github: {
    clientId: 'YOUR_GITHUB_CLIENT_ID',
    // Scopes to request from GitHub
    scope: 'read:user user:email',
    // This MUST match your GitHub OAuth App's callback URL setting.
    // For local dev, set it to: http://localhost:3456/oauth-callback.html
    redirectUri: window.location.origin + '/oauth-callback.html',
  },
};
