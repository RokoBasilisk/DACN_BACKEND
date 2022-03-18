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

    Bills.map((bill) => {
      let str = new Date(bill.date);
      let time = str.toString().split("GMT");
      bill.date = time[0];
    });

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
      status: "Waiting",
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

// @route GET api/bill/yearchart
// @desc get Bills Chart
// @access Private
router.get("/yearchart", verifyToken, async (req, res) => {
  try {
    let startDay = [
      "2022-01-01",
      "2022-02-01",
      "2022-03-01",
      "2022-04-01",
      "2022-05-01",
      "2022-06-01",
      "2022-07-01",
      "2022-08-01",
      "2022-09-01",
      "2022-10-01",
      "2022-11-01",
      "2022-12-01",
    ];
    let startMonthInYear = [];
    let lastMonthInYear = [];
    for (let i = 1; i <= 12; i++) {
      let date = new Date(2022, i, 0);
      lastMonthInYear.push(date);
    }
    for (let day of startDay) {
      let date = new Date(day);
      startMonthInYear.push(date);
    }
    const array = [];
    for (let i = 0; i < 12; i++) {
      let Bills = await Bill.find({
        date: {
          $gte: datefns.startOfDay(startMonthInYear[i]), // 00:00 am
          $lte: datefns.endOfDay(lastMonthInYear[i]), // 11:59 pm
        },
      });
      let MonthName = "January";
      switch (i + 1) {
        case 1:
          MonthName = "January";
          break;
        case 2:
          MonthName = "February";
          break;
        case 3:
          MonthName = "March";
          break;
        case 4:
          MonthName = "April";
          break;
        case 5:
          MonthName = "May";
          break;
        case 6:
          MonthName = "June";
          break;
        case 7:
          MonthName = "July";
          break;
        case 8:
          MonthName = "August";
          break;
        case 9:
          MonthName = "September";
          break;
        case 10:
          MonthName = "October";
          break;
        case 11:
          MonthName = "November";
          break;
        case 12:
          MonthName = "December";
          break;
        default:
          break;
      }
      miniArray = [MonthName, Bills];
      array.push(miniArray);
    }
    res.json({ success: true, array });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Interval server error" });
  }
});

module.exports = router;
