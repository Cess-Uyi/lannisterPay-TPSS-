const { body } = require("express-validator");
const SplitPayment = require("../../models/splitPayment");

exports.COMPUTE = [
  body("ID")
    .isNumeric()
    .notEmpty()
    .trim()
    .custom((value, { req }) => {
      return SplitPayment.findOne({ ID: value }).then((payment) => {
        if (payment) {
          return Promise.reject("ID already exists");
        }
      });
    }),
  body("Amount").isFloat().notEmpty().trim(),
  body("Currency").isString().notEmpty().trim(),
  body("CustomerEmail")
    .isEmail()
    .notEmpty()
    .trim()
    .normalizeEmail()
    .toLowerCase(),
  body("SplitInfo").notEmpty().isArray({ min: 1, max: 20 }),
  body("SplitInfo.*.SplitType")
    .isString()
    .notEmpty()
    .trim()
    .isIn(["FLAT", "RATIO", "PERCENTAGE"]),
  body("SplitInfo.*.SplitValue").isFloat().notEmpty().trim(),
  body("SplitInfo.*.SplitEntityId")
    .isString()
    .notEmpty()
    .trim()
    .custom((value, { req }) => {
      return SplitPayment.findOne({
        "SplitInfo.SplitEntityId": value
      }).then(
        (entityId) => {
          if (entityId) {
            return Promise.reject("entityId already exists");
          }
        }
      );
    }),
];
