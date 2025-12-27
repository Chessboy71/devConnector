import express from "express";
import type { Request, Response } from "express";
import { authMiddleware } from "../middleware/auth.ts";
import Profile from "../models/Profile.ts";
import User from "../models/User.ts";
import { check, validationResult } from "express-validator";

interface profileProps {
  user?: {
    id: string;
    name?: string;
  };
  company?: string;
  website?: string;
  location?: string;
  bio?: string;
  status: string;
  githubusername?: string;
  skills: string[];
  socials?: {
    youtube?: string;
    twitter?: string;
    facebook?: string;
    linkedin?: string;
    instagram?: string;
  };
}

const profileRouter = express.Router();

//

// @route   GET
// @desc    returns the profile of the current user
// @access  private

profileRouter.get(
  "/me",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const profile = await Profile.findOne({ user: req.user.id }).populate(
        "user",
        ["name", "avatar"]
      );

      if (!profile) {
        return res
          .status(400)
          .json({ msg: "There is no profile for this user" });
      }

      res.json(profile);
    } catch (err) {
      console.error("Error:", err);
      return res.status(400).json({ msg: "Server Error" });
    }
  }
);

// @route   POST api/profile
// @desc    Create or update profile
// @access  private

profileRouter.post(
  "/",
  authMiddleware,
  [
    check("status", "Status is required").not().isEmpty(),
    check("skills", "Skills is required").not().isEmpty(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);

    //check validation
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    //get fields
    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      linkedin,
      instagram,
    } = req.body;

    //build profile object
    const profileFields: profileProps = { status: "", skills: [] };
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
      profileFields.skills = skills
        .split(",")
        .map((skill: string) => skill.trim());
    }

    //build social object

    profileFields.socials = {};
    if (youtube) profileFields.socials.youtube = youtube;
    if (twitter) profileFields.socials.twitter = twitter;
    if (facebook) profileFields.socials.facebook = facebook;
    if (linkedin) profileFields.socials.linkedin = linkedin;
    if (instagram) profileFields.socials.instagram = instagram;

    try {
      let profile = await Profile.findOne({ user: req.user.id });

      if (profile) {
        //update profile
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );

        return res.json(profile);
      }

      //create profile
      profile = new Profile(profileFields);

      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Server Error" });
    }
  }
);

// @route   GET api/profile
// @desc    get all profiles
// @access  public

profileRouter.get("/", async (req: Request, res: Response) => {
  try {
    const profiles = await Profile.find().populate("user", ["name", "avatar"]);

    return res.json(profiles);
  } catch (err) {
    console.error("Error: ", err);
    return res.status(500).json({ msg: "Server Error" });
  }
});

// @route   GET api/profile/user/:user_id
// @desc    get profile by user ID
// @access  public

profileRouter.get("/user/:user_id", async (req: Request, res: Response) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate("user", ["name", "avatar"]);

    if (!profile)
      return res.status(400).json({ msg: "This profile does not exist" });

    return res.json(profile);
  } catch (err) {
    console.error("Error: ", err);

    if (err.kind == "ObjectId")
      return res.status(400).json({ msg: "This profile does not exist" });
    return res.status(500).json({ msg: "Server Error" });
  }
});

// @route   DELETE api/profile
// @desc    delete profile by id
// @access  Private

profileRouter.delete(
  "/",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      //@todo remove users posts

      //Remove profile
      await Profile.findOneAndDelete({ user: req.user.id });

      //Remove user
      await User.findOneAndDelete({ _id: req.user.id });

      res.json({ msg: "User removed" });
    } catch (err) {
      console.error("Error: ", err);
      return res.status(500).json({ msg: "Server Error" });
    }
  }
);

export default profileRouter;
