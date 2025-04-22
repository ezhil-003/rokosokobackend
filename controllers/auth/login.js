import { v7 as uuidv7 } from "uuid";
import { User } from "../../models/userSchema.js";
import { Sessions } from "../../models/sessionSchema.js";
import bcrypt from "bcrypt";
import { generateUsername } from "../../utils/generateUsername.js";
import { customLoginSchema, socialLoginSchema } from "../../zodSchemas/loginSchema.js";
import { signValue, verifyValue } from "../../utils/cookieSignature.js";

export const loginUser = async (req, res) => {
  const { auth_provider } = req.body;
  try {
    // ---------- CUSTOM LOGIN FLOW ----------
    if (auth_provider === "custom") {
      const parseResult = customLoginSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ error: parseResult.error.flatten() });
      }

      const { email, password } = parseResult.data;

      const existingUser = await User.findOne({ email, auth_provider: "custom" }).select("+password");

      if (!existingUser || !(await bcrypt.compare(password, existingUser.password))) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Check for existing public session cookie
      const rawCookie = req.headers.cookie || "";
      const publicMatch = rawCookie.match(/public_session_id=([^;]+)/);
      let publicSessionId = null;

      if (publicMatch) {
        const rawSigned = decodeURIComponent(publicMatch[1]);
        publicSessionId = verifyValue(rawSigned, process.env.SESSION_SECRET);
      }

      // Generate private session ID
      const privateSessionId = uuidv7();

      // Update or create session
      let session = null;
      if (publicSessionId) {
        // Update existing session with privateSessionId
        session = await Sessions.findOneAndUpdate(
          { publicSessionId, user_id: existingUser._id },
          {
            privateSessionId,
            createdAt: new Date(),
            endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
          { new: true }
        );
      }

      if (!session) {
        // Create new session if no matching public session
        session = new Sessions({
          publicSessionId: publicSessionId || uuidv7(), // Fallback if no public session
          privateSessionId,
          user_id: existingUser._id,
          createdAt: new Date(),
          endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
        await session.save();
      }

      // Set private_session_id cookie
      const signedPrivateSessionId = signValue(privateSessionId, process.env.SESSION_SECRET);
      res.cookie("private_session_id", signedPrivateSessionId, {
        path: "/api",
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Set X-Session-Token header
      res.setHeader("X-Session-Token", signedPrivateSessionId);

      return res.status(200).json({ user: existingUser });
    }

    // ---------- SOCIAL LOGIN FLOW ----------
    else if (auth_provider === "google" || auth_provider === "facebook") {
      const parseResult = socialLoginSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ error: parseResult.error.flatten() });
      }

      const {
        uid,
        displayName,
        email,
        photoURL,
        mobile,
        country,
        stsTokenManager: { accessToken, refreshToken, expirationTime },
      } = parseResult.data.user;

      let socialUser = await User.findOne({ email, auth_provider });

      if (!socialUser) {
        const username = generateUsername(displayName);
        socialUser = new User({
          uid,
          email,
          auth_provider,
          username,
          mobile,
          country,
          profilePicUrl: photoURL,
        });
        await socialUser.save();
      }

      // Check for existing public session cookie
      const rawCookie = req.headers.cookie || "";
      const publicMatch = rawCookie.match(/public_session_id=([^;]+)/);
      let publicSessionId = null;

      if (publicMatch) {
        const rawSigned = decodeURIComponent(publicMatch[1]);
        publicSessionId = verifyValue(rawSigned, process.env.SESSION_SECRET);
      }

      // Generate private session ID
      const privateSessionId = uuidv7();

      // Update or create session
      let session = null;
      if (publicSessionId) {
        session = await Sessions.findOneAndUpdate(
          { publicSessionId, user_id: socialUser._id },
          {
            privateSessionId,
            accessToken,
            refreshToken,
            createdAt: new Date(),
            // endsAt: new Date(Number(expirationTime)),
          },
          { new: true }
        );
      }

      // Set private_session_id cookie
      const signedPrivateSessionId = signValue(privateSessionId, process.env.SESSION_SECRET);
      res.cookie("private_session_id", signedPrivateSessionId, {
        path: "/api",
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Set X-Session-Token header
      res.setHeader("X-Session-Token", signedPrivateSessionId);

      return res.status(200).json({ user: socialUser });
    }

    return res.status(400).json({ error: "Unsupported auth provider" });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};