"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// server.ts
var server_exports = {};
__export(server_exports, {
  createApp: () => createApp,
  startServer: () => startServer
});
module.exports = __toCommonJS(server_exports);
var import_express2 = __toESM(require("express"), 1);
var import_cors = __toESM(require("cors"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
var import_helmet = __toESM(require("helmet"), 1);
var import_compression = __toESM(require("compression"), 1);
var import_express_rate_limit2 = __toESM(require("express-rate-limit"), 1);

// server/routes/api.ts
var import_express = require("express");

// server/controllers/convertController.ts
var import_mammoth = __toESM(require("mammoth"), 1);
var import_pdf_parse = require("pdf-parse");
var import_turndown = __toESM(require("turndown"), 1);
var import_turndown_plugin_gfm = require("turndown-plugin-gfm");

// server/services/statsService.ts
var stats = {
  totalConversions: 0,
  classicConversions: 0,
  aiConversions: 0,
  totalSizeKb: 0,
  averageDurationMs: 0,
  recentLogs: [],
  contactSubmissions: []
};
var MAX_LOGS = 20;
function getStats() {
  return stats;
}
function addConversionLog(log) {
  const newLog = {
    ...log,
    id: `log-${Date.now()}`,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
  stats.totalConversions++;
  if (newLog.mode === "classic") {
    stats.classicConversions++;
  } else {
    stats.aiConversions++;
  }
  stats.totalSizeKb += newLog.fileSizeKb;
  const totalDuration = stats.averageDurationMs * (stats.totalConversions - 1) + newLog.durationMs;
  stats.averageDurationMs = Math.round(totalDuration / stats.totalConversions);
  stats.recentLogs.unshift(newLog);
  if (stats.recentLogs.length > MAX_LOGS) {
    stats.recentLogs.pop();
  }
  console.log(`[Stats Service] Log added for ${newLog.fileName}. Total conversions: ${stats.totalConversions}`);
}
function addSubmission(submission) {
  if (!stats.contactSubmissions) {
    stats.contactSubmissions = [];
  }
  stats.contactSubmissions.unshift(submission);
  console.log(`[Stats Service] Contact submission from ${submission.name} added.`);
}

// server/controllers/convertController.ts
var turndownService = new import_turndown.default({
  headingStyle: "atx",
  codeBlockStyle: "fenced"
});
turndownService.use(import_turndown_plugin_gfm.gfm);
var MAX_FILE_SIZE_MB = 50;
var MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
async function handleConversion(req, res) {
  const startTime = Date.now();
  try {
    const { fileData, fileName, mimeType, mode } = req.body;
    if (!fileData || !fileName || !mimeType) {
      return res.status(400).json({ error: "Missing file data, name, or type." });
    }
    const buffer = Buffer.from(fileData, "base64");
    if (buffer.length > MAX_FILE_SIZE_BYTES) {
      return res.status(400).json({ error: `File size exceeds the ${MAX_FILE_SIZE_MB}MB limit.` });
    }
    let markdown = "";
    let warning = void 0;
    if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || fileName.endsWith(".docx")) {
      const { value: html } = await import_mammoth.default.convertToHtml({ buffer });
      markdown = turndownService.turndown(html);
    } else if (mimeType === "application/pdf" || fileName.endsWith(".pdf")) {
      const parser = new import_pdf_parse.PDFParse({ data: new Uint8Array(buffer) });
      try {
        const result = await parser.getText();
        markdown = result.text;
        if (result.total > 20) {
          warning = `PDF has ${result.total} pages. Parsing may be imperfect for complex layouts.`;
        }
      } finally {
        await parser.destroy();
      }
    } else {
      return res.status(400).json({ error: "Unsupported file type." });
    }
    const durationMs = Date.now() - startTime;
    const fileSizeKb = Math.round(buffer.length / 1024);
    const fileExt = fileName.split(".").pop() || "";
    addConversionLog({
      fileName,
      fileSizeKb,
      mode: mode || "classic",
      fileExt,
      durationMs,
      status: "success"
    });
    res.status(200).json({
      success: true,
      markdown,
      modeUsed: mode || "classic",
      durationMs,
      warning
    });
  } catch (error) {
    const durationMs = Date.now() - startTime;
    const { fileName, fileData } = req.body;
    const fileExt = fileName ? fileName.split(".").pop() || "" : "unknown";
    const fileSizeKb = fileData ? Math.round(Buffer.from(fileData, "base64").length / 1024) : 0;
    addConversionLog({
      fileName: fileName || "unknown",
      fileSizeKb,
      fileExt,
      mode: req.body.mode || "classic",
      durationMs,
      status: "failed"
    });
    console.error("[Conversion Error]", error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    let errorMessage = "An unexpected error occurred during conversion.";
    if (errorMsg.includes("Invalid file signature")) {
      errorMessage = "File is corrupted or not a valid document format.";
    } else if (errorMsg.includes("timeout")) {
      errorMessage = "Conversion timed out. The document may be too complex.";
    }
    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
}

// server/services/emailService.ts
var import_nodemailer = __toESM(require("nodemailer"), 1);
async function sendContactEmail(details) {
  const { name, email, subject, message, timestamp, ip } = details;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpHost = process.env.SMTP_HOST || "smtp.mail.yahoo.com";
  const smtpPort = parseInt(process.env.SMTP_PORT || "587");
  const isSecure = process.env.SMTP_SECURE === "true" || smtpPort === 465;
  if (smtpUser && smtpPass) {
    const transporter = import_nodemailer.default.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: isSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });
    const emailText = `New Contact Form Submission:
--------------------------------------------
Submitted On: ${new Date(timestamp).toLocaleString()}
Sender IP Address: ${ip}

Full Name: ${name}
Email Address: ${email}
Subject: ${subject}

Message Details:
--------------------------------------------
${message}
`;
    const emailHtml = `
<div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);">
  <div style="background-color: #4f46e5; color: #ffffff; padding: 24px; text-align: center;">
    <h2 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.025em;">Contact Submission</h2>
    <p style="margin: 4px 0 0 0; font-size: 13px; color: #e0e7ff;">Received from ConvertOneAI Contact Form</p>
  </div>
  <div style="padding: 24px; background-color: #ffffff;">
    <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
      <tr>
        <td style="padding: 8px 0; color: #64748b; font-weight: 600; width: 120px; border-bottom: 1px solid #f1f5f9;">Submitted On</td>
        <td style="padding: 8px 0; color: #0f172a; border-bottom: 1px solid #f1f5f9;">${new Date(timestamp).toLocaleString()}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #64748b; font-weight: 600; border-bottom: 1px solid #f1f5f9;">IP Address</td>
        <td style="padding: 8px 0; color: #0f172a; font-family: monospace; font-size: 13px; border-bottom: 1px solid #f1f5f9;">${ip}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #64748b; font-weight: 600; border-bottom: 1px solid #f1f5f9;">Full Name</td>
        <td style="padding: 8px 0; color: #0f172a; font-weight: 600; border-bottom: 1px solid #f1f5f9;">${name}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #64748b; font-weight: 600; border-bottom: 1px solid #f1f5f9;">Email Address</td>
        <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;"><a href="mailto:${email}" style="color: #4f46e5; text-decoration: none; font-weight: 500;">${email}</a></td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #64748b; font-weight: 600; border-bottom: 1px solid #f1f5f9;">Subject</td>
        <td style="padding: 8px 0; color: #0f172a; font-weight: 600; border-bottom: 1px solid #f1f5f9;">${subject}</td>
      </tr>
    </table>
    
    <div style="margin-top: 24px;">
      <h3 style="margin: 0 0 10px 0; font-size: 14px; font-weight: 700; color: #64748b; uppercase; letter-spacing: 0.05em;">Message Body</h3>
      <div style="background-color: #f8fafc; border-left: 4px solid #4f46e5; padding: 18px; border-radius: 0 8px 8px 0; font-style: italic; white-space: pre-wrap; font-size: 14px; color: #334155;">${message}</div>
    </div>
  </div>
  <div style="background-color: #f1f5f9; color: #64748b; padding: 16px; text-align: center; font-size: 12px; border-top: 1px solid #e2e8f0;">
    This is an automated transmission from the <strong>ConvertOneAI Contact Engine</strong>.
  </div>
</div>
`;
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || smtpUser,
      to: process.env.EMAIL_TO,
      subject: `[Contact Support] ${subject}`,
      text: emailText,
      html: emailHtml
    });
    console.log(`[Email Success] Email successfully sent to boutarradafathallah@yahoo.com for subject: ${subject}`);
    return true;
  } else {
    console.warn(`[SMTP Warn] SMTP_USER or SMTP_PASS not specified. Message simulation activated. Here are the submission details:`);
    console.log(`-- Simulated Contact Delivery --`);
    console.log(`To: ${process.env.EMAIL_TO}`);
    console.log(`From: ${name} <${email}>`);
    console.log(`Subject: ${subject}`);
    console.log(`Date: ${timestamp} | IP: ${ip}`);
    console.log(`Message: ${message}`);
    console.log(`---------------------------------`);
    return false;
  }
}

// server/controllers/contactController.ts
function sanitizeInput(str) {
  if (!str) return "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;").replace(/\//g, "&#x2F;");
}
async function handleContactForm(req, res) {
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
    if (trimmedMessage.length > 5e3) {
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
    const timestamp = (/* @__PURE__ */ new Date()).toISOString();
    const rawIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || req.ip || "Unknown";
    const ip = Array.isArray(rawIp) ? rawIp[0] : String(rawIp).split(",")[0].trim();
    const newSub = {
      id: `msg-${Date.now()}`,
      name: sanitizedName,
      email: sanitizedEmail,
      subject: sanitizedSubject,
      message: sanitizedMessage,
      timestamp,
      ip
    };
    addSubmission(newSub);
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
  } catch (err) {
    console.error("Contact form error:", err);
    res.status(500).json({
      error: "An internal server error occurred while sending your support query. Please try again."
    });
  }
}

// server/middleware/authMiddleware.ts
function requireApiKey(req, res, next) {
  const allowedKey = process.env.API_PROTECTION_KEY || "WN3FBAF2GYF";
  const apiKey = req.headers["x-api-key"] || req.query.api_key;
  if (apiKey === allowedKey) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized: Invalid API Key" });
  }
}

