const IntaSend = require("intasend-node");
require("dotenv").config();

const intasend = new IntaSend(
  process.env.INTASEND_PUBLISHABLE_KEY,
  process.env.INTASEND_SECRET_KEY,
  process.env.INTASEND_MODE
);

module.exports = intasend;
