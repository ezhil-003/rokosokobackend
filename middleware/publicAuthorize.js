import { v7 as uuidv7 } from "uuid";
import { Sessions } from "../models/sessionSchema.js";
import { signValue, verifyValue } from "../utils/cookieSignature.js";

const publicAuthorize = async (req, res, next) => {
  try {
    const cookieName = "public_session_id";
    const cookiePath = "/";

    // Check for existing public session cookie
    const rawCookie = req.headers.cookie || "";
    const match = rawCookie.match(new RegExp(`${cookieName}=([^;]+)`));
    let sessionId = null;

    if (match) {
      const rawSigned = decodeURIComponent(match[1]);
      sessionId = verifyValue(rawSigned, process.env.SESSION_SECRET);
    }

    let sessionData = null;

    if (sessionId) {
      // Check if session exists in DB and is not expired
      const existingSession = await Sessions.findOne({
        publicSessionId: sessionId,
        endsAt: { $gt: new Date() },
      });

      if (existingSession) {
        // Update expiration
        existingSession.endsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await existingSession.save();
        sessionData = {
          publicSessionId: sessionId,
        };
      }
    }

    // Create new session if no valid session exists
    if (!sessionData) {
      sessionId = uuidv7();
      // Note: user_id is required; using placeholder until schema is updated
      const newSession = new Sessions({
        publicSessionId: sessionId,
        privateSessionId: null,
        user_id: null, // Temporary; needs schema update
        createdAt: new Date(),
        endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
      await newSession.save();
      sessionData = {
        publicSessionId: sessionId,
        user_id: newSession.user_id,
      };
    }

    // Attach session to request
    req.session = sessionData;

    // Set public_session_id cookie
    const signedSessionId = signValue(sessionId, process.env.SESSION_SECRET);
    res.cookie(cookieName, signedSessionId, {
      path: cookiePath,
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Set X-Session-Token header
    res.setHeader("X-Session-Token", signedSessionId);

    next();
  } catch (err) {
    console.error("Public authorize middleware error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default publicAuthorize;