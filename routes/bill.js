const express = require("express");
const router = express.Router();
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const datefns = require("date-fns");
const verifyToken = require("../middleware/auth");
require("dotenv").config();

const Bill = require("../models/Bill");

// @route Get api/bill/all
// @desc Retrieve all bills
// @access Private
router.get("/all", verifyToken, async (req, res) => {
  try {
    let Bills = await Bill.find()
      .populate("customer", ["username"])
      .populate("products.product", ["title", "image"])
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

// @route Get api/bill/date
// @desc Retrieve all bills in that date
// @access Private
router.post("/date", verifyToken, async (req, res) => {
  const { date } = req.body;
  let query = new Date(date);
  console.log(query);
  try {
    if (date.length !== 0) {
      let Bills = await Bill.find({
        date: {
          $gte: datefns.startOfDay(query),
          $lte: datefns.endOfDay(query),
        },
      })
        .populate("customer", ["username"])
        .populate("products.product", ["title", "image"])
        .select("-__v");
      res.json({ success: true, Bills });
    } else {
      let Bills = await Bill.find()
        .populate("customer", ["username"])
        .populate("products.product", ["title", "image"])
        .select("-__v");
      res.json({ success: true, Bills });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Interval server error" });
  }
});

router.put("/:id", verifyToken, async (req, res) => {
  const { status } = req.body;
  try {
    const updateBillCondition = { _id: req.params.id };

    updatedBill = await Bill.findOneAndUpdate(
      updateBillCondition,
      { status: status },
      { new: true }
    )
      .populate("customer", ["username"])
      .populate("products.product", ["title", "image"])
      .select("-__v");
    if (!updatedBill)
      return res.status(401).json({
        success: false,
        message: "Bill not found or user is not authorized",
      });

    res.json({
      success: true,
      message: "Bill is Updated",
      Bills: updatedBill,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Interval server error" });
  }
});

// @route POST api/get
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
