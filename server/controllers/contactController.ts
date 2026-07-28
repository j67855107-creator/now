import { Request, Response } from "express";
import { addSubmission, type SupportSubmission } from "../services/statsService";
import { sendContactEmail } from "../services/emailService";

function sanitizeInput(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

export async function handleContactForm(req: Request, res: Response) {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        error: "All fields (Full Name, Email, Subject, and Message) are required."
      });
    }

    const trimmedName = String(name).trim();
    const trimmedEmail = String(email).trim();
    const trimmedSubject = String(subject).trim();
    const trimmedMessage = String(message).trim();

    if (!trimmedName || !trimmedEmail || !trimmedSubject || !trimmedMessage) {
      return res.status(400).json({
        error: "Fields cannot contain only whitespaces."
      });
    }

    if (trimmedName.length > 100) {
      return res.status(400).json({ error: "Full Name must be 100 characters or less." });
    }
    if (trimmedEmail.length > 150) {
      return res.status(400).json({ error: "Email Address must be 150 characters or less." });
    }
    if (trimmedSubject.length > 150) {
      return res.status(400).json({ error: "Subject must be 150 characters or less." });
    }
    if (trimmedMessage.length > 5000) {
      return res.status(400).json({ error: "Message details must be 5000 characters or less." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({ error: "Please provide a valid email address." });
    }

    const sanitizedName = sanitizeInput(trimmedName);
    const sanitizedEmail = sanitizeInput(trimmedEmail);
    const sanitizedSubject = sanitizeInput(trimmedSubject);
    const sanitizedMessage = sanitizeInput(trimmedMessage);

    const timestamp = new Date().toISOString();
    const rawIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || req.ip || "Unknown";
    const ip = Array.isArray(rawIp) ? rawIp[0] : String(rawIp).split(",")[0].trim();

    const newSub: SupportSubmission = {
      id: `msg-${Date.now()}`,
      name: sanitizedName,
      email: sanitizedEmail,
      subject: sanitizedSubject,
      message: sanitizedMessage,
      timestamp,
      ip
    };

    addSubmission(newSub);

    // Call email sender service
    await sendContactEmail({
      name: sanitizedName,
      email: sanitizedEmail,
      subject: sanitizedSubject,
      message: sanitizedMessage,
      timestamp,
      ip
    });

    res.status(200).json({
      success: true,
      message: "Your message has been received and saved successfully."
    });

  } catch (err: any) {
    console.error("Contact form error:", err);
    res.status(500).json({
      error: "An internal server error occurred while sending your support query. Please try again."
    });
  }
}
