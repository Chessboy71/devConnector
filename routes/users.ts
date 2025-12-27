import express from "express";
import type { Request, Response } from "express";
import { check, validationResult } from "express-validator";
import User from "../models/User.ts";
import gravatar from "gravatar";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "config";

const usersRouter = express.Router();

// @route   GET
// @desc    register users
// @access  public

usersRouter.post(
  "/",
  [
    check("name", "Please enter your name").not().isEmpty(),
    check("email", "Please enter a valid email").isEmail().notEmpty(),
    check(
      "password",
      "Please enter a valid password between 6 and 28 characters"
    ).isLength({ min: 6, max: 26 }),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // check if user exists

    try {
      const { name, email, password } = req.body;

      let user = await User.findOne({ email });

      if (user) {
        return res.send({
          errors: [{ message: "This email already exists " }],
        });
      }

      // get avatar

      const avatar = gravatar.url(email, {
        s: "200",
        r: "pg",
        d: "mm",
      });

      // create user instan
      user = new User({
        name,
        email,
        password,
        avatar,
      });

      //enrypt password

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      //registering user
      await user.save();

      //create JWT token

      const payload = { user: { id: user.id } } as jwt.JwtPayload;

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

export default usersRouter;
