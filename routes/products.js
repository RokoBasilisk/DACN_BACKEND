const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");
const Product = require("../models/Product");
const fs = require("fs");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    console.log(file);
    let date = new Date().toISOString();
    let str = date;
    while (str.match(":") !== null) {
      str = str.replace(":", "_");
    }

    cb(null, str + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  //reject a file
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg"
  )
    cb(null, true);
  else cb(null, false);
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: fileFilter,
});

// @route POST api/products
// @desc Create product
// @access Private
router.post(
  "/",
  verifyToken,
  upload.single("image"),
  async (req, res, next) => {
    const { title, description, price } = req.body;
    const image = req.file.path;
    // Validation
    if (!title)
      return res
        .status(400)
        .json({ success: false, message: "Title is required" });
    if (!description)
      return res
        .status(400)
        .json({ success: false, message: "Description is required" });
    if (!price)
      return res
        .status(400)
        .json({ success: false, message: "Price is required" });
    // if (!image)
    //   return res
    //     .status(400)
    //     .json({ success: false, message: "Image is required" });

    try {
      const newProduct = new Product({
        title,
        description,
        price,
        image,
        user: req.userId,
      });
      await newProduct.save();
      res.json({
        success: true,
        message: "Add a new product successfully",
        product: newProduct,
      });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: "Interval server error" });
    }
  }
);

// @route GET api/products
// @desc GET product
// @access Private
router.get("/", verifyToken, async (req, res) => {
  try {
    const Products = await Product.find({ user: req.userId }).populate("user", [
      "username",
    ]);
    res.json({ success: true, Products });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Interval server error" });
  }
});

// @route DELETE api/products/:id
// @desc DELETE product
// @access Private
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const productDeleteCondition = { _id: req.params.id, user: req.userId };
    const deletedProduct = await Product.findOneAndDelete(
      productDeleteCondition
    );

    if (!deletedProduct)
      return res.status(401).json({
        success: false,
        message: "Product not found or user not authorized",
      });
    res.json({
      success: true,
      message: "Product Deleted",
      Products: deletedProduct,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Interval server error" });
  }
});

// @route PUT api/products/:id
// @desc Update product
// @access Private
router.put("/:id", verifyToken, upload.single("image"), async (req, res) => {
  const { title, description, price } = req.body;
  const image = req.file.path;
  try {
    let updatedProduct = {
      title,
      description: description || "",
      price,
      image,
    };
    const productUpdateCondition = { _id: req.params.id, user: req.userId };

    updatedProduct = await Product.findOneAndUpdate(
      productUpdateCondition,
      updatedProduct,
      { new: true }
    );
    if (!updatedProduct)
      return res.status(401).json({
        success: false,
        message: "Product not found or user is not authorized",
      });
    res.json({
      success: true,
      message: "Product is Updated",
      Products: updatedProduct,
    });
    console.log("product is update", updatedProduct);
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Interval server error" });
  }
});

// @route PUT api/products/out/:id
// @desc Update product without image
// @access Private
router.put("/out/:id", verifyToken, async (req, res) => {
  const { title, description, price } = req.body;
  try {
    let updatedProduct = {
      title,
      description: description || "",
      price,
    };
    const productUpdateCondition = { _id: req.params.id, user: req.userId };

    updatedProduct = await Product.findOneAndUpdate(
      productUpdateCondition,
      updatedProduct,
      { new: true }
    );
    if (!updatedProduct)
      return res.status(401).json({
        success: false,
        message: "Product not found or user is not authorized",
      });
    res.json({
      success: true,
      message: "Product is Updated",
      Products: updatedProduct,
    });
    console.log("product is updated", updatedProduct);
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Interval server error" });
  }
});

module.exports = router;
