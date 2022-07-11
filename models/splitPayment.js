const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SplitInfoSchema = new Schema({
  SplitType: {
    type: String,
    enum: ["FLAT", "RATIO", "PERCENTAGE"],
    required: true,
  },
  SplitValue: {
    type: Number,
    required: true,
  },
  SplitEntityId: {
    type: String,
    required: true,
  },
});

const SplitPaymentSchema = new Schema(
  {
    ID: {
      type: Number,
      required: true,
    },
    Amount: {
      type: Number,
      required: true,
    },
    Currency: {
      type: String,
      required: true,
    },
    CustomerEmail: {
      type: String,
      required: true,
    },
    SplitInfo: [SplitInfoSchema],
  },
  { timestamps: true }
);

const SplitPayment = mongoose.model("SplitPayment", SplitPaymentSchema);

module.exports = SplitPayment

// validate: [arrayLimit, "{PATH} exceeds the limit of 10"];