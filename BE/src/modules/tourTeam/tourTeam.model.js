const Mongoose = require("mongoose");

const teamSchema = new Mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    creator: {type: Mongoose.Schema.ObjectId},
    players: [
      {type: Mongoose.Schema.ObjectId}
    ],
    pendingInvites: [
      {type: Mongoose.Schema.ObjectId}
    ],
    readyForTournament: { type: Number, default: 0 },
    tourId: {type: Mongoose.Schema.ObjectId},
    matching: {type: Boolean, default: true},
    signal: {
      tourTitle: {type: String, trim: true, default: ''},
      tourStartDate: {type: Date, default: new Date()},
      tourEndDate: {type: Date, default: new Date()},
      roundNum: {type: Number, default: 1},
      roundStartDate: {type: Date, default: new Date()},
      roundEndDate: {type: Date, default: new Date()},
      matchDate: {type: Date, default: new Date()},
      teamA: {type: String, trim: true, default: ''},
      teamB: {type: String, trim: true, default: ''}
    },
    addedToMatch: {type: Boolean, default: false}
  },
  {
    timestamps: true,
  }
);

module.exports = Team = Mongoose.model("Team", teamSchema);
