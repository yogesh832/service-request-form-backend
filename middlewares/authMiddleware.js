// middlewares/authMiddleware.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import AppError from '../utils/appError.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    // 1. Check for Bearer token in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
   
    }
    // 2. Fallback: check for JWT token in cookies (optional)
    else if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
      console.log('Received Cookie Token:', token);
    }

    // 3. If no token found, block access
    if (!token) {
      return next(
        new AppError('You are not logged in! Please log in to get access.', 401)
      );
    }

    // 4. Verify token validity (throws error if invalid or expired)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 5. Check if user still exists in DB
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(
        new AppError('The user belonging to this token no longer exists.', 401)
      );
    }

    // 6. Attach user info to req object for later middleware or routes
    req.user = currentUser;

    // 7. Continue to next middleware or route handler
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    next(error);
  }
};


export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};

// middlewares/authMiddleware.js

// import jwt from 'jsonwebtoken';
// import User from '../models/User.js';
// import AppError from '../utils/appError.js';

// /**
//  * Middleware to protect routes.
//  * Checks for valid JWT token and attaches the user to the request.
//  */
// export const protect = async (req, res, next) => {
//   try {
//     let token;

//     // Extract token from Authorization header or cookies
//     if (
//       req.headers.authorization &&
//       req.headers.authorization.startsWith('Bearer')
//     ) {
//       token = req.headers.authorization.split(' ')[1];
//     } else if (req.cookies && req.cookies.jwt) {
//       token = req.cookies.jwt;
//     }

//     // If no token is found
//     if (!token) {
//       return next(
//         new AppError('You are not logged in! Please log in to get access.', 401)
//       );
//     }

//     // Verify token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     // Find user from token payload
//     const currentUser = await User.findById(decoded.id);

//     if (!currentUser) {
//       return next(
//         new AppError('The user belonging to this token no longer exists.', 401)
//       );
//     }

//     // Attach user to request object
//     req.user = currentUser;
//     next();
//   } catch (err) {
//     // Specific error message for expired token
//     if (err.name === 'TokenExpiredError') {
//       return next(new AppError('Your token has expired. Please log in again.', 401));
//     }

//     // Handle other token errors
//     next(
//       new AppError(
//         'Invalid token. Please log in again.',
//         401
//       )
//     );
//   }
// };

// /**
//  * Middleware to restrict access based on user roles.
//  * Usage: restrictTo('admin', 'manager')
//  */
// export const restrictTo = (...roles) => {
//   return (req, res, next) => {
//     if (!roles.includes(req.user.role)) {
//       return next(
//         new AppError('You do not have permission to perform this action.', 403)
//       );
//     }
//     next();
//   };
// };
