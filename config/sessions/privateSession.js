import { Sessions } from "../models/sessionSchema.js";
import { verifyValue } from "../utils/cookieSignature.js";

const privateAuthMiddleware = async (req, res, next) => {
  try {
    const cookieName = "private_session_id";
    const cookiePath = "/private";

    // Check for private session cookie
    const rawCookie = req.headers.cookie || "";
    const match = rawCookie.match(new RegExp(`${cookieName}=([^;]+)`));
    let sessionId = null;

    if (match) {
      const rawSigned = decodeURIComponent(match[1]);
      sessionId = verifyValue(rawSigned, process.env.SESSION_SECRET);
    }

    if (!sessionId) {
      return res.status(401).json({ error: "No private session" });
    }

    // Find session in DB
    const session = await Sessions.findOne({
      privateSessionId: sessionId,
      endsAt: { $gt: new Date() },
    });

    if (!session || !session.user_id) {
      return res.status(401).json({ error: "Invalid or expired private session" });
    }

    // Optionally validate X-Session-Token
    const sessionToken = req.headers["x-session-token"];
    if (sessionToken && verifyValue(sessionToken, process.env.SESSION_SECRET) !== sessionId) {
      return res.status(401).json({ error: "Session token mismatch" });
    }

    // Attach session to request
    req.session = {
      privateSessionId: sessionId,
      user_id: session.user_id,
    };

    next();
  } catch (err) {
    console.error("Private auth middleware error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default privateAuthMiddleware;