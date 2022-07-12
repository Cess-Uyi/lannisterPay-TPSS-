const SplitPayment = require("../models/splitPayment");
const { validationResult } = require("express-validator");
const { LocalStorage } = require("node-localstorage");

class splitPayment {
  // constructor(ID, Amount, Currency, CustomerEmail, )
  static async splitPaymentCompute(req, res, next) {
    // check for validation erros
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        response: "validation failed",
        error: errors.mapped(),
      });
    }

    let localStorage = new LocalStorage("./scratch");
    let payments = [];

    try {
      const { ID, Amount, Currency, CustomerEmail, SplitInfo } = req.body;

      // initializing empty array according to the splitType
      const flatSplitTypes = [];
      const percentageSplitTypes = [];
      const ratioSplitTypes = [];

      //array holding the final result to be returned
      const finalSplitBreakDown = []; //

      //set starting balance to the Amount in request body
      let balance = Amount;
      let totalRatio = 0;
      let ratioBalance = 0;

      // functions based on SplitType
      let balCalc = (amount, value) => {
        return amount - value;
      };

      const flat = (amount, value) => {
        return value;
      };

      const percentage = (amount, value) => {
        return (value / 100) * amount;
      };

      // iterate through splitInfo and update the array for each splitType
      SplitInfo.forEach((info, index) => {
        switch (info.SplitType) {
          case "FLAT":
            flatSplitTypes.push({ ...info, index });
            break;
          case "PERCENTAGE":
            percentageSplitTypes.push({ ...info, index });
            break;
          case "RATIO":
            //get total ratio for all instances where splitType == radio
            totalRatio += Number(info.SplitValue);
            ratioSplitTypes.push({ ...info, index });
            break;
          default:
            break;
        }
      });

      // form a new array based on order of precedence
      const splitTypesArray = [].concat(
        flatSplitTypes,
        percentageSplitTypes,
        ratioSplitTypes
      );

      // loop through splitTypesArray and compute according to splitType
      for (let i = 0; i < splitTypesArray.length; i++) {
        const currentSplitInfo = splitTypesArray[i];
        // check to make sure balance or splitValue is not less than 0
        if (balance < 0 || currentSplitInfo.SplitValue < 0) {
          return res.status(500).json({
            error: "Incomputable SplitValue",
          });
        } else if (currentSplitInfo.SplitType === "FLAT") {
          balance = balCalc(balance, currentSplitInfo.SplitValue);
          flat(balance, currentSplitInfo.SplitValue);
          const data = {
            SplitEntityId: currentSplitInfo.SplitEntityId,
            Amount: currentSplitInfo.SplitValue,
          };
          finalSplitBreakDown.push(data);
        } else if (currentSplitInfo.SplitType === "PERCENTAGE") {
          let result = percentage(balance, currentSplitInfo.SplitValue);
          const data = {
            SplitEntityId: currentSplitInfo.SplitEntityId,
            Amount: result,
          };
          finalSplitBreakDown.push(data);
          balance = balCalc(balance, result);
          ratioBalance = balance;
        } else if (currentSplitInfo.SplitType === "RATIO") {
          // const ratioBalance = balance;
          const startingRatioBalance = ratioBalance;
          const result =
            (Number(currentSplitInfo.SplitValue) / totalRatio) *
            startingRatioBalance;
          const data = {
            SplitEntityId: currentSplitInfo.SplitEntityId,
            Amount: result,
          };
          finalSplitBreakDown.push(data);
          balance = balCalc(balance, result);
        }
      }
      const response = {
        ID,
        Balance: balance,
        SplitBreakdown: finalSplitBreakDown,
      };

      // localStorage
      // payments.push(response);
      // localStorage.setItem("payments", JSON.stringify(payments));
      // let computedPayments = JSON.parse(localStorage.getItem("payments"));
      // console.log(computedPayments);
      // localStorage.clear();

      return res.status(200).json(response);
    } catch (err) {
      res.status(500).json({
        response: "internal server error",
        error: err.message,
      });
    }
  }
}

module.exports = splitPayment;
