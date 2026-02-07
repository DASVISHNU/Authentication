import express from "express";
import dotenv from "dotenv"
dotenv.config({path:"./.env"})
import connectDB from "./db/index.js";

const app = express();
const port = process.env.PORT;

app.get("/", (req, res) => {
  res.send("Authentication server running hehe ");
});



connectDB()
.then(()=>{
  app.listen(port,()=>{
    console.log(`server running on port ${port}`);
  });
})
.catch((err)=>{
  console.log("mongodb connection error",err)
  process.exit(1)
})