import express from "express";
import { connectDB } from "./config/db.config";
import expressService from "./services/express.service";

async function startServer() {
  const app = express();
  await expressService(app);

  await connectDB();

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`app is listening at port : ${PORT}`);
  });
}

startServer();
