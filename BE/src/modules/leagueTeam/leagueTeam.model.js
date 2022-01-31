const Mongoose = require("mongoose");

const leagueTeamSchema = new Mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    coach: [{ type: Mongoose.Schema.ObjectId}],
    mid: [{ type: Mongoose.Schema.ObjectId }],
    top: [{ type: Mongoose.Schema.ObjectId }],
    adc: [{ type: Mongoose.Schema.ObjectId }],
    jungle: [{ type: Mongoose.Schema.ObjectId }],
    support: [{ type: Mongoose.Schema.ObjectId }],
    readyForLeague: { type: Boolean, default: false },
    seasonId: { type: Mongoose.Schema.ObjectId }
  },
  {
    timestamps: true,
  }
);

module.exports = LeagueTeam = Mongoose.model("LeagueTeam", leagueTeamSchema);
