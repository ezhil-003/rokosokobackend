import { v7 as uuidv7 } from "uuid";
import { Sessions } from "../../models/sessionSchema.js";
import { signValue, verifyValue } from "../../utils/cookieSignature.js";

const publicSessionController = async (req, res) => {
  try {
    const cookieName = "public_session_id";
    const cookiePath = "/public";

    // Check for existing public session cookie
    const rawCookie = req.headers.cookie || "";
    console.log("raw cookie:",rawCookie)
    const match = rawCookie.match(new RegExp(`${cookieName}=([^;]+)`));
    console.log("match check:",match)
    let sessionId = null;

    if (match) {
      const rawSigned = decodeURIComponent(match[1]);
      sessionId = verifyValue(rawSigned, process.env.SESSION_SECRET);
      console.log("verified session id:",sessionId)
    }

    let sessionData = null;

    if (sessionId) {
      // Check if session exists in DB and is not expired
      const existingSession = await Sessions.findOne({
        publicSessionId: sessionId,
      });
      console.log("exsisting Session:",existingSession)

      if (existingSession) {
        // Update expiration
        // 
        console.log("existing session check:",existingSession)
        existingSession.endsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await existingSession.save();
        sessionData = {
          publicSessionId: sessionId,
          user_id: existingSession.user_id,
        };
      }
    }

    // Create new session if no valid session exists
    if (!sessionData) {
      sessionId = uuidv7();
      // Note: user_id is required, so we need a valid user_id
      // This is a limitation; we may need to adjust schema for guest sessions
      const newSession = new Sessions({
        publicSessionId: sessionId,
        privateSessionId: null, // Set during login
        user_id: null, // Temporary; needs real user_id
        createdAt: new Date(),
        endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
      console.log("newSession check:",newSession)
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
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    
    
    console.log("cookie check",res)

    // Set X-Session-Token header
    res.setHeader("X-Session-Token", signedSessionId);

    // Send response
    res.json({ message: "Hello from Node API" });
  } catch (err) {
    console.error("Public session controller error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default publicSessionController;
