import { Sessions } from '../../models/sessionSchema.js';
import { err, ok, ResultAsync } from 'neverthrow';
import { verifyValue } from '../../utils/cookieSignature.js';

export const logout = async (req, res) => {
  try {
    
    const cookieName = "private_session_id"
    // Check for existing public session cookie
    const rawCookie = req.headers.cookie || "";
    const match = rawCookie.match(new RegExp(`${cookieName}=([^;]+)`));
    let sessionId = null;

    if (match) {
      const rawSigned = decodeURIComponent(match[1]);
      sessionId = verifyValue(rawSigned, process.env.SESSION_SECRET);
    }

    if (!sessionId) {
      return res.status(400).json({ message: 'Session ID not found in cookies' });
    }

    // Delete the session from MongoDB
    const result = await ResultAsync.fromPromise(
      Sessions.deleteOne({ privateSessionId: sessionId }),
      (error) => new Error('Database error while deleting session')
    );

    return result.match(
      (deleted) => {
        if (deleted.deletedCount === 0) {
          return res.status(404).json({ message: 'No active session found to delete' });
        }
        res.clearCookie('private_session_id');
        return res.status(200).json({ message: 'Logged out successfully' });
      },
      (e) => {
        console.error('Logout error:', e);
        return res.status(500).json({ message: 'Server error during logout' });
      }
    );
  } catch (err) {
    console.error('Unexpected logout error:', err);
    return res.status(500).json({ message: 'Unexpected server error during logout' });
  }
};