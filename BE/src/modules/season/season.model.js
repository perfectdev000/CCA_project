const Mongoose = require("mongoose");

const seasonSchema = new Mongoose.Schema(
    {
      title: {
        type: String,
        required: true,
        trim: true,
      },
      startDate: {type: Date, default: new Date()},
      endDate: {type: Date, default: new Date()},
      capacity: {type: Number, default: 0, required: true},
      games: [
        {      
          teamA: {type: Mongoose.Schema.ObjectId},
          readyA: {type: Boolean, default: false},
          teamB: {type: Mongoose.Schema.ObjectId},
          readyB: {type: Boolean, default: false},
          date: {type: Date, default: new Date()},
          result: {type: String, default: "Pending"}, //valid results are "A Victory", "B Victory",
                                        // "Draw" and "Pending" where draw is determined by admin 
                                        // if for some reason the players are unable to play
          status: {type: String, default: "created"} // created, ready, started, finished
        }
      ],
      closed: {type: Boolean, default: false}
    },
    {
      timestamps: true,
    }
  );

  module.exports = Season = Mongoose.model("Season", seasonSchema);