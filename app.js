const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv/config");

//Import routes
const postsRoute = require("./routes/posts");
const authRouter = require("./routes/auth");
const customerRouter = require("./routes/customer");
const productsRouter = require("./routes/products");
const billsRouter = require("./routes/bill");
//Middleware using
app.use(
  bodyParser.urlencoded({
    // to support URL-encoded bodies
    extended: true,
  })
);
app.use(bodyParser.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));

app.use("/api/auth", authRouter);
app.use("/api/customer", customerRouter);
app.use("/api/posts", postsRoute);
app.use("/api/products", productsRouter);
app.use("/api/bill", billsRouter);
//routes

mongoose.connect(process.env.DB_CONNECTION, () => {});

console.log("Server started on port 5000");

app.listen(5000);
