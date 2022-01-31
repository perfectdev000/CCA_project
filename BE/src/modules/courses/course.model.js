const Mongoose = require("mongoose");

const courseSchema = new Mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default:""
    },
    videos: [
      {
        title: {type: String, trim: true},
        link: {type: String, trim: true},
        completed: {type: Boolean, default: false}
      }
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = Course = Mongoose.model("Course", courseSchema);
