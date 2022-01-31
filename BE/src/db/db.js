const mongoose = require("mongoose");
require('dotenv').config();
mongoose
  .connect(process.env.DEV_DB_CONNECTION, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB Server");
  })
  .catch((err) => {
    console.log(err);
  });
