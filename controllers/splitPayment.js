const SplitPayment = require("../models/splitPayment");
const { validationResult } = require("express-validator");

class splitPayment {
  static async splitPaymentCompute(req, res, next) {
    // check for validation erros
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        response: "validation failed",
        error: errors.mapped(),
      });
    }
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

        if (currentSplitInfo.SplitType === "FLAT") {
          balance = balCalc(balance, currentSplitInfo.SplitValue);
          console.log(balance);
          flat(balance, currentSplitInfo.SplitValue);
          const data = {
            SplitEntityId: currentSplitInfo.SplitEntityId,
            Amount: currentSplitInfo.SplitValue,
          };
          finalSplitBreakDown.push(data);
          // finalSplitBreakDown[currentSplitInfo.index] = data;
        } else if (currentSplitInfo.SplitType === "PERCENTAGE") {
          let result = percentage(balance, currentSplitInfo.SplitValue);
          const data = {
            SplitEntityId: currentSplitInfo.SplitEntityId,
            Amount: result,
          };
          finalSplitBreakDown.push(data);
          // finalSplitBreakDown[currentSplitInfo.index] = data;
          balance = balCalc(balance, result);
          console.log(balance);
        } else if (currentSplitInfo.SplitType === "RATIO") {
          const ratioBalance = balance;
          const result =
            (Number(currentSplitInfo.SplitValue) / totalRatio) * ratioBalance;
          const data = {
            SplitEntityId: currentSplitInfo.SplitEntityId,
            Amount: result,
          };
          finalSplitBreakDown.push(data);
          // finalSplitBreakDown[currentSplitInfo.index] = data;
          balance = balCalc(balance, ratioBalance);
          console.log(balance);
        }
      }

      const response = {
        ID,
        Balance: balance,
        SplitBreakdown: finalSplitBreakDown,
      };

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
