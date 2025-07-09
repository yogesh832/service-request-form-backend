import * as authService from "../services/authService.js";
import { signToken } from "../utils/jwtUtils.js";
import { sendEmail } from "../services/emailService.js";
import { passwordResetEmail, welcomeEmail } from "../utils/emailTemplates.js";

// Helper: send token in cookie + response
const sendAuthToken = (user, statusCode, res, message) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  res.status(statusCode).json({
    status: "success",
    message,
    token,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePhoto: user.profilePhoto || null,
        createdAt:user.createdAt,
      },
    },
  });
};

// export const register = async (req, res) => {
//   try {
//     const user = await authService.registerUser(req.body);

//     await sendEmail({
//       to: user.email,
//       subject: `Welcome to SalkaTech, ${user.name}`,
//       html: welcomeEmail(user.name)
//     });

//     sendAuthToken(user, 201, res, "User registered successfully");
//   } catch (error) {
//     const message =
//       error.code === 11000 || error.message.includes("duplicate")
//         ? "User already exists with this email"
//         : error.message || "Registration failed";
//     res.status(400).json({ status: "error", message });
//   }
// };
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body; // Extract directly

    console.log("📥 Request body:", req.body);

    const user = await authService.registerUser(req.body);
console.log(name, email, password);
    console.log("✅ Registered user:", user); // confirm name, email

    await sendEmail({
      to: email,
      subject: `Welcome to SalkaTech, ${name}`,
      html: welcomeEmail({ name, email, password }) // ← all directly passed
    });

    sendAuthToken(user, 201, res, "User registered successfully");

  } catch (error) {
    const message =
      error.code === 11000 || error.message.includes("duplicate")
        ? "User already exists with this email"
        : error.message || "Registration failed";

    res.status(400).json({ status: "error", message });
  }
};


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ status: "error", message: "Email and password are required" });
    }

    const user = await authService.loginUser(email, password);
    sendAuthToken(user, 200, res, "Login successful");
  } catch (error) {
    const message =
      error.message === "Invalid credentials"
        ? "Incorrect email or password"
        : error.message || "Login failed";
    res.status(401).json({ status: "error", message });
  }
};

// export const forgotPassword = async (req, res) => {
//   try {
//     const { email } = req.body;

//     if (!email) {
//       return res.status(400).json({ status: 'error', message: 'Email is required' });
//     }

//     const { user, resetToken } = await authService.forgotPasswordUser(email);

//     const resetURL = `https://service-request-jhgh.vercel.app/reset-password/${resetToken}`;

//     await sendEmail({
//       to: user.email,
//       subject: 'Password Reset',
//       html: passwordResetEmail({ name: user.name, resetURL })
//     });

//     res.status(200).json({ status: 'success', message: 'Password reset link sent to your email' });
//   } catch (error) {
//     const message = error.message === 'User not found'
//       ? 'No account found with this email'
//       : error.message || 'Something went wrong';
//     res.status(404).json({ status: 'error', message });
//   }
// };
export const forgotPassword = async (req, res) => {
  try {
    const { email, origin } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ status: "error", message: "Email is required" });
    }

    if (!origin) {
      return res.status(400).json({ status: 'error', message: 'Origin is required' });
    }

    const { user, resetToken } = await authService.forgotPasswordUser(email);

    const resetURL = `${origin || "https://salka-tech-service-request-form.vercel.app"}/reset-password/${resetToken}`; // ✅ dynamic reset URL

    await sendEmail({
      to: user.email,
      subject: "Password Reset",
      html: passwordResetEmail({ name: user.name, resetURL }),
    });

    res
      .status(200)
      .json({
        status: "success",
        message: "Password reset link sent to your email",
      });
  } catch (error) {
    const message =
      error.message === "User not found"
        ? "No account found with this email"
        : error.message || "Something went wrong";
    res.status(404).json({ status: "error", message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res
        .status(400)
        .json({ status: "error", message: "New password is required" });
    }

    const user = await authService.resetPasswordUser(token, password);
    sendAuthToken(user, 200, res, "Password has been reset successfully");
  } catch (error) {
    const message = error.message.includes("Token")
      ? "Invalid or expired token"
      : error.message || "Could not reset password";
    res.status(400).json({ status: "error", message });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({
          status: "error",
          message: "Both current and new password are required",
        });
    }

    const user = await authService.updatePasswordUser(
      req.user.id,
      currentPassword,
      newPassword
    );
    sendAuthToken(user, 200, res, "Password updated successfully");
  } catch (error) {
    const message =
      error.message === "Incorrect current password"
        ? "Your current password is incorrect"
        : error.message || "Could not update password";
    res.status(400).json({ status: "error", message });
  }
};

export const logout = (req, res) => {
  res.cookie("jwt", "", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res
    .status(200)
    .json({ status: "success", message: "Logged out successfully" });
};
