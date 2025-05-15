import express from "express";
import cors from "cors";
import "dotenv/config";
import job from "./lib/cron.js";

import authRoutes from "./routes/authRoutes.js"
import eventRoutes from "./routes/eventRoutes.js"
import userRoutes from "./routes/user.js"

import { connectDB } from "./lib/db.js";

const app = express();
const PORT = process.env.PORT || 3000;

job.start();
app.use(express.json()); // allows the access const {email, username, password} = req.body datas
app.use(cors());

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/users", userRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    connectDB();
});

