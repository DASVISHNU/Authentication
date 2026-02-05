import express from "express";

const app = express();
const port = 5000;

app.get("/", (req, res) => {
  res.send("Authentication server running ");
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
