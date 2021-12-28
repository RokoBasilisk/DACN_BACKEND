const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const BillSchema = mongoose.Schema({
  products: [
    {
      product: {
        type: Schema.Types.ObjectId,
        ref: "Products",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      _id: false,
    },
  ],
  total: {
    type: Number,
    required: true,
  },
  customer: {
    type: Schema.Types.ObjectId,
    ref: "customers",
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Bills", BillSchema);
