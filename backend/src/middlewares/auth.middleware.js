const jwt = require("jsonwebtoken");
const { createClerkClient, verifyToken } = require("@clerk/backend");
const prisma = require("../db/prisma");

function getBearerToken(req) {
  const authHeader = req.headers.authorization;
  return authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
}

async function findUserByLocalJwt(token) {
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;

  const decoded = jwt.verify(token, secret);
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: {
      id: true,
      name: true,
      email: true,
      globalRole: true,
    },
  });

  return user || null;
}

async function findOrCreateUserByClerkToken(token) {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) return null;

  const clerkClient = createClerkClient({ secretKey });
  const tokenPayload = await verifyToken(token, { secretKey });
  if (!tokenPayload?.sub) return null;

  const clerkUserId = tokenPayload.sub;
  const clerkUser = await clerkClient.users.getUser(clerkUserId);
  const primaryEmailId = clerkUser.primaryEmailAddressId;
  const primaryEmail = clerkUser.emailAddresses.find(
    (emailObj) => emailObj.id === primaryEmailId
  )?.emailAddress;

  if (!primaryEmail) return null;

  const fullName = [clerkUser.firstName, clerkUser.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  const fallbackName = clerkUser.username || primaryEmail.split("@")[0];
  const resolvedName = fullName || fallbackName;

  const user = await prisma.user.upsert({
    where: { email: primaryEmail.toLowerCase() },
    update: {
      clerkId: clerkUserId,
      name: resolvedName,
    },
    create: {
      clerkId: clerkUserId,
      email: primaryEmail.toLowerCase(),
      name: resolvedName,
      // Local password login remains separate; this placeholder is never shown.
      password: "__CLERK_EXTERNAL_AUTH__",
    },
    select: {
      id: true,
      name: true,
      email: true,
      globalRole: true,
    },
  });

  return user;
}

async function requireAuth(req, res, next) {
  try {
    const token = getBearerToken(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    let user = null;
    try {
      user = await findUserByLocalJwt(token);
    } catch (jwtError) {
      user = null;
    }

    if (!user) {
      try {
        user = await findOrCreateUserByClerkToken(token);
      } catch (clerkError) {
        user = null;
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
}

function requireGlobalRole(...roles) {
  return function globalRoleGuard(req, res, next) {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!roles.includes(req.user.globalRole)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized for this action",
      });
    }

    return next();
  };
}

module.exports = {
  requireAuth,
  requireGlobalRole,
};
