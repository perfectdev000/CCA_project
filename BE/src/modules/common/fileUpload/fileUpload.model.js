const Mongoose = require("mongoose");
const uploadSchema = new Mongoose.Schema({
  upload: {
    link: { type: String, trim: true },
    ETag: { type: String, trim: true },
  },
});

module.exports = Upload = Mongoose.model("Upload", uploadSchema);
