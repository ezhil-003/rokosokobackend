import { Sessions } from "../models/sessionSchema.js";
import { verifyValue } from "../utils/cookieSignature.js";
import { User } from "../models/userSchema.js";

const privateAuthorize = async (req, res, next) => {
  try {
    const cookieName = "private_session_id";

    // Check for private session cookie
    const rawCookie = req.headers.cookie || "";
    const match = rawCookie.match(new RegExp(`${cookieName}=([^;]+)`));
    let sessionId = null;

    if (match) {
      const rawSigned = decodeURIComponent(match[1]);
      sessionId = verifyValue(rawSigned, process.env.SESSION_SECRET);
    }

    if (!sessionId) {
      return res.status(401).json({ error: "Unauthorized user, please log in." });
    }

    // Check if session exists in DB and is not expired
    const existingSession = await Sessions.findOne({
      privateSessionId: sessionId,
      endsAt: { $gt: new Date() },
    }) // Populate user details if needed

    if (!existingSession) {
      return res.status(401).json({ error: "Unauthorized user, session expired or invalid." });
    }

    // At this point, the session is valid. You can attach the user to the request.
    req.user = existingSession.user_id;
    req.session = existingSession; // Optionally attach the whole session object

    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    console.error("Private authorize middleware error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default privateAuthorize;