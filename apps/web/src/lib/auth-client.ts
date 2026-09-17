import { createAuthClient } from "better-auth/react";

// Only for browser-driven flows (the Google redirect). Everything else goes
// through Server Actions calling `auth.api`.
export const authClient = createAuthClient();
