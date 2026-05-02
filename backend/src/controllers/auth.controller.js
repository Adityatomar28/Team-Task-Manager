const bcrypt = require("bcryptjs");
const prisma = require("../db/prisma");
const { signToken } = require("../utils/jwt");
const {
  isNonEmptyString,
  isValidEmail,
  isStrongPassword,
  isEnumValue,
} = require("../utils/validators");

const GLOBAL_ROLES = ["ADMIN", "MEMBER"];

async function signup(req, res, next) {
  try {
    const { name, email, password, globalRole } = req.body;

    if (!isNonEmptyString(name) || !isValidEmail(email) || !isStrongPassword(password)) {
      return res.status(400).json({
        success: false,
        message: "Invalid name, email, or password (min 6 characters)",
      });
    }

    if (globalRole && !isEnumValue(globalRole, GLOBAL_ROLES)) {
      return res.status(400).json({
        success: false,
        message: "Invalid global role",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase(),
        password: hashedPassword,
        ...(globalRole ? { globalRole } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        globalRole: true,
        createdAt: true,
      },
    });

    const token = signToken({ userId: user.id });

    return res.status(201).json({
      success: true,
      message: "Signup successful",
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!isValidEmail(email) || !isStrongPassword(password)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password format",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = signToken({ userId: user.id });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          globalRole: user.globalRole,
        },
      },
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  signup,
  login,
};
