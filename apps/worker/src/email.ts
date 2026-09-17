//apps/worker/src/email.ts
import { createEmailSender } from "@webpulse/shared";
import { config } from "./config.js";

export const sendEmail = createEmailSender(config.resendKey, config.alertFromEmail);
