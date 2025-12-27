import express from "express";
import type { Request, Response } from "express";

const postsRouter = express.Router();

// @route     GET
// @desc      Register user
// @access    Public

postsRouter.post("/", (req: Request, res: Response) => {
  console.log(req.body);

  res.send("Just got data");
});

export default postsRouter;
