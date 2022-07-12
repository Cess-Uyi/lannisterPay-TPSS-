const express = require("express");
// const Validate = require("../handlers/validator/splitPayment");
const splitPaymentController = require("../controllers/splitPayment");
const router = express.Router();

router.post(
  "/",
  // Validate.COMPUTE,
  splitPaymentController.splitPaymentCompute
);

module.exports = router;
