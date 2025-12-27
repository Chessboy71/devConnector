import express from "express";
import connectDB from "./config/db.js";
import authRouter from "./routes/auth.ts";
import profileRouter from "./routes/profile.ts";
import usersRouter from "./routes/users.ts";
import postsRouter from "./routes/posts.ts";

// init express
const app = express();

app.use(express.json());

// connect database
connectDB();

const port = process.env.PORT;

app.use("/api/auth", authRouter);
app.use("/api/profile", profileRouter);
app.use("/api/users", usersRouter);
app.use("/api/posts", postsRouter);

app.listen(port, () => {
  console.log(`Server is running in ${port}`);
});