// server/middleware/adminAuth.ts
var import_jsonwebtoken = __toESM(require("jsonwebtoken"), 1);
var import_bcryptjs = __toESM(require("bcryptjs"), 1);
async function handleAdminLogin(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required." });
    }
    const trimmedUsername = String(username).trim();
    const trimmedPassword = String(password).trim();
    if (!trimmedUsername || !trimmedPassword) {
      return res.status(400).json({ error: "Username and password cannot be empty." });
    }
    const adminUsername = process.env.ADMIN_USERNAME || "admin";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    const jwtSecret = process.env.JWT_SECRET || "convertoneai-jwt-secret-change-in-production-k8x9m2v4";
    const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "24h";
    if (trimmedUsername !== adminUsername) {
      console.warn(`[Admin Auth] Failed login attempt for username: ${trimmedUsername}`);
      return res.status(401).json({ error: "Invalid credentials." });
    }
    let passwordValid = false;
    if (adminPassword.startsWith("$2a$") || adminPassword.startsWith("$2b$") || adminPassword.startsWith("$2y$")) {
      passwordValid = await import_bcryptjs.default.compare(trimmedPassword, adminPassword);
    } else {
      passwordValid = trimmedPassword === adminPassword;
    }
    if (!passwordValid) {
      console.warn(`[Admin Auth] Failed login attempt (wrong password) for username: ${trimmedUsername}`);
      return res.status(401).json({ error: "Invalid credentials." });
    }
    const token = import_jsonwebtoken.default.sign(
      { username: adminUsername, role: "admin" },
      jwtSecret,
      { expiresIn: jwtExpiresIn }
    );
    console.log(`[Admin Auth] Successful login for admin user: ${adminUsername}`);
    res.json({
      success: true,
      token,
      message: "Authentication successful."
    });
  } catch (error) {
    console.error("[Admin Auth] Login error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
}
function requireAdminAuth(req, res, next) {
  const jwtSecret = process.env.JWT_SECRET || "convertoneai-jwt-secret-change-in-production-k8x9m2v4";
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Unauthorized: No authorization header provided." });
  }
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ error: "Unauthorized: Invalid authorization format. Use: Bearer <token>" });
  }
  const token = parts[1];
  try {
    const decoded = import_jsonwebtoken.default.verify(token, jwtSecret);
    if (decoded.role !== "admin") {
      return res.status(403).json({ error: "Forbidden: Insufficient privileges." });
    }
    req.admin = { username: decoded.username, role: decoded.role };
    next();
  } catch (error) {
    if (error instanceof import_jsonwebtoken.default.TokenExpiredError) {
      return res.status(401).json({ error: "Unauthorized: Token has expired." });
    }
    if (error instanceof import_jsonwebtoken.default.JsonWebTokenError) {
      return res.status(401).json({ error: "Unauthorized: Invalid token." });
    }
    return res.status(401).json({ error: "Unauthorized: Authentication failed." });
  }
}

