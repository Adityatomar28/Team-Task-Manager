const jwt = require("jsonwebtoken");
const { createClerkClient, verifyToken } = require("@clerk/backend");
const prisma = require("../db/prisma");

function getBearerToken(req) {
  const authHeader = req.headers.authorization;
  return authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
}

function canUseDevAuth() {
  return process.env.NODE_ENV !== "production";
}

const USER_SELECT = {
  id: true,
  name: true,
  email: true,
  globalRole: true,
};

async function findUserByLocalJwt(token) {
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;

  const decoded = jwt.verify(token, secret);
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: USER_SELECT,
  });

  return user || null;
}

async function findOrCreateUserByClerkToken(token) {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey || secretKey === "YOUR_CLERK_SECRET_KEY") {
    const error = new Error("CLERK_SECRET_KEY is missing or not configured");
    error.code = "CLERK_CONFIG_MISSING";
    throw error;
  }

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
    select: USER_SELECT,
  });

  return user;
}

async function findOrCreateUserByDevHeaders(req) {
  if (!canUseDevAuth()) return null;

  const clerkId = req.headers["x-clerk-user-id"];
  const email = req.headers["x-clerk-user-email"];
  const name = req.headers["x-clerk-user-name"];

  if (!clerkId || !email) return null;

  const normalizedEmail = String(email).toLowerCase();
  const resolvedName = String(name || normalizedEmail.split("@")[0]).trim();
  const normalizedClerkId = String(clerkId);

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { clerkId: normalizedClerkId },
        { email: normalizedEmail },
      ],
    },
    select: { id: true },
  });

  if (existingUser) {
    return prisma.user.update({
      where: { id: existingUser.id },
      data: {
        clerkId: normalizedClerkId,
        email: normalizedEmail,
        name: resolvedName,
      },
      select: USER_SELECT,
    });
  }

  const user = await prisma.user.create({
    data: {
      clerkId: normalizedClerkId,
      email: normalizedEmail,
      name: resolvedName,
      password: "__CLERK_DEV_AUTH__",
    },
    select: USER_SELECT,
  });

  return user;
}

async function findOrCreateLocalDevUser() {
  if (!canUseDevAuth()) return null;

  const email = (process.env.DEV_AUTH_EMAIL || "developer@teamsync.local").toLowerCase();
  const name = process.env.DEV_AUTH_NAME || "Local Developer";

  return prisma.user.upsert({
    where: { email },
    update: { name },
    create: {
      email,
      name,
      password: "__LOCAL_DEV_AUTH__",
    },
    select: USER_SELECT,
  });
}

async function findDevUser(req) {
  return (await findOrCreateUserByDevHeaders(req)) || findOrCreateLocalDevUser();
}

async function requireAuth(req, res, next) {
  try {
    const token = getBearerToken(req);

    if (!token) {
      const fallbackUser = await findDevUser(req);
      if (fallbackUser) {
        req.user = fallbackUser;
        return next();
      }

      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    let user = await findOrCreateUserByDevHeaders(req);

    try {
      user = user || await findUserByLocalJwt(token);
    } catch (jwtError) {
      user = user || null;
    }

    if (!user) {
      try {
        user = await findOrCreateUserByClerkToken(token);
      } catch (clerkError) {
        console.error("Clerk token verification failed:", clerkError);
        if (clerkError?.code === "CLERK_CONFIG_MISSING") {
          return res.status(500).json({
            success: false,
            message: "Server auth is not configured. Set CLERK_SECRET_KEY in backend .env",
          });
        }
        if (process.env.NODE_ENV === "production") {
          return res.status(401).json({
            success: false,
            message:
              "Clerk authentication failed. Check that backend CLERK_SECRET_KEY matches the frontend VITE_CLERK_PUBLISHABLE_KEY.",
          });
        }
        user = null;
      }
    }

    if (!user) {
      user = await findOrCreateLocalDevUser();
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
