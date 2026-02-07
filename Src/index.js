import express from "express";
import dotenv from "dotenv"
dotenv.config({path:"./.env"})

const app = express();
const port = process.env.PORT;

app.get("/", (req, res) => {
  res.send("Authentication server running ");
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
