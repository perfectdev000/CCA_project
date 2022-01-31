const Mongoose = require("mongoose");

const tournamentSchema = new Mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    startDate: {type: Date, default: new Date()},
    endDate: {type: Date, default: new Date()},
    rounds: [
        {
            startDate: {type: Date, default: new Date()},
            endDate: {type: Date, default: new Date()},            
            matches: [{
                teamA: {type: Mongoose.Schema.ObjectId},
                readyA: {type: Boolean, default: false},
                winA: {type: Boolean, default: false},
                teamB: {type: Mongoose.Schema.ObjectId},
                readyB: {type: Boolean, default: false},
                winB: {type: Boolean, default: false},
                date: {type: Date, default: new Date()},
                status: {type: String, default: "created"} // created, ready, started, finished
            }],
            status: {type: String, default: "created"}, // created, signaled, started, finished
        },
    ],
    closed: {type: Boolean, default: false}
  },
  {
    timestamps: true,
  }
);

module.exports = Tournament = Mongoose.model("Tournament", tournamentSchema);