// server/services/DocumentCleanerService.ts
var DEFAULT_CLEANER_OPTIONS = {
  removeHeaders: true,
  removeFooters: true,
  removePageNumbers: true,
  removeDuplicates: true,
  mergeParagraphs: true,
  normalizeWhitespace: true,
  improveHeadings: true,
  preserveTables: true
};
var DocumentCleanerService = class {
  /**
   * Clean a Markdown document for AI consumption.
   * @param markdown - The raw Markdown content
   * @param options - Cleaning options (defaults to all enabled)
   * @returns The cleaned Markdown
   */
  static clean(markdown, options = {}) {
    const opts = { ...DEFAULT_CLEANER_OPTIONS, ...options };
    let result = markdown;
    if (opts.removeHeaders) result = this.removeRepeatedHeaders(result);
    if (opts.removeFooters) result = this.removeRepeatedFooters(result);
    if (opts.removePageNumbers) result = this.removePageNumbers(result);
    if (opts.removeDuplicates) result = this.removeDuplicatedLines(result);
    if (opts.mergeParagraphs) result = this.mergeBrokenParagraphs(result);
    if (opts.normalizeWhitespace) result = this.normalizeWhitespace(result);
    if (opts.improveHeadings) result = this.improveHeadingHierarchy(result);
    return result;
  }
  /**
   * Remove repeated headers that appear at the top of each page.
   * Pattern: Same text appearing frequently at line beginnings.
   */
  static removeRepeatedHeaders(markdown) {
    const lines = markdown.split("\n");
    const lineFrequency = /* @__PURE__ */ new Map();
    const threshold = Math.max(3, Math.floor(lines.length * 0.05));
    let sectionCount = 0;
    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trim();
      if (trimmed === "") continue;
      if (trimmed.length < 60 && !trimmed.match(/[.!?]$/) && trimmed !== trimmed.toUpperCase()) {
        lineFrequency.set(trimmed, (lineFrequency.get(trimmed) || 0) + 1);
      }
      if (trimmed.startsWith("#") || trimmed.startsWith("---")) {
        sectionCount = 0;
      }
    }
    const frequentLines = /* @__PURE__ */ new Set();
    lineFrequency.forEach((count, line) => {
      if (count >= threshold) {
        frequentLines.add(line);
      }
    });
    const seen = /* @__PURE__ */ new Set();
    return lines.filter((line) => {
      const trimmed = line.trim();
      if (frequentLines.has(trimmed)) {
        if (seen.has(trimmed)) return false;
        seen.add(trimmed);
      }
      return true;
    }).join("\n");
  }
  /**
   * Remove repeated footers at the bottom of pages.
   * Pattern: Same text appearing repeatedly at end of sections.
   */
  static removeRepeatedFooters(markdown) {
    const lines = markdown.split("\n");
    const reversedLines = [...lines].reverse();
    const lineFrequency = /* @__PURE__ */ new Map();
    const threshold = Math.max(2, Math.floor(lines.length * 0.03));
    for (let i = 0; i < reversedLines.length; i++) {
      const trimmed = reversedLines[i].trim();
      if (!trimmed || trimmed.length > 80) continue;
      if (trimmed.match(/page\s*\d+/i) || trimmed.match(/^\d+$/) || trimmed.match(/^\s*-\s*\d+\s*-\s*$/)) continue;
      lineFrequency.set(trimmed, (lineFrequency.get(trimmed) || 0) + 1);
    }
    const frequentLines = /* @__PURE__ */ new Set();
    lineFrequency.forEach((count, line) => {
      if (count >= threshold) {
        frequentLines.add(line);
      }
    });
    const seen = /* @__PURE__ */ new Set();
    return lines.reverse().filter((line) => {
      const trimmed = line.trim();
      if (frequentLines.has(trimmed)) {
        if (seen.has(trimmed)) return false;
        seen.add(trimmed);
      }
      return true;
    }).reverse().join("\n");
  }
  /**
   * Remove page numbers (patterns like "Page 1", "- 1 -", "1", etc.)
   */
  static removePageNumbers(markdown) {
    const lines = markdown.split("\n");
    return lines.filter((line) => {
      const trimmed = line.trim();
      if (/^page\s+\d+(\s+of\s+\d+)?$/i.test(trimmed)) return false;
      if (/^[-—]\s*\d+\s*[-—]$/.test(trimmed)) return false;
      if (/^\|\s*\d+\s*\|$/.test(trimmed)) return false;
      if (/^\{[\s]*\d+[\s]*\}$/.test(trimmed)) return false;
      if (/^\d{1,3}$/.test(trimmed) && !line.match(/^\s/)) return false;
      if (/^\s+\d{1,3}\s+$/.test(line)) return false;
      return true;
    }).join("\n");
  }
  /**
   * Remove exact duplicate lines (consecutive or near-consecutive).
   */
  static removeDuplicatedLines(markdown) {
    const lines = markdown.split("\n");
    const result = [];
    const recentLines = [];
    const windowSize = 3;
    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trim();
      if (!trimmed && result.length > 0 && result[result.length - 1].trim() === "") {
        continue;
      }
      const isDuplicate = recentLines.some(
        (recent) => recent === trimmed || trimmed.length > 20 && this.similarity(recent, trimmed) > 0.85
      );
      if (isDuplicate) {
        continue;
      }
      result.push(lines[i]);
      recentLines.push(trimmed);
      if (recentLines.length > windowSize) {
        recentLines.shift();
      }
    }
    return result.join("\n");
  }
  /**
   * Merge broken paragraphs (lines that end without period and next line starts with lowercase).
   */
  static mergeBrokenParagraphs(markdown) {
    const lines = markdown.split("\n");
    const result = [];
    for (let i = 0; i < lines.length; i++) {
      const current = lines[i];
      const trimmed = current.trim();
      if (trimmed.startsWith("```") || trimmed.startsWith("|")) {
        result.push(current);
        continue;
      }
      if (i + 1 < lines.length) {
        const next = lines[i + 1];
        const nextTrimmed = next.trim();
        if (trimmed && !trimmed.match(/[.!?]$/) && nextTrimmed && nextTrimmed[0] === nextTrimmed[0].toLowerCase() && !nextTrimmed.startsWith("#") && !nextTrimmed.startsWith("-") && !nextTrimmed.startsWith("*") && !nextTrimmed.startsWith(">") && !nextTrimmed.startsWith("```") && !nextTrimmed.startsWith("|") && !nextTrimmed.match(/^\d+\./)) {
          result.push(trimmed + " " + nextTrimmed);
          i++;
          continue;
        }
      }
      result.push(current);
    }
    return result.join("\n");
  }
  /**
   * Normalize whitespace (remove extra blank lines, trailing spaces, etc.)
   */
  static normalizeWhitespace(markdown) {
    let result = markdown;
    result = result.replace(/[ \t]+$/gm, "");
    result = result.replace(/\n{3,}/g, "\n\n");
    result = result.replace(/\n*$/, "\n");
    result = result.replace(/^\n+/, "");
    return result;
  }
  /**
   * Improve heading hierarchy (ensure no gaps like H1 → H3, fix H1 count to 1).
   */
  static improveHeadingHierarchy(markdown) {
    const lines = markdown.split("\n");
    const result = [];
    let hasH1 = false;
    let maxLevel = 0;
    for (const line of lines) {
      const match = line.match(/^(#{1,6})\s/);
      if (match) {
        const level = match[1].length;
        if (level === 1) hasH1 = true;
      }
    }
    for (const line of lines) {
      const match = line.match(/^(#{1,6})\s/);
      if (!match) {
        result.push(line);
        continue;
      }
      let level = match[1].length;
      if (!hasH1 && level === 2) {
        level = 1;
        hasH1 = true;
      }
      if (level > maxLevel + 1 && maxLevel > 0) {
        level = maxLevel + 1;
      }
      maxLevel = Math.max(maxLevel, level);
      const hashes = "#".repeat(level);
      result.push(hashes + line.substring(match[1].length));
    }
    return result.join("\n");
  }
  /**
   * Calculate string similarity (Levenshtein-based) for duplicate detection.
   */
  static similarity(a, b) {
    if (a === b) return 1;
    if (a.length < 2 || b.length < 2) return 0;
    const len = Math.max(a.length, b.length);
    const distance = this.levenshteinDistance(a, b);
    return 1 - distance / len;
  }
  /**
   * Calculate Levenshtein distance between two strings.
   */
  static levenshteinDistance(a, b) {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }
};

// src/ai/registries/DocumentTypeRegistry.ts
var DocumentTypeRegistry = class {
  static {
    this.types = /* @__PURE__ */ new Map();
  }
  /**
   * Initialize built-in document types.
   */
  static initialize() {
    const builtIn = [
      {
        type: "book",
        name: "Book",
        icon: "BookOpen",
        color: "text-amber-600",
        description: "Full-length book or publication",
        keywords: [
          "chapter",
          "part",
          "introduction",
          "preface",
          "foreword",
          "bibliography",
          "index",
          "appendix",
          "publishing",
          "edition",
          "acknowledgments",
          "prologue",
          "epilogue"
        ],
        recommendations: [
          "Use AI Cleaner to remove chapter headers/footers for cleaner output",
          "Generate study notes for each chapter",
          "Extract table of contents as structured data"
        ]
      },
      {
        type: "research-paper",
        name: "Research Paper",
        icon: "Search",
        color: "text-blue-600",
        description: "Academic research paper or article",
        keywords: [
          "abstract",
          "methodology",
          "results",
          "discussion",
          "conclusion",
          "references",
          "doi",
          "introduction",
          "literature review",
          "experiment",
          "hypothesis",
          "peer review"
        ],
        recommendations: [
          "Generate a research brief for quick understanding",
          "Extract methodology and findings as structured data",
          "Create flashcards for key findings"
        ]
      },
      {
        type: "resume",
        name: "Resume / CV",
        icon: "User",
        color: "text-green-600",
        description: "Resume, CV, or professional profile",
        keywords: [
          "experience",
          "education",
          "skills",
          "summary",
          "objective",
          "employment",
          "qualifications",
          "certifications",
          "projects",
          "achievements",
          "professional"
        ],
        recommendations: [
          "Generate a cover letter from this resume",
          "Extract skills as structured JSON for job matching",
          "Create interview questions based on experience"
        ]
      },
      {
        type: "contract",
        name: "Contract",
        icon: "FileText",
        color: "text-red-600",
        description: "Legal agreement or contract",
        keywords: [
          "agreement",
          "terms",
          "conditions",
          "party",
          "hereby",
          "whereas",
          "indemnification",
          "governing law",
          "effective date",
          "confidentiality",
          "termination",
          "liability"
        ],
        recommendations: [
          "Extract key clauses and obligations",
          "Highlight important dates and deadlines",
          "Generate a plain-language summary for non-legal team members"
        ]
      },
      {
        type: "invoice",
        name: "Invoice",
        icon: "Receipt",
        color: "text-purple-600",
        description: "Invoice or billing document",
        keywords: [
          "invoice",
          "payment",
          "due date",
          "total",
          "subtotal",
          "tax",
          "bill to",
          "invoice number",
          "amount due",
          "balance",
          "payment terms"
        ],
        recommendations: [
          "Extract invoice data as structured JSON",
          "Generate a payment reminder prompt",
          "Export as structured data for accounting"
        ]
      },
      {
        type: "educational",
        name: "Educational Material",
        icon: "GraduationCap",
        color: "text-cyan-600",
        description: "Course material, lesson plan, or educational content",
        keywords: [
          "lesson",
          "module",
          "course",
          "learning objectives",
          "assignment",
          "quiz",
          "exam",
          "grade",
          "curriculum",
          "syllabus",
          "lecture",
          "tutorial"
        ],
        recommendations: [
          "Generate study notes for students",
          "Create quiz questions from material",
          "Extract key concepts as flashcards"
        ]
      },
      {
        type: "manual",
        name: "Manual / Guide",
        icon: "Book",
        color: "text-orange-600",
        description: "User manual, installation guide, or documentation",
        keywords: [
          "installation",
          "setup",
          "configuration",
          "user guide",
          "troubleshooting",
          "instructions",
          "warning",
          "caution",
          "step",
          "procedure",
          "maintenance"
        ],
        recommendations: [
          "Generate a quick-start guide from the manual",
          "Create troubleshooting FAQ",
          "Extract step-by-step procedures"
        ]
      },
      {
        type: "report",
        name: "Report",
        icon: "BarChart",
        color: "text-indigo-600",
        description: "Business report, analysis, or summary",
        keywords: [
          "executive summary",
          "findings",
          "analysis",
          "recommendations",
          "overview",
          "quarterly",
          "annual",
          "metrics",
          "kpi",
          "performance",
          "review",
          "forecast"
        ],
        recommendations: [
          "Generate an executive summary for stakeholders",
          "Extract key metrics as structured data",
          "Create a presentation outline from findings"
        ]
      },
      {
        type: "unknown",
        name: "General Document",
        icon: "File",
        color: "text-gray-600",
        description: "General or unrecognized document type",
        keywords: [],
        recommendations: [
          "Try AI Cleaner to improve document structure",
          "Generate a summary for quick understanding",
          "Export as Markdown for further processing"
        ]
      }
    ];
    builtIn.forEach((dt) => this.types.set(dt.type, dt));
  }
  /**
   * Register a new document type.
   */
  static register(config) {
    this.types.set(config.type, config);
  }
  /**
   * Get document type configuration.
   */
  static get(type) {
    return this.types.get(type);
  }
  /**
   * Get all registered types.
   */
  static getAll() {
    return Array.from(this.types.values());
  }
  /**
   * Detect document type from text content.
   * Uses keyword frequency scoring.
   * @param text - The document text content
   * @param title - Optional document title for additional context
   */
  static detect(text, title) {
    const textLower = text.toLowerCase();
    const titleLower = (title || "").toLowerCase();
    const scores = /* @__PURE__ */ new Map();
    this.types.forEach((config, type) => {
      if (type === "unknown") return;
      let score = 0;
      config.keywords.forEach((keyword) => {
        const regex = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
        const matches = textLower.match(regex);
        if (matches) {
          score += matches.length;
        }
      });
      config.keywords.forEach((keyword) => {
        if (titleLower.includes(keyword)) {
          score += 3;
        }
      });
      const headText = textLower.substring(0, 500);
      config.keywords.forEach((keyword) => {
        if (headText.includes(keyword)) {
          score += 2;
        }
      });
      scores.set(type, score);
    });
    let bestType = "unknown";
    let bestScore = 0;
    scores.forEach((score, type) => {
      if (score > bestScore) {
        bestScore = score;
        bestType = type;
      }
    });
    const maxPossibleScore = 50;
    const confidence = Math.min(100, Math.round(bestScore / maxPossibleScore * 100));
    return { type: bestType, confidence };
  }
  /**
   * Get recommendations for a document type.
   */
  static getRecommendations(type) {
    return this.types.get(type)?.recommendations || [];
  }
};

// server/services/DocumentAnalyzerService.ts
var LANGUAGE_PATTERNS = {
  en: [/the\s/gi, /\sand\s/gi, /\sof\s/gi, /\sto\s/gi, /\sin\s/gi, /\that\s/gi, /\bwith\b/gi, /\bfor\b/gi],
  es: [/el\s/gi, /\bla\b/gi, /\blos\b/gi, /\blas\b/gi, /\bdel\b/gi, /\bpor\b/gi, /\bpara\b/gi, /\bcomo\b/gi],
  fr: [/le\s/gi, /\bla\b/gi, /\bles\b/gi, /\bdes\b/gi, /\bdu\b/gi, /\bpas\b/gi, /\bavec\b/gi, /\bpour\b/gi],
  de: [/der\s/gi, /\bdie\b/gi, /\bdas\b/gi, /\bund\s/gi, /\bmit\b/gi, /\bein\s/gi, /\bauf\b/gi, /\bist\b/gi],
  it: [/il\s/gi, /\bla\b/gi, /\ble\b/gi, /\bgli\b/gi, /\bdel\b/gi, /\bdella\b/gi, /\bcon\b/gi, /\bper\b/gi],
  pt: [/o\s/gi, /\ba\b/gi, /\bos\b/gi, /\bas\b/gi, /\bdo\b/gi, /\bda\b/gi, /\bpara\b/gi, /\bcom\b/gi]
};
var DocumentAnalyzerService = class {
  /**
   * Analyze a document and return comprehensive analysis.
   * @param markdown - The document content (Markdown)
   * @param title - Optional document title
   * @param pageCount - Number of pages (if available)
   */
  static analyze(markdown, title, pageCount) {
    const text = markdown;
    const wordCount = this.countWords(text);
    const headingCount = this.countHeadings(text);
    const tableCount = this.countTables(text);
    const imageCount = this.countImages(text);
    const linkCount = this.countLinks(text);
    const footnoteCount = this.countFootnotes(text);
    const referenceCount = this.countReferences(text);
    const language = this.detectLanguage(text);
    const docTypeResult = DocumentTypeRegistry.detect(text, title);
    const readingTimeMinutes = Math.max(1, Math.round(wordCount / 200));
    const complexityScore = this.calculateComplexity(text, wordCount, headingCount, tableCount);
    const estimatedTokens = Math.round(wordCount * 1.3);
    const estimatedAICost = Math.round(estimatedTokens / 1e3 * 0.01 * 100) / 100;
    const recommendations = this.generateRecommendations(
      docTypeResult.type,
      complexityScore,
      wordCount,
      readingTimeMinutes,
      tableCount
    );
    const analysis = {
      type: docTypeResult.type,
      language,
      confidence: docTypeResult.confidence,
      pageCount: pageCount || Math.max(1, Math.ceil(wordCount / 350)),
      wordCount,
      headingCount,
      tableCount,
      imageCount,
      linkCount,
      footnoteCount,
      referenceCount,
      readingTimeMinutes,
      complexityScore,
      estimatedTokens,
      estimatedAICost,
      recommendations
    };
    const readiness = this.calculateReadiness(text, analysis);
    return { analysis, readiness };
  }
  /**
   * Count words in the document.
   */
  static countWords(text) {
    const cleanText = text.replace(/```[\s\S]*?```/g, "").replace(/\|.*\|/g, "").replace(/[#*_`>\[\]()!-]/g, " ");
    const words = cleanText.split(/\s+/).filter((w) => w.length > 0);
    return words.length;
  }
  /**
   * Count headings (# through ######).
   */
  static countHeadings(text) {
    const matches = text.match(/^#{1,6}\s+/gm);
    return matches ? matches.length : 0;
  }
  /**
   * Count tables (pipe tables).
   */
  static countTables(text) {
    const lines = text.split("\n");
    let tableCount = 0;
    let inTable = false;
    for (const line of lines) {
      if (line.trim().startsWith("|")) {
        if (!inTable) {
          tableCount++;
          inTable = true;
        }
      } else {
        inTable = false;
      }
    }
    return tableCount;
  }
  /**
   * Count images (![alt](url)).
   */
  static countImages(text) {
    const matches = text.match(/!\[.*?\]\(.*?\)/g);
    return matches ? matches.length : 0;
  }
  /**
   * Count links ([text](url)).
   */
  static countLinks(text) {
    const matches = text.match(/\[([^\]]*)\]\(([^)]*)\)/g);
    return matches ? matches.length : 0;
  }
  /**
   * Count footnotes ([^1] pattern).
   */
  static countFootnotes(text) {
    const matches = text.match(/\[\^\d+\]/g);
    return matches ? matches.length : 0;
  }
  /**
   * Count references (markers like [1], [2,3]).
   */
  static countReferences(text) {
    const matches = text.match(/\[(\d+(?:[,;\s]+\d+)*)\]/g);
    return matches ? matches.length : 0;
  }
  /**
   * Detect document language using keyword frequency.
   */
  static detectLanguage(text) {
    const scores = {};
    Object.entries(LANGUAGE_PATTERNS).forEach(([lang, patterns]) => {
      scores[lang] = 0;
      patterns.forEach((pattern) => {
        const matches = text.match(pattern);
        if (matches) {
          scores[lang] += matches.length;
        }
      });
    });
    let bestLang = "en";
    let bestScore = 0;
    Object.entries(scores).forEach(([lang, score]) => {
      if (score > bestScore) {
        bestScore = score;
        bestLang = lang;
      }
    });
    return bestLang;
  }
  /**
   * Calculate document complexity score (0-100).
   */
  static calculateComplexity(text, wordCount, headingCount, tableCount) {
    let score = 0;
    score += Math.min(30, wordCount / 100);
    score += Math.min(20, headingCount * 2);
    score += Math.min(20, tableCount * 5);
    const words = text.split(/\s+/);
    const longWords = words.filter((w) => w.length >= 10).length;
    score += Math.min(20, longWords / Math.max(1, words.length) * 100);
    const sentences = text.split(/[.!?]+/);
    const avgSentenceLength = wordCount / Math.max(1, sentences.length);
    if (avgSentenceLength > 25) {
      score += Math.min(10, (avgSentenceLength - 25) * 0.5);
    }
    return Math.min(100, Math.round(score));
  }
  /**
   * Calculate AI Readiness Score (0-100).
   */
  static calculateReadiness(text, analysis) {
    const issues = [];
    const lines = text.split("\n");
    const headerLike = lines.filter(
      (l) => l.trim().length > 0 && l.trim().length < 60 && !l.trim().match(/[.!?]$/) && !l.trim().startsWith("#")
    );
    const headerFreq = /* @__PURE__ */ new Map();
    headerLike.forEach((l) => {
      const t = l.trim();
      headerFreq.set(t, (headerFreq.get(t) || 0) + 1);
    });
    headerFreq.forEach((count, line) => {
      if (count > 3) {
        issues.push({
          type: "repeated-headers",
          severity: "medium",
          description: `"${line}" appears ${count} times \u2014 may be a repeated header`
        });
      }
    });
    for (let i = 0; i < lines.length - 1; i++) {
      const current = lines[i].trim();
      const next = lines[i + 1].trim();
      if (current && next && !current.match(/[.!?]$/) && next[0] === next[0]?.toLowerCase() && !next.startsWith("#") && !next.startsWith("-") && !next.startsWith("|")) {
        issues.push({
          type: "broken-paragraphs",
          severity: "low",
          description: `Line ${i + 1}: paragraph may be broken`,
          line: i + 1
        });
        break;
      }
    }
    lines.forEach((line, index) => {
      if (/^page\s+\d+$/i.test(line.trim())) {
        issues.push({
          type: "page-numbers",
          severity: "low",
          description: `Page number found on line ${index + 1}`,
          line: index + 1
        });
      }
    });
    const footerPatterns = [/^\s*-\s*\d+\s*-\s*$/, /^\d{1,3}$/];
    lines.forEach((line, index) => {
      if (footerPatterns.some((p) => p.test(line.trim()))) {
        issues.push({
          type: "footer-text",
          severity: "low",
          description: `Possible page number or footer on line ${index + 1}`,
          line: index + 1
        });
      }
    });
    let maxLevel = 0;
    lines.forEach((line, index) => {
      const match = line.match(/^(#{1,6})\s/);
      if (match) {
        const level = match[1].length;
        if (level > maxLevel + 1 && maxLevel > 0) {
          issues.push({
            type: "heading-gaps",
            severity: "medium",
            description: `Heading gap: H${maxLevel} \u2192 H${level} on line ${index + 1}`,
            line: index + 1
          });
        }
        maxLevel = Math.max(maxLevel, level);
      }
    });
    let consecutiveBlankCount = 0;
    for (const line of lines) {
      if (line.trim() === "") {
        consecutiveBlankCount++;
        if (consecutiveBlankCount > 3) {
          issues.push({
            type: "whitespace-issues",
            severity: "low",
            description: "Excessive blank lines detected"
          });
          break;
        }
      } else {
        consecutiveBlankCount = 0;
      }
    }
    let score = 100;
    const severityDeductions = {
      high: 20,
      medium: 10,
      low: 5
    };
    issues.forEach((issue) => {
      score -= severityDeductions[issue.severity] || 5;
    });
    if (analysis.complexityScore > 70) {
      score -= 10;
    }
    const suggestions = [];
    if (issues.some((i) => i.type === "repeated-headers")) {
      suggestions.push("Use Clean for AI to remove repeated headers.");
    }
    if (issues.some((i) => i.type === "broken-paragraphs")) {
      suggestions.push("Enable Clean for AI to merge broken paragraphs.");
    }
    if (issues.some((i) => i.type === "page-numbers")) {
      suggestions.push("Use Clean for AI to remove page numbers.");
    }
    if (issues.some((i) => i.type === "whitespace-issues")) {
      suggestions.push("Normalize whitespace using Clean for AI.");
    }
    if (issues.some((i) => i.type === "heading-gaps")) {
      suggestions.push("Improve heading hierarchy using Clean for AI.");
    }
    return {
      overall: Math.max(0, Math.min(100, score)),
      issues,
      suggestions
    };
  }
  /**
   * Generate recommendations based on document analysis.
   */
  static generateRecommendations(docType, complexityScore, wordCount, readingTimeMinutes, tableCount) {
    const recommendations = [];
    const typeRecs = DocumentTypeRegistry.getRecommendations(docType);
    recommendations.push(...typeRecs);
    if (complexityScore > 60) {
      recommendations.push("This document has high complexity. Consider using AI Summary for a quick overview.");
    }
    if (wordCount > 5e3) {
      recommendations.push("Long document detected. RAG Export will help chunk this for AI processing.");
    }
    if (tableCount > 3) {
      recommendations.push("Multiple tables detected. Clean for AI will preserve table structures.");
    }
    if (readingTimeMinutes > 20) {
      recommendations.push("Document exceeds 20 minutes reading time. Generate a summary first.");
    }
    return recommendations;
  }
};

// src/ai/registries/PromptTemplateRegistry.ts
var PromptTemplateRegistry = class {
  static {
    this.templates = /* @__PURE__ */ new Map();
  }
  /**
   * Initialize built-in prompt templates.
   */
  static initialize() {
    const builtIn = [
      {
        id: "summary",
        name: "Summary",
        description: "Generate a concise document summary",
        icon: "FileText",
        template: `Please provide a comprehensive summary of the following document.

DOCUMENT:
{{markdown}}

Please include:
1. A one-paragraph executive summary
2. Key findings or main points
3. Important conclusions

DOCUMENT METADATA:
- Title: {{title}}
- Word count: {{wordCount}}
- Estimated reading time: {{readingTime}} minutes`,
        providerVariants: {
          claude: `I need you to summarize the following document for me.

DOCUMENT CONTENT:
{{markdown}}

Please structure your summary as:
1. **Executive Summary** (2-3 sentences)
2. **Key Points** (bullet points)
3. **Conclusions**

About this document: "{{title}}" ({{wordCount}} words, ~{{readingTime}} min read)`,
          gemini: `Analyze this document and create a structured summary.

Document:
{{markdown}}

Return: executive summary, key points, and conclusions.
Metadata: title="{{title}}", words={{wordCount}}, reading_time={{readingTime}}min`,
          local: `Summarize this document:

{{markdown}}

Document title: {{title}}
Words: {{wordCount}}`
        }
      },
      {
        id: "research",
        name: "Research",
        description: "Extract research findings and methodology",
        icon: "Search",
        template: `Analyze the following document from a research perspective.

DOCUMENT:
{{markdown}}

Please extract:
1. Research question or objective
2. Methodology used
3. Key findings and results
4. Limitations
5. Future research directions

Format as a structured research brief.`
      },
      {
        id: "study-notes",
        name: "Study Notes",
        description: "Create comprehensive study notes",
        icon: "BookOpen",
        template: `Convert the following document into well-structured study notes.

DOCUMENT:
{{markdown}}

Format:
## Key Concepts
- ...

## Important Definitions
- ...

## Examples
- ...

## Summary Points
1. ...
2. ...

## Review Questions
1. ?
2. ?`
      },
      {
        id: "presentation",
        name: "Presentation",
        description: "Convert document into presentation outline",
        icon: "Monitor",
        template: `Create a presentation outline from the following document.

DOCUMENT:
{{markdown}}

Format:
# Slide 1: Title Slide
- Title: [title]
- Subtitle: [key theme]

# Slide 2: Overview
- ...

# Slide 3-N: Content Slides
- Key point 1
- Supporting detail
- Example

# Final Slide: Conclusion
- Takeaway
- Next steps`
      },
      {
        id: "faq",
        name: "FAQ",
        description: "Generate frequently asked questions",
        icon: "HelpCircle",
        template: `Generate a comprehensive FAQ based on the following document.

DOCUMENT:
{{markdown}}

Format each Q&A as:
## Q: [Question]
**A:** [Answer with reference to document section]

Generate 5-10 FAQs covering the most important topics.
Include page/section references where applicable.`
      },
      {
        id: "flashcards",
        name: "Flashcards",
        description: "Create Q&A flashcards for review",
        icon: "Layers",
        template: `Create flashcards from the following document for study review.

DOCUMENT:
{{markdown}}

Format each flashcard as:
**Front:** [Question or prompt]
**Back:** [Answer or explanation]

Generate at least 10 flashcards. Cover:
- Key definitions
- Important concepts
- Notable facts
- Relationships between ideas`
      },
      {
        id: "translation",
        name: "Translation",
        description: "Translate document content",
        icon: "Globe",
        template: `Translate the following document into [TARGET_LANGUAGE].

DOCUMENT:
{{markdown}}

Requirements:
- Preserve all formatting (headings, lists, code blocks, tables)
- Maintain technical accuracy
- Keep proper nouns unchanged
- Preserve original structure and hierarchy

Source language: {{language}}
Target language: [Specify target language]`
      },
      {
        id: "extract-data",
        name: "Extract Data",
        description: "Extract structured data from document",
        icon: "Database",
        template: `Extract structured data from the following document.

DOCUMENT:
{{markdown}}

Extract and organize:
1. **Entities**: People, organizations, locations, dates
2. **Metrics**: Numbers, statistics, measurements
3. **Relationships**: How entities are connected
4. **Categories**: Topics, themes, classifications

Output as structured JSON format when possible.`
      },
      {
        id: "explain-like-im-five",
        name: "Explain Like I'm 5",
        description: "Simplify complex concepts",
        icon: "Heart",
        template: `Explain the following document as if I'm 5 years old.

DOCUMENT:
{{markdown}}

Requirements:
- Use simple words (no jargon)
- Short sentences
- Fun analogies and examples
- Break down complex ideas into tiny pieces
- Use comparisons a child would understand

Start with: "Imagine you're playing with building blocks..." or similar analogy.`
      },
      {
        id: "technical-analysis",
        name: "Technical Analysis",
        description: "Deep technical breakdown",
        icon: "Cpu",
        template: `Perform a comprehensive technical analysis of the following document.

DOCUMENT:
{{markdown}}

Analysis structure:
1. **Architecture Overview**
   - System components
   - Data flow

2. **Technical Specifications**
   - Key technologies referenced
   - Performance metrics
   - Scalability considerations

3. **Implementation Details**
   - Code/algorithm analysis
   - API endpoints or interfaces
   - Data structures

4. **Security Considerations**
   - Potential vulnerabilities
   - Authentication/authorization
   - Data privacy

5. **Recommendations**
   - Improvements
   - Best practices
   - Optimization opportunities`
      }
    ];
    builtIn.forEach((tpl) => this.templates.set(tpl.id, tpl));
  }
  /**
   * Register a new prompt template.
   */
  static register(template) {
    this.templates.set(template.id, template);
  }
  /**
   * Get a template by ID.
   */
  static get(id) {
    return this.templates.get(id);
  }
  /**
   * Get all registered templates.
   */
  static getAll() {
    return Array.from(this.templates.values());
  }
  /**
   * Get a formatted prompt for a specific provider.
   * Falls back to the base template if no provider variant exists.
   */
  static getFormattedPrompt(id, providerId, variables) {
    const template = this.templates.get(id);
    if (!template) return null;
    let promptText = template.providerVariants?.[providerId] || template.template;
    Object.entries(variables).forEach(([key, value]) => {
      promptText = promptText.replace(new RegExp(`{{${key}}}`, "g"), value || "");
    });
    return promptText;
  }
};

// server/services/PromptGeneratorService.ts
var PromptGeneratorService = class {
  /**
   * Generate a prompt from a template.
   * @param templateId - The prompt template ID
   * @param providerId - The AI provider ID
   * @param markdown - The document content
   * @param metadata - Optional metadata (title, wordCount, etc.)
   * @returns The generated prompt
   */
  static generate(templateId, providerId, markdown, metadata) {
    const template = PromptTemplateRegistry.get(templateId);
    if (!template) return null;
    const variables = {
      markdown,
      title: metadata?.title || "Untitled Document",
      wordCount: metadata?.wordCount || String(this.countWords(markdown)),
      readingTime: metadata?.readingTime || String(Math.max(1, Math.round(this.countWords(markdown) / 200))),
      language: metadata?.language || "English"
    };
    const promptText = PromptTemplateRegistry.getFormattedPrompt(
      templateId,
      providerId,
      variables
    );
    if (!promptText) return null;
    return {
      id: `prompt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      templateId,
      providerId,
      prompt: promptText,
      title: template.name,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  /**
   * Generate all prompts for all templates for a given provider.
   */
  static generateAll(providerId, markdown, metadata) {
    const templates = PromptTemplateRegistry.getAll();
    const prompts = [];
    templates.forEach((template) => {
      const prompt = this.generate(template.id, providerId, markdown, metadata);
      if (prompt) prompts.push(prompt);
    });
    return prompts;
  }
  /**
   * Format a prompt for a specific provider's chat format.
   */
  static formatForProvider(prompt, providerId) {
    switch (providerId) {
      case "chatgpt":
        return this.formatForChatGPT(prompt);
      case "claude":
        return this.formatForClaude(prompt);
      case "gemini":
        return this.formatForGemini(prompt);
      case "notebooklm":
        return this.formatForNotebookLM(prompt);
      case "local":
        return prompt;
      // Local models get raw prompt
      default:
        return prompt;
    }
  }
  /**
   * Format prompt for ChatGPT (system + user message).
   */
  static formatForChatGPT(prompt) {
    return `You are a helpful AI assistant specialized in document analysis and processing.

Please respond to the following request based on the document provided.

${prompt}

IMPORTANT: 
- Be thorough and detailed in your response
- Use markdown formatting for readability
- If you need clarification, state what additional information you need`;
  }
  /**
   * Format prompt for Claude (XML-style).
   */
  static formatForClaude(prompt) {
    return `${prompt}

Please provide a thorough, well-structured response. Use markdown formatting.`;
  }
  /**
   * Format prompt for Gemini (concise).
   */
  static formatForGemini(prompt) {
    return `You are a document analysis expert. Process the following request:

${prompt}

Provide a comprehensive, structured response.`;
  }
  /**
   * Format prompt for NotebookLM (source-focused).
   */
  static formatForNotebookLM(prompt) {
    return `Based solely on the provided source document, please address the following:

${prompt}

Base your response ONLY on information explicitly present in the document. Do not add external information unless specifically requested.`;
  }
  /**
   * Count words in text.
   */
  static countWords(text) {
    return text.split(/\s+/).filter((w) => w.length > 0).length;
  }
};

// server/services/RAGExportService.ts
var DEFAULT_RAG_OPTIONS = {
  chunkSize: 512,
  format: "json",
  includeMetadata: true,
  source: "convertoneai",
  language: "en",
  title: "Untitled Document"
};
var RAGExportService = class {
  static export(markdown, options = {}) {
    const opts = { ...DEFAULT_RAG_OPTIONS, ...options };
    const chunks = this.chunkDocument(markdown, opts.chunkSize, opts);
    const totalTokens = chunks.reduce((sum, c) => sum + c.tokens, 0);
    return { chunks, format: opts.format, chunkSize: opts.chunkSize, totalTokens, totalChunks: chunks.length, downloadUrl: "" };
  }
  static chunkDocument(text, chunkSize, opts) {
    const chunks = [];
    const charsPerChunk = chunkSize * 4;
    const overlap = Math.round(charsPerChunk * 0.1);
    let pos = 0;
    let id = 0;
    while (pos < text.length) {
      const end = Math.min(pos + charsPerChunk, text.length);
      let chunkText = text.substring(pos, end);
      let splitAt = end;
      if (end < text.length) {
        const pb = chunkText.lastIndexOf("\n\n");
        const sb = chunkText.lastIndexOf(". ");
        const wb = chunkText.lastIndexOf(" ");
        if (pb > charsPerChunk * 0.5) {
          chunkText = chunkText.substring(0, pb);
          splitAt = pos + pb;
        } else if (sb > charsPerChunk * 0.5) {
          chunkText = chunkText.substring(0, sb + 1);
          splitAt = pos + sb + 1;
        } else if (wb > charsPerChunk * 0.5) {
          chunkText = chunkText.substring(0, wb);
          splitAt = pos + wb;
        }
      }
      const tokens = Math.round(chunkText.length / 4);
      const page = Math.floor(splitAt / 2e3) + 1;
      chunks.push({
        id: `chunk-${id}-${Date.now()}`,
        index: id,
        text: chunkText.trim(),
        tokens,
        metadata: opts.includeMetadata ? { page, source: opts.source, language: opts.language, title: opts.title, chunkId: id, totalChunks: 0 } : void 0
      });
      id++;
      const next = Math.max(splitAt - overlap, splitAt + 1);
      pos = Math.min(text.length, next);
    }
    if (opts.includeMetadata) chunks.forEach((c) => {
      c.metadata.totalChunks = chunks.length;
    });
    return chunks;
  }
  static getFormattedOutput(chunks, format) {
    switch (format) {
      case "json":
        return JSON.stringify(chunks, null, 2);
      case "jsonl":
        return chunks.map((c) => JSON.stringify(c)).join("\n");
      case "markdown":
        return chunks.map((c) => `## Chunk ${c.index + 1}/${chunks.length}

*Page: ${c.metadata.page} | Source: ${c.metadata.source}*

${c.text}

---
`).join("\n");
      case "txt":
        return chunks.map((c) => `--- Chunk ${c.index + 1}/${c.metadata.totalChunks} ---
${c.text}
`).join("\n\n");
      default:
        return JSON.stringify(chunks, null, 2);
    }
  }
  static validateChunkSize(s) {
    return [256, 512, 1024].includes(s);
  }
  static validateFormat(f) {
    return ["json", "jsonl", "markdown", "txt"].includes(f);
  }
};

// src/ai/registries/ExportRegistry.ts
var ExportRegistry = class {
  static {
    this.formats = /* @__PURE__ */ new Map();
  }
  /**
   * Initialize built-in export formats.
   * Call once at application startup.
   */
  static initialize() {
    const builtIn = [
      {
        id: "markdown",
        name: "Markdown",
        description: "Standard Markdown (.md)",
        icon: "FileText",
        extension: ".md",
        mimeType: "text/markdown",
        isEnabled: true
      },
      {
        id: "clean-markdown",
        name: "Clean Markdown",
        description: "AI-preprocessed clean Markdown",
        icon: "Sparkles",
        extension: ".md",
        mimeType: "text/markdown",
        isEnabled: true
      },
      {
        id: "ai-markdown",
        name: "AI Markdown",
        description: "LLM-optimized Markdown with metadata",
        icon: "Brain",
        extension: ".md",
        mimeType: "text/markdown",
        isEnabled: true
      },
      {
        id: "json",
        name: "JSON",
        description: "Structured JSON output with metadata",
        icon: "Braces",
        extension: ".json",
        mimeType: "application/json",
        isEnabled: true
      },
      {
        id: "jsonl",
        name: "JSONL",
        description: "JSON Lines format for RAG pipelines",
        icon: "List",
        extension: ".jsonl",
        mimeType: "application/jsonl",
        isEnabled: true
      },
      {
        id: "txt",
        name: "TXT",
        description: "Plain text output",
        icon: "File",
        extension: ".txt",
        mimeType: "text/plain",
        isEnabled: true
      },
      {
        id: "prompt",
        name: "Prompt",
        description: "AI prompt file for ChatGPT/Claude/Gemini",
        icon: "MessageSquare",
        extension: ".md",
        mimeType: "text/markdown",
        isEnabled: true
      },
      {
        id: "rag-dataset",
        name: "RAG Dataset",
        description: "Chunked document for RAG ingestion",
        icon: "Database",
        extension: ".json",
        mimeType: "application/json",
        isEnabled: true
      }
    ];
    builtIn.forEach((fmt) => this.formats.set(fmt.id, fmt));
  }
  /**
   * Register a new export format.
   * @param format - The export format to register
   */
  static register(format) {
    this.formats.set(format.id, format);
  }
  /**
   * Get an export format by ID.
   */
  static get(id) {
    return this.formats.get(id);
  }
  /**
   * Get all registered export formats.
   */
  static getAll() {
    return Array.from(this.formats.values());
  }
  /**
   * Get all enabled export formats.
   */
  static getEnabled() {
    return this.getAll().filter((f) => f.isEnabled);
  }
};

// server/services/AIExportService.ts
var AIExportService = class {
  static export(request) {
    const format = ExportRegistry.get(request.format);
    if (!format || !format.isEnabled) return null;
    let content = "";
    let extension = format.extension;
    switch (request.format) {
      case "markdown":
        content = request.markdown;
        break;
      case "clean-markdown":
        content = request.cleanMarkdown || request.markdown;
        break;
      case "ai-markdown":
        content = request.aiMarkdown || request.markdown;
        break;
      case "json":
        content = this.exportAsJSON(request);
        extension = ".json";
        break;
      case "jsonl":
        content = this.exportAsJSONL(request);
        extension = ".jsonl";
        break;
      case "txt":
        content = this.exportAsTXT(request);
        extension = ".txt";
        break;
      case "prompt":
        content = request.prompt?.prompt || request.markdown;
        break;
      case "rag-dataset":
        content = this.exportRAGDataset(request);
        break;
      default:
        content = request.markdown;
    }
    const sizeBytes = Buffer.byteLength(content, "utf-8");
    const baseName = request.metadata?.title || "document";
    const safeName = baseName.replace(/[^a-zA-Z0-9-_]/g, "_").substring(0, 50);
    return { content, fileName: `${safeName}${extension}`, mimeType: format.mimeType, extension, sizeBytes };
  }
  static exportAsJSON(request) {
    const output = {
      content: request.markdown,
      metadata: { ...request.metadata, exportedAt: (/* @__PURE__ */ new Date()).toISOString(), format: "markdown" }
    };
    if (request.cleanMarkdown) output.cleanContent = request.cleanMarkdown;
    if (request.aiMarkdown) output.aiOptimizedContent = request.aiMarkdown;
    if (request.ragExport) output.ragChunks = request.ragExport.chunks;
    if (request.prompt) output.generatedPrompt = request.prompt;
    return JSON.stringify(output, null, 2);
  }
  static exportAsJSONL(request) {
    const lines = [JSON.stringify({ type: "content", text: request.markdown })];
    if (request.metadata) lines.push(JSON.stringify({ type: "metadata", ...request.metadata }));
    if (request.ragExport?.chunks) {
      request.ragExport.chunks.forEach((chunk) => {
        lines.push(JSON.stringify({ type: "chunk", index: chunk.index, text: chunk.text, tokens: chunk.tokens, metadata: chunk.metadata }));
      });
    }
    if (request.prompt) lines.push(JSON.stringify({ type: "prompt", templateId: request.prompt.templateId, providerId: request.prompt.providerId, text: request.prompt.prompt }));
    return lines.join("\n");
  }
  static exportAsTXT(request) {
    const lines = [];
    lines.push("=".repeat(60));
    lines.push("ConvertOneAI Document Export");
    lines.push("=".repeat(60));
    lines.push("");
    if (request.metadata?.title) lines.push(`Title: ${request.metadata.title}`);
    if (request.metadata?.wordCount) lines.push(`Word Count: ${request.metadata.wordCount}`);
    lines.push(`Export Date: ${(/* @__PURE__ */ new Date()).toISOString()}`);
    lines.push("");
    lines.push("=".repeat(60));
    lines.push("");
    lines.push(request.markdown);
    return lines.join("\n");
  }
  static exportRAGDataset(request) {
    if (!request.ragExport) return JSON.stringify([], null, 2);
    return JSON.stringify(request.ragExport.chunks.map((c) => ({ id: c.id, text: c.text, metadata: c.metadata })), null, 2);
  }
  static exportAll(request) {
    const formats = ExportRegistry.getEnabled();
    const results = {};
    formats.forEach((format) => {
      results[format.id] = this.export({ ...request, format: format.id });
    });
    return results;
  }
};

// server/services/ProcessingPipeline.ts
var import_events = require("events");

// server/services/CacheService.ts
var import_crypto = __toESM(require("crypto"), 1);
var CacheService = class {
  static {
    this.cache = /* @__PURE__ */ new Map();
  }
  static {
    this.defaultTTL = 5 * 60 * 1e3;
  }
  static {
    // 5 minutes
    this.maxEntries = 100;
  }
  static {
    this.cleanupInterval = null;
  }
  /**
   * Initialize the cache service with periodic cleanup.
   */
  static initialize(ttlMs, maxEntries) {
    if (ttlMs) this.defaultTTL = ttlMs;
    if (maxEntries) this.maxEntries = maxEntries;
    if (!this.cleanupInterval) {
      this.cleanupInterval = setInterval(() => this.cleanup(), 6e4);
    }
  }
  /**
   * Generate a cache key from content and options.
   */
  static generateKey(content, options) {
    const hash = import_crypto.default.createHash("sha256");
    hash.update(content);
    if (options) {
      hash.update(JSON.stringify(options));
    }
    return hash.digest("hex");
  }
  /**
   * Get a cached value.
   */
  static get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    entry.accessCount++;
    return entry.data;
  }
  /**
   * Set a cached value.
   */
  static set(key, data, ttlMs) {
    if (this.cache.size >= this.maxEntries) {
      this.evictOldest();
    }
    const now = Date.now();
    this.cache.set(key, {
      key,
      data,
      createdAt: now,
      expiresAt: now + (ttlMs || this.defaultTTL),
      accessCount: 0
    });
  }
  /**
   * Check if a key exists and is not expired.
   */
  static has(key) {
    const entry = this.cache.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }
  /**
   * Invalidate a specific cache entry.
   */
  static invalidate(key) {
    this.cache.delete(key);
  }
  /**
   * Clear all cache entries.
   */
  static clear() {
    this.cache.clear();
  }
  /**
   * Get cache statistics.
   */
  static getStats() {
    let hits = 0;
    let totalAccesses = 0;
    this.cache.forEach((entry) => {
      totalAccesses += entry.accessCount;
      if (entry.accessCount > 0) hits++;
    });
    return {
      size: this.cache.size,
      maxEntries: this.maxEntries,
      hitRate: totalAccesses > 0 ? hits / totalAccesses * 100 : 0
    };
  }
  /**
   * Remove expired entries.
   */
  static cleanup() {
    const now = Date.now();
    this.cache.forEach((entry, key) => {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    });
  }
  /**
   * Evict the oldest entry (by creation time) when cache is full.
   */
  static evictOldest() {
    let oldestKey = null;
    let oldestTime = Infinity;
    this.cache.forEach((entry, key) => {
      if (entry.createdAt < oldestTime) {
        oldestTime = entry.createdAt;
        oldestKey = key;
      }
    });
    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }
  /**
   * Stop the cleanup interval.
   */
  static destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
};

// server/services/AnalyticsService.ts
var AnalyticsService = class {
  static {
    this.events = [];
  }
  static {
    this.usage = /* @__PURE__ */ new Map();
  }
  static {
    this.startTime = Date.now();
  }
  static {
    this.maxEvents = 1e3;
  }
  static {
    this.isEnabled = true;
  }
  /**
   * Enable or disable analytics.
   */
  static setEnabled(enabled) {
    this.isEnabled = enabled;
  }
  /**
   * Track a feature usage event.
   * @param event - The event to track (no document content included)
   */
  static trackEvent(event) {
    if (!this.isEnabled) return;
    const fullEvent = {
      ...event,
      timestamp: Date.now()
    };
    if (this.events.length >= this.maxEvents) {
      this.events.shift();
    }
    this.events.push(fullEvent);
    this.updateFeatureUsage(fullEvent);
  }
  /**
   * Track a feature being used.
   * @param feature - Feature identifier (e.g., "ai-cleaner", "prompt-generator")
   * @param success - Whether the operation succeeded
   * @param durationMs - Duration of the operation
   */
  static trackFeatureUsage(feature, success, durationMs) {
    this.trackEvent({
      event: `feature:${feature}:${success ? "success" : "failure"}`,
      durationMs,
      metadata: {
        feature,
        success
      }
    });
  }
  /**
   * Get usage statistics for a specific feature.
   */
  static getFeatureUsage(feature) {
    return this.usage.get(feature);
  }
  /**
   * Get all feature usage statistics.
   */
  static getAllFeatureUsage() {
    return Array.from(this.usage.values()).sort(
      (a, b) => b.totalCalls - a.totalCalls
    );
  }
  /**
   * Get a snapshot of all analytics data.
   */
  static getSnapshot() {
    const features = {};
    this.usage.forEach((usage, key) => {
      features[key] = usage;
    });
    return {
      totalEvents: this.events.length,
      features,
      startTime: this.startTime,
      uptimeMs: Date.now() - this.startTime
    };
  }
  /**
   * Get top N most used features.
   */
  static getTopFeatures(n = 5) {
    return this.getAllFeatureUsage().slice(0, n);
  }
  /**
   * Get success rate for a feature.
   */
  static getSuccessRate(feature) {
    const usage = this.usage.get(feature);
    if (!usage || usage.totalCalls === 0) return 1;
    return usage.successfulCalls / usage.totalCalls;
  }
  /**
   * Reset all analytics data.
   */
  static reset() {
    this.events = [];
    this.usage.clear();
    this.startTime = Date.now();
  }
  /**
   * Update feature usage aggregates from an event.
   */
  static updateFeatureUsage(event) {
    const feature = event.metadata?.feature;
    if (!feature) return;
    let usage = this.usage.get(feature);
    if (!usage) {
      usage = {
        feature,
        totalCalls: 0,
        successfulCalls: 0,
        failedCalls: 0,
        totalDurationMs: 0,
        averageDurationMs: 0,
        lastUsed: event.timestamp,
        firstUsed: event.timestamp
      };
      this.usage.set(feature, usage);
    }
    usage.totalCalls++;
    usage.lastUsed = event.timestamp;
    if (event.metadata?.success === true) {
      usage.successfulCalls++;
    } else if (event.metadata?.success === false) {
      usage.failedCalls++;
    }
    if (event.durationMs) {
      usage.totalDurationMs += event.durationMs;
      usage.averageDurationMs = Math.round(
        usage.totalDurationMs / usage.totalCalls
      );
    }
  }
};

// server/services/ProcessingPipeline.ts
var PIPELINE_EVENTS = {
  START: "pipeline:start",
  STAGE_START: "pipeline:stage-start",
  STAGE_END: "pipeline:stage-end",
  PROGRESS: "pipeline:progress",
  COMPLETE: "pipeline:complete",
  ERROR: "pipeline:error",
  CANCEL: "pipeline:cancel",
  RETRY: "pipeline:retry"
};
var ProcessingPipeline = class _ProcessingPipeline extends import_events.EventEmitter {
  constructor() {
    super();
    this.isRunning = false;
    this.isCancelled = false;
    this.startTime = 0;
    this.currentStage = "";
    this.completedWeight = 0;
    this.stages = [];
    this.context = {
      markdown: "",
      errors: [],
      warnings: []
    };
    this.setupStages();
  }
  /**
   * Get the singleton pipeline instance.
   */
  static getInstance() {
    if (!this.instance) {
      this.instance = new _ProcessingPipeline();
    }
    return this.instance;
  }
  /**
   * Configure the pipeline stages.
   * Stages are ordered and can be extended by adding to this array.
   */
  setupStages() {
    this.stages = [
      {
        id: "validating",
        name: "Validating document...",
        weight: 5,
        handler: this.stageValidate.bind(this),
        timeout: 1e4
      },
      {
        id: "extracting",
        name: "Extracting text content...",
        weight: 15,
        handler: this.stageExtract.bind(this),
        timeout: 6e4
      },
      {
        id: "cleaning",
        name: "Cleaning document for AI...",
        weight: 20,
        handler: this.stageClean.bind(this),
        timeout: 3e4
      },
      {
        id: "analyzing",
        name: "Analyzing document structure...",
        weight: 20,
        handler: this.stageAnalyze.bind(this),
        timeout: 3e4
      },
      {
        id: "summarizing",
        name: "Generating summaries...",
        weight: 15,
        handler: this.stageSummarize.bind(this),
        timeout: 3e4
      },
      {
        id: "generating",
        name: "Preparing AI outputs...",
        weight: 15,
        handler: this.stageGenerate.bind(this),
        timeout: 3e4
      },
      {
        id: "exporting",
        name: "Preparing exports...",
        weight: 10,
        handler: this.stageExport.bind(this),
        timeout: 1e4
      }
    ];
  }
  /**
   * Run the pipeline with the given options.
   * @param options - Pipeline processing options
   * @returns Promise resolving with the enhanced result
   */
  async run(options) {
    if (this.isRunning) {
      throw new Error("Pipeline is already running");
    }
    this.isRunning = true;
    this.isCancelled = false;
    this.startTime = Date.now();
    this.completedWeight = 0;
    this.context = {
      markdown: options.markdown,
      errors: [],
      warnings: []
    };
    const cacheKey = CacheService.generateKey(options.markdown, {
      clean: options.cleanForAI,
      summarize: options.generateSummary
    });
    const cached = CacheService.get(cacheKey);
    if (cached) {
      this.emit(PIPELINE_EVENTS.COMPLETE, {
        type: PIPELINE_EVENTS.COMPLETE,
        stage: "complete",
        percent: 100,
        timestamp: Date.now(),
        data: cached
      });
      this.isRunning = false;
      return cached;
    }
    try {
      this.emit(PIPELINE_EVENTS.START, {
        type: PIPELINE_EVENTS.START,
        stage: "uploading",
        percent: 0,
        timestamp: Date.now()
      });
      for (const stage of this.stages) {
        if (this.isCancelled) {
          this.emit(PIPELINE_EVENTS.CANCEL, {
            type: PIPELINE_EVENTS.CANCEL,
            stage: stage.id,
            percent: this.completedWeight,
            timestamp: Date.now()
          });
          throw new Error("Pipeline cancelled");
        }
        if (stage.id === "cleaning" && !options.cleanForAI) {
          this.completedWeight += stage.weight;
          continue;
        }
        if (stage.id === "summarizing" && !options.generateSummary) {
          this.completedWeight += stage.weight;
          continue;
        }
        this.currentStage = stage.id;
        this.emit(PIPELINE_EVENTS.STAGE_START, {
          type: PIPELINE_EVENTS.STAGE_START,
          stage: stage.id,
          percent: this.completedWeight,
          timestamp: Date.now()
        });
        this.emitProgress(stage.id);
        await this.runStageWithTimeout(stage);
        this.completedWeight += stage.weight;
        this.emit(PIPELINE_EVENTS.STAGE_END, {
          type: PIPELINE_EVENTS.STAGE_END,
          stage: stage.id,
          percent: this.completedWeight,
          timestamp: Date.now()
        });
      }
      const result = {
        markdown: this.context.markdown,
        cleanMarkdown: this.context.cleanMarkdown,
        aiMarkdown: this.context.aiMarkdown,
        analysis: this.context.analysis,
        readiness: this.context.readiness,
        summary: this.context.summary,
        warnings: this.context.warnings
      };
      CacheService.set(cacheKey, result);
      AnalyticsService.trackFeatureUsage("pipeline", true, Date.now() - this.startTime);
      this.emit(PIPELINE_EVENTS.COMPLETE, {
        type: PIPELINE_EVENTS.COMPLETE,
        stage: "complete",
        percent: 100,
        timestamp: Date.now(),
        data: result
      });
      return result;
    } catch (error) {
      this.context.errors.push(error.message);
      AnalyticsService.trackFeatureUsage("pipeline", false, Date.now() - this.startTime);
      this.emit(PIPELINE_EVENTS.ERROR, {
        type: PIPELINE_EVENTS.ERROR,
        stage: this.currentStage,
        percent: this.completedWeight,
        timestamp: Date.now(),
        data: { error: error.message }
      });
      return {
        markdown: options.markdown,
        warnings: [error.message],
        errors: this.context.errors
      };
    } finally {
      this.isRunning = false;
    }
  }
  /**
   * Cancel the current pipeline run.
   */
  cancel() {
    this.isCancelled = true;
  }
  /**
   * Check if the pipeline is currently running.
   */
  get running() {
    return this.isRunning;
  }
  /**
   * Get current progress percentage.
   */
  get progress() {
    return this.completedWeight;
  }
  /**
   * Run a stage with a timeout guard.
   */
  async runStageWithTimeout(stage) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Stage "${stage.id}" timed out after ${stage.timeout}ms`));
      }, stage.timeout);
      stage.handler(this.context).then(() => {
        clearTimeout(timeout);
        resolve();
      }).catch((err) => {
        clearTimeout(timeout);
        reject(err);
      });
    });
  }
  /**
   * Emit a progress event with ETA calculation.
   */
  emitProgress(stageId) {
    const elapsed = Date.now() - this.startTime;
    const remainingWeight = 100 - this.completedWeight;
    const etaMs = remainingWeight > 0 ? elapsed / Math.max(1, this.completedWeight) * remainingWeight : 0;
    const etaSeconds = Math.round(etaMs / 1e3);
    const eta = etaSeconds > 60 ? `${Math.floor(etaSeconds / 60)}m ${etaSeconds % 60}s` : `${etaSeconds}s`;
    this.emit(PIPELINE_EVENTS.PROGRESS, {
      type: PIPELINE_EVENTS.PROGRESS,
      stage: stageId,
      percent: this.completedWeight,
      eta,
      step: stageId,
      startTime: this.startTime
    });
  }
  // ─── Stage Handlers ───────────────────────────────────────
  // Each stage is an independent module. New stages can be added
  // by creating a handler function and adding to the stages array.
  async stageValidate(ctx) {
    if (!ctx.markdown || ctx.markdown.trim().length === 0) {
      throw new Error("Document content is empty");
    }
    if (ctx.markdown.length > 1e7) {
      throw new Error("Document exceeds maximum size for AI processing");
    }
  }
  async stageExtract(ctx) {
    if (!ctx.markdown) {
      throw new Error("No extracted content available");
    }
  }
  async stageClean(ctx) {
    const cleaned = DocumentCleanerService.clean(ctx.markdown, {
      removeHeaders: true,
      removeFooters: true,
      removePageNumbers: true,
      removeDuplicates: true,
      mergeParagraphs: true,
      normalizeWhitespace: true,
      improveHeadings: true,
      preserveTables: true
    });
    ctx.cleanMarkdown = cleaned;
    ctx.aiMarkdown = DocumentCleanerService.clean(ctx.markdown, {
      removeHeaders: true,
      removeFooters: true,
      removePageNumbers: true,
      removeDuplicates: true,
      mergeParagraphs: true,
      normalizeWhitespace: true,
      improveHeadings: true,
      preserveTables: false
      // Tables in clean Markdown for AI
    });
    ctx.warnings.push(`Cleaning reduced document by ${ctx.markdown.length - cleaned.length} characters`);
  }
  async stageAnalyze(ctx) {
    const textToAnalyze = ctx.cleanMarkdown || ctx.markdown;
    const result = DocumentAnalyzerService.analyze(textToAnalyze);
    ctx.analysis = result.analysis;
    ctx.readiness = result.readiness;
  }
  async stageSummarize(ctx) {
    const text = ctx.cleanMarkdown || ctx.markdown;
    const wordCount = DocumentAnalyzerService.countWords(text);
    const headingCount = DocumentAnalyzerService.countHeadings(text);
    const words = text.split(/\s+/);
    const shortSummaryWords = words.slice(0, 100).join(" ");
    const shortSummary = shortSummaryWords.length < text.length ? shortSummaryWords + "..." : shortSummaryWords;
    const detailedSummaryWords = words.slice(0, 300).join(" ");
    const detailedSummary = detailedSummaryWords.length < text.length ? detailedSummaryWords + "..." : detailedSummaryWords;
    const keywords = this.extractKeywords(text, 10);
    const keyPoints = this.extractKeyPoints(text, 5);
    ctx.summary = {
      short: shortSummary,
      detailed: detailedSummary,
      keywords,
      keyPoints
    };
  }
  async stageGenerate(ctx) {
    if (!ctx.aiMarkdown && ctx.cleanMarkdown) {
      ctx.aiMarkdown = ctx.cleanMarkdown;
    }
  }
  async stageExport(ctx) {
  }
  /**
   * Extract keywords from text using frequency analysis.
   */
  extractKeywords(text, count) {
    const stopWords = /* @__PURE__ */ new Set([
      "the",
      "a",
      "an",
      "and",
      "or",
      "but",
      "in",
      "on",
      "at",
      "to",
      "for",
      "of",
      "with",
      "by",
      "from",
      "as",
      "is",
      "was",
      "are",
      "were",
      "be",
      "been",
      "being",
      "have",
      "has",
      "had",
      "do",
      "does",
      "did",
      "will",
      "would",
      "could",
      "should",
      "may",
      "might",
      "shall",
      "can",
      "need",
      "dare",
      "ought",
      "used",
      "this",
      "that",
      "these",
      "those",
      "it",
      "its",
      "they",
      "them",
      "their",
      "we",
      "us",
      "our",
      "you",
      "your",
      "he",
      "she",
      "his",
      "her",
      "him",
      "who",
      "whom",
      "which",
      "what",
      "not",
      "no",
      "nor",
      "so",
      "if",
      "then",
      "than",
      "too",
      "very",
      "just",
      "about",
      "above",
      "after",
      "again",
      "all",
      "also",
      "any",
      "because",
      "before",
      "between",
      "both",
      "each",
      "few",
      "more",
      "most",
      "other",
      "some",
      "such",
      "only",
      "own",
      "same"
    ]);
    const words = text.toLowerCase().replace(/[^a-z\s]/g, "").split(/\s+/).filter((w) => w.length > 3 && !stopWords.has(w));
    const freq = /* @__PURE__ */ new Map();
    words.forEach((w) => freq.set(w, (freq.get(w) || 0) + 1));
    return Array.from(freq.entries()).sort((a, b) => b[1] - a[1]).slice(0, count).map(([word]) => word);
  }
  /**
   * Extract key points from headings and first sentences.
   */
  extractKeyPoints(text, count) {
    const points = [];
    const headings = text.match(/^#{1,3}\s+(.+)$/gm);
    if (headings) {
      headings.forEach((h) => {
        const clean = h.replace(/^#+\s+/, "").trim();
        if (clean && !points.includes(clean)) {
          points.push(clean);
        }
      });
    }
    const paragraphs = text.split(/\n\n+/);
    paragraphs.forEach((p) => {
      const clean = p.replace(/^#+\s*/, "").trim();
      if (clean && points.length < count * 2) {
        const firstSentence = clean.split(/[.!?]/)[0];
        if (firstSentence && firstSentence.length > 20) {
          points.push(firstSentence.trim());
        }
      }
    });
    return points.slice(0, count);
  }
  /**
   * Reset the pipeline state.
   */
  reset() {
    this.isRunning = false;
    this.isCancelled = false;
    this.completedWeight = 0;
    this.context = {
      markdown: "",
      errors: [],
      warnings: []
    };
    this.removeAllListeners();
  }
};

// server/controllers/aiController.ts
async function handleCleanDocument(req, res) {
  const startTime = Date.now();
  try {
    const { markdown, options } = req.body;
    if (!markdown) {
      return res.status(400).json({ error: "Missing markdown content" });
    }
    const cleaned = DocumentCleanerService.clean(markdown, options);
    AnalyticsService.trackFeatureUsage("ai-cleaner", true, Date.now() - startTime);
    res.json({
      success: true,
      markdown: cleaned,
      originalLength: markdown.length,
      cleanedLength: cleaned.length,
      reduction: Math.round((1 - cleaned.length / markdown.length) * 100)
    });
  } catch (error) {
    AnalyticsService.trackFeatureUsage("ai-cleaner", false, Date.now() - startTime);
    console.error("[AI Cleaner Error]", error);
    res.status(500).json({ error: error.message || "Failed to clean document" });
  }
}
async function handleAnalyzeDocument(req, res) {
  const startTime = Date.now();
  try {
    const { markdown, title, pageCount } = req.body;
    if (!markdown) {
      return res.status(400).json({ error: "Missing markdown content" });
    }
    const { analysis, readiness } = DocumentAnalyzerService.analyze(markdown, title, pageCount);
    AnalyticsService.trackFeatureUsage("document-analyzer", true, Date.now() - startTime);
    res.json({
      success: true,
      analysis,
      readiness
    });
  } catch (error) {
    AnalyticsService.trackFeatureUsage("document-analyzer", false, Date.now() - startTime);
    console.error("[AI Analyzer Error]", error);
    res.status(500).json({ error: error.message || "Failed to analyze document" });
  }
}
async function handleGeneratePrompt(req, res) {
  const startTime = Date.now();
  try {
    const { templateId, providerId, markdown, title, wordCount, readingTime, language } = req.body;
    if (!markdown || !templateId || !providerId) {
      return res.status(400).json({ error: "Missing required fields: markdown, templateId, providerId" });
    }
    const prompts = PromptTemplateRegistry.getAll();
    const templateExists = prompts.some((t) => t.id === templateId);
    if (!templateExists) {
      return res.status(400).json({ error: `Invalid template ID: ${templateId}` });
    }
    const result = PromptGeneratorService.generate(
      templateId,
      providerId,
      markdown,
      { title, wordCount, readingTime, language }
    );
    if (!result) {
      return res.status(500).json({ error: "Failed to generate prompt" });
    }
    const formattedPrompt = PromptGeneratorService.formatForProvider(
      result.prompt,
      providerId
    );
    AnalyticsService.trackFeatureUsage("prompt-generator", true, Date.now() - startTime);
    res.json({
      success: true,
      prompt: result,
      formattedPrompt
    });
  } catch (error) {
    AnalyticsService.trackFeatureUsage("prompt-generator", false, Date.now() - startTime);
    console.error("[Prompt Generator Error]", error);
    res.status(500).json({ error: error.message || "Failed to generate prompt" });
  }
}
async function handleGenerateRAG(req, res) {
  const startTime = Date.now();
  try {
    const { markdown, chunkSize, format, title, language } = req.body;
    if (!markdown) {
      return res.status(400).json({ error: "Missing markdown content" });
    }
    const validSizes = [256, 512, 1024];
    const size = validSizes.includes(Number(chunkSize)) ? Number(chunkSize) : 512;
    const validFormats = ["json", "jsonl", "markdown", "txt"];
    const fmt = validFormats.includes(format) ? format : "json";
    const result = RAGExportService.export(markdown, {
      chunkSize: size,
      format: fmt,
      includeMetadata: true,
      source: "convertoneai",
      language: language || "en",
      title: title || "Untitled Document"
    });
    const output = RAGExportService.getFormattedOutput(result.chunks, fmt);
    AnalyticsService.trackFeatureUsage("rag-export", true, Date.now() - startTime);
    res.json({
      success: true,
      result,
      output
    });
  } catch (error) {
    AnalyticsService.trackFeatureUsage("rag-export", false, Date.now() - startTime);
    console.error("[RAG Export Error]", error);
    res.status(500).json({ error: error.message || "Failed to generate RAG dataset" });
  }
}
async function handleExport(req, res) {
  const startTime = Date.now();
  try {
    const { format, markdown, cleanMarkdown, aiMarkdown, metadata } = req.body;
    if (!markdown || !format) {
      return res.status(400).json({ error: "Missing required fields: markdown, format" });
    }
    const result = AIExportService.export({
      format,
      markdown,
      cleanMarkdown,
      aiMarkdown,
      metadata
    });
    if (!result) {
      return res.status(400).json({ error: `Invalid export format: ${format}` });
    }
    AnalyticsService.trackFeatureUsage("ai-export", true, Date.now() - startTime);
    res.json({
      success: true,
      export: result
    });
  } catch (error) {
    AnalyticsService.trackFeatureUsage("ai-export", false, Date.now() - startTime);
    console.error("[AI Export Error]", error);
    res.status(500).json({ error: error.message || "Failed to export document" });
  }
}
async function handleFullProcess(req, res) {
  const startTime = Date.now();
  try {
    const { markdown, fileName, pageCount, cleanForAI, generateSummary } = req.body;
    if (!markdown || !fileName) {
      return res.status(400).json({ error: "Missing required fields: markdown, fileName" });
    }
    const pipeline = ProcessingPipeline.getInstance();
    const result = await pipeline.run({
      fileId: `file-${Date.now()}`,
      fileName,
      markdown,
      pageCount,
      cleanForAI: cleanForAI !== false,
      generateSummary: generateSummary !== false
    });
    AnalyticsService.trackFeatureUsage("ai-full-process", true, Date.now() - startTime);
    res.json({
      success: true,
      result,
      processingTimeMs: Date.now() - startTime
    });
  } catch (error) {
    AnalyticsService.trackFeatureUsage("ai-full-process", false, Date.now() - startTime);
    console.error("[AI Full Process Error]", error);
    res.status(500).json({ error: error.message || "Failed to process document" });
  }
}
async function handleCancelProcessing(req, res) {
  try {
    const pipeline = ProcessingPipeline.getInstance();
    pipeline.cancel();
    res.json({ success: true, message: "Processing cancelled" });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to cancel processing" });
  }
}
async function handleGetTemplates(req, res) {
  try {
    const templates = PromptTemplateRegistry.getAll();
    res.json({
      success: true,
      templates: templates.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        icon: t.icon
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to retrieve templates" });
  }
}
async function handleGetAnalytics(req, res) {
  try {
    const snapshot = AnalyticsService.getSnapshot();
    res.json({
      success: true,
      analytics: snapshot
    });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to retrieve analytics" });
  }
}

// server/routes/api.ts
var import_express_rate_limit = __toESM(require("express-rate-limit"), 1);
var router = (0, import_express.Router)();
var apiLimiter = (0, import_express_rate_limit.default)({
  windowMs: 15 * 60 * 1e3,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." }
});
var convertLimiter = (0, import_express_rate_limit.default)({
  windowMs: 15 * 60 * 1e3,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Conversion limit reached. Please try again later." }
});
var contactLimiter = (0, import_express_rate_limit.default)({
  windowMs: 15 * 60 * 1e3,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many contact submissions. Please try again later." }
});
var aiLimiter = (0, import_express_rate_limit.default)({
  windowMs: 15 * 60 * 1e3,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "AI processing limit reached. Please try again later." }
});
var adminLoginLimiter = (0, import_express_rate_limit.default)({
  windowMs: 15 * 60 * 1e3,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts. Please try again later." }
});
var adminLoginPath = process.env.ADMIN_LOGIN_PATH || "/auth/admin/login";
router.post(adminLoginPath, adminLoginLimiter, handleAdminLogin);
router.get("/stats", apiLimiter, requireApiKey, (req, res) => {
  res.json(getStats());
});
router.post("/convert", convertLimiter, handleConversion);
router.post("/contact", contactLimiter, handleContactForm);
router.post("/ai/clean", aiLimiter, handleCleanDocument);
router.post("/ai/analyze", aiLimiter, handleAnalyzeDocument);
router.post("/ai/prompt", aiLimiter, handleGeneratePrompt);
router.post("/ai/rag", aiLimiter, handleGenerateRAG);
router.post("/ai/export", aiLimiter, handleExport);
router.post("/ai/process", aiLimiter, handleFullProcess);
router.post("/ai/cancel", aiLimiter, handleCancelProcessing);
router.post("/ai/analytics/track", apiLimiter, (req, res) => {
  res.json({ success: true });
});
router.get("/ai/templates", apiLimiter, handleGetTemplates);
router.get("/admin/ai/analytics", apiLimiter, requireAdminAuth, (req, res) => {
  handleGetAnalytics(req, res);
});
router.get("/admin/stats", apiLimiter, requireAdminAuth, (req, res) => {
  res.json(getStats());
});
var api_default = router;

// server.ts
if (process.env.NODE_ENV !== "production") {
  import_dotenv.default.config();
}
var app = (0, import_express2.default)();
var PORT = parseInt(String(process.env.PORT ?? "")) || 3e3;
app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(
  (0, import_helmet.default)({
    contentSecurityPolicy: false,
    // Handled by frontend or configured for API
    crossOriginEmbedderPolicy: false
  })
);
var apiLimiter2 = (0, import_express_rate_limit2.default)({
  windowMs: 15 * 60 * 1e3,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." }
});
var isAllowedOrigin = (origin) => {
  if (!origin) return true;
  const explicit = [process.env.FRONTEND_URL].filter(Boolean);
  const local = ["http://localhost:5173", "http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:5173", "http://127.0.0.1:3000", "http://127.0.0.1:3001"];
  if (explicit.includes(origin) || local.includes(origin)) return true;
  if (/https:\/\/.+\.vercel\.app$/i.test(origin)) return true;
  return false;
};
app.use(
  (0, import_cors.default)({
    origin: isAllowedOrigin,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "x-api-key"],
    credentials: true
  })
);
app.use((0, import_compression.default)());
app.use(import_express2.default.json({ limit: "50mb" }));
app.use(import_express2.default.urlencoded({ limit: "50mb", extended: true }));
var PERSIST_DIR = process.env.PERSIST_DIR || import_path.default.join(process.cwd(), process.platform === "win32" ? "tmp" : "tmp");
if (!import_fs.default.existsSync(PERSIST_DIR)) {
  import_fs.default.mkdirSync(PERSIST_DIR, { recursive: true });
}
var SUBMISSIONS_FILE = import_path.default.join(PERSIST_DIR, "contact_submissions.json");
var STATS_FILE = import_path.default.join(PERSIST_DIR, "stats.json");
var distPath = import_path.default.resolve(process.cwd(), "dist");
var isProduction = process.env.NODE_ENV === "production";
if (isProduction || import_fs.default.existsSync(distPath)) {
  console.log(`[Server] Serving static files from: ${distPath}`);
  app.use(import_express2.default.static(distPath));
}
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", service: "convertoneai-api", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
});
app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok", service: "convertoneai-api", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
});
DocumentTypeRegistry.initialize();
PromptTemplateRegistry.initialize();
ExportRegistry.initialize();
app.use("/api", api_default);
var indexHtmlPath = import_path.default.resolve(distPath, "index.html");
if (isProduction || import_fs.default.existsSync(distPath) && import_fs.default.existsSync(indexHtmlPath)) {
  console.log("[Server] SPA fallback registered");
  app.get("*", (_req, res) => {
    res.sendFile(indexHtmlPath);
  });
}
app.use((req, res) => {
  if ((isProduction || import_fs.default.existsSync(indexHtmlPath)) && req.accepts("html")) {
    return res.sendFile(indexHtmlPath);
  }
  res.status(404).json({ error: "Not Found" });
});
app.use((err, req, res, next) => {
  console.error("[Server] Unhandled error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});
function createApp() {
  return app;
}
async function startServer(port = PORT) {
  const runtimePort = parseInt(String(process.env.PORT ?? "")) || port;
  const isRailway = Boolean(process.env.RAILWAY_PROJECT_ID || process.env.RAILWAY_SERVICE_ID || process.env.RAILWAY_ENVIRONMENT_NAME);
  const isDevelopment = process.env.NODE_ENV === "development" || process.env.NODE_ENV === "dev" || !process.env.NODE_ENV && !isRailway;
  if (isDevelopment) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
    console.log("[Server] Vite development middleware mounted successfully.");
  } else {
    console.log("[Server] Running in production mode without Vite middleware.");
  }
  const server = app.listen(runtimePort, "0.0.0.0", () => {
    console.log(`[Server] ConvertOneAI server listening on port ${runtimePort}`);
    console.log(`[Server] Persistence dir: ${PERSIST_DIR}`);
    console.log(`[Server] Admin login endpoint: POST /api${process.env.ADMIN_LOGIN_PATH || "/auth/admin/login"}`);
  });
  const shutdown = (signal) => {
    console.log(`[Server] Received ${signal}, shutting down gracefully.`);
    server.close(() => process.exit(0));
  };
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
  return server;
}
if (process.env.NODE_ENV !== "test") {
  void startServer().catch((error) => {
    console.error("[Server] Failed to start server:", error);
    process.exit(1);
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createApp,
  startServer
});
//# sourceMappingURL=server.cjs.map
