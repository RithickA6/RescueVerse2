const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  res.status(statusCode).json({
    status: 'success',
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      totalScore: user.totalScore,
      totalSimulations: user.totalSimulations,
      badges: user.badges,
    },
  });
};

async function uniqueUsername(base) {
  let username = (base || 'user').replace(/[^a-zA-Z0-9_]/g, '').slice(0, 20) || 'user';
  if (username.length < 3) username = `user${username}`;
  const root = username;
  let n = 0;
  while (await User.findOne({ username })) {
    n += 1;
    username = `${root}${n}`.slice(0, 30);
  }
  return username;
}

const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'game-96c46';
let cachedCerts = null;
let cachedCertsAt = 0;

async function getGoogleCerts() {
  const now = Date.now();
  if (cachedCerts && now - cachedCertsAt < 60 * 60 * 1000) return cachedCerts;
  const res = await fetch(
    'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com'
  );
  if (!res.ok) throw new Error('Failed to fetch Google signing certificates');
  cachedCerts = await res.json();
  cachedCertsAt = now;
  return cachedCerts;
}

// Verify Firebase ID token with Google public keys (works even when the
// web API key is restricted to browser referrers).
async function verifyFirebaseIdToken(idToken) {
  const certs = await getGoogleCerts();
  const decoded = jwt.decode(idToken, { complete: true });
  if (!decoded?.header?.kid) {
    const err = new Error('Invalid Firebase token');
    err.status = 401;
    throw err;
  }
  const cert = certs[decoded.header.kid];
  if (!cert) {
    cachedCerts = null;
    const err = new Error('Firebase token signed with unknown key');
    err.status = 401;
    throw err;
  }
  try {
    return jwt.verify(idToken, cert, {
      algorithms: ['RS256'],
      audience: FIREBASE_PROJECT_ID,
      issuer: `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`,
    });
  } catch (e) {
    const err = new Error(e.message || 'Invalid Firebase token');
    err.status = 401;
    throw err;
  }
}

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please provide username, email, and password' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(409).json({
        message: existingUser.email === email ? 'Email already registered' : 'Username already taken',
      });
    }

    const user = await User.create({ username, email, password });
    createSendToken(user, 201, res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    createSendToken(user, 200, res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/auth/google — verify Firebase ID token, upsert user, return JWT
exports.googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ message: 'Firebase idToken is required' });
    }

    const payload = await verifyFirebaseIdToken(idToken);
    if (!payload.email) {
      return res.status(401).json({ message: 'Google account has no email' });
    }

    const email = String(payload.email).toLowerCase();
    const displayName = payload.name || email.split('@')[0];
    const photoUrl = payload.picture || 'default';

    let user = await User.findOne({ email });

    if (!user) {
      const username = await uniqueUsername(displayName);
      user = await User.create({
        username,
        email,
        password: crypto.randomBytes(32).toString('hex'),
        avatar: photoUrl,
      });
    } else if (photoUrl !== 'default' && user.avatar === 'default') {
      user.avatar = photoUrl;
      await user.save();
    }

    createSendToken(user, 200, res);
  } catch (error) {
    console.error('[auth/google]', error.message);
    const status = error.status || 500;
    res.status(status).json({ message: error.message || 'Google sign-in failed' });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  res.json({ status: 'success', user: req.user });
};
