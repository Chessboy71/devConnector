import express from "express";
import type { Request, Response } from "express";
import { authMiddleware } from "../middleware/auth.ts";
import User from "../models/User.ts";
import { check, validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import config from "config";
import bcrypt from "bcryptjs";

const authRouter = express.Router();

// @route GET
// @desc this is an aut route api/auth
// @access this route is public

authRouter.get("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    res.json(user);
  } catch (err) {
    console.error("Error: ", err);
    res.status(500).json({ msg: "Server Error" });
  }
});

authRouter.post(
  "/",
  [
    check("email", "Please enter a valid email").isEmail().notEmpty(),
    check("password", "Please enter a valid password").exists(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // check if user exists
      let user = await User.findOne({ email });

      if (!user) {
        return res.status(401).json({
          errors: [{ msg: "Invalid Credentials" }],
        });
      }

      //compare passwords
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({
          errors: [{ msg: "Invalid Credentials" }],
        });
      }
      //create JWT token
      const payload = { user: { id: user.id } };

      jwt.sign(
        payload,
        config.get("secretJWT") as string,
        {
          expiresIn: 360000,
        },
        (err: any, token: string | undefined) => {
          if (err) throw err;
          res.json({ token });
        }
      );

      // res.send("user registered");
    } catch (err: any) {
      console.error(err);
      res.status(500).send("Server error");
    }
  }
);

export default authRouter;
