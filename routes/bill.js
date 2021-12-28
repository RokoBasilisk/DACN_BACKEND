const express = require("express");
const router = express.Router();
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const verifyToken = require("../middleware/auth");
require("dotenv").config();

const Bill = require("../models/Bill");

// @route POST api/bill
// @desc Retrieve all bill of Customer
// @access Private
router.post("/get", async (req, res) => {
  const { customerId } = req.body;
  if (!customerId)
    return res
      .status(400)
      .json({ success: false, message: "Missing CustomerId" });
  try {
    let Bills = await Bill.find({ customer: customerId })
      .populate("customer", ["username"])
      .populate("products.product")
      .select("-__v");

    res.json({
      success: true,
      Bills,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Interval server error" });
  }
});

// @route POST api/bill
// @desc create bill for customer
// @access Private
router.post("/", async (req, res) => {
  const { products, total, customerId } = req.body;
  let array = [];
  //Validation
  if (!products)
    return res
      .status(400)
      .json({ success: false, message: "Missing Products" });
  if (!customerId)
    return res
      .status(400)
      .json({ success: false, message: "Missing CustomerId" });
  for (x in products) {
    let hold = {
      product: products[x].productId,
      quantity: products[x].quantity,
      price: products[x].price,
    };
    array.push(hold);
  }
  try {
    const newBill = new Bill({
      products: array,
      total: total,
      customer: customerId,
    });
    await newBill.save();
    console.log(newBill);
    res.json({
      success: true,
      message: "Order Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Interval server error" });
  }
});

module.exports = router;
