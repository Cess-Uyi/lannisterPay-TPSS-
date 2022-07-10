const express = require("express");
const router = express.Router();

router.post("/", (req, res) => {
  res.send(req.body)
  // res.status(404).json({
  //   msg: "This endpoint works!",
  // });
});

module.exports = router;
