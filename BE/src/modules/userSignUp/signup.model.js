const Mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userSchema = new Mongoose.Schema(
  {
    email: { // users's email address
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email is invalid..");
        }
      },
    },
    password: { // user's password
      type: String,
      required: true,
      minlength: 8,
      trim: true,
      validate(value) {
        if (value.toLowerCase().includes("password")) {
          throw new Error('Password cannot contain "Password"');
        }
      },
    },
    username: { // user's discord username
      type: String,
      default: "",
      trim: true,
    },
    discriminator: { // user's discriminator
      type: String,
      default: "",
      trim: true,
    },
    id: { // user's discord ID
      type: String,
      default: "",
      trim: true,
    },
    avatar: { // user's avatar
      type: String,
      default: "",
      trim: true,
    },
    type: { // user type -- superadmin, admin, coach, member, user
      type: String,
      default: 'user'
    },
    tournament: { // for the member, user only
      available: { type: Boolean, default: false },
      type: { type: String, default: "" }, // "unset", "player", "creator"
      applies: [ //teams that I applied to
        { type: Mongoose.Schema.ObjectId }
      ],
      teamId: { type: Mongoose.Schema.ObjectId },
      ready: {type: Boolean, default: false}
    },
    season: {
      signedUp: {type: Boolean, default: false},
      assigned: {type: Boolean, default: false},
      role: {type: String, trim: true}, // "coach", "mid", "top", "bottom", "jungle", "support"
      teamId: { type: Mongoose.Schema.ObjectId}
    },
    subscription: { // for the member only
      startDate: { type: Date, trim: true },
      expiryDate: { type: Date, trim: true },
      type: {type: String, trim: true} // "auto", "none"
    },
    //----------- This is the coach's property
    displayName: {type: String, trim: true, default: ""},
    description: {type: String, trim: true, default: ""},
    role: {type: String, trim: true, default: "top"},// top, mid, jungle, support, bottom,
    onSale: { type: Boolean, default: false }, // if one signed up as a coach this value turns to true
    buyers: [
      {
        buyerId: { type: Mongoose.Schema.ObjectId },
        bookings: [
          {
            status: { type: String, default: "bought"}, //bought, booked, accepted, declined
            start: { type: Date, trim: true},
            end: { type: Date, trim: true}
          }
        ]
      }
    ],
    coachTimes : [
      { 
        date: { type: Date, trim: true, default: new Date()},
        startTime: { type: Number, default: 0, min: 0, max: 23},
        endTime: { type: Number, default: 1, min: 0, max: 24},
        repeat: { type: Boolean, default: false},
        every: { type: Number, default: 1, min: 1, max: 10 },
        repeatType: { type: String, default: "day" }, // day, week, month
        iteration: { type: Number, default: 2 , min: 2, max: 10},
        exceptions: [{type: Date, trim: true}],
      }
    ],
    transactionHistory: [ //purchase history
      {
        purchaseDate: {type: Date, trim: true},
        cost: {type: Number, default: 0},
        plan: {type: String, trim: true}
      }
    ],
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);
//********RETURN THE JSON OBJECT WITHOUT SENSITVE DATA**************** */
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.tokens;
  return userObject;
};

//*********GENERATE AUTH TOKEN WHEN USER IS CREATED**************** */
userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString()}, process.env.JWT_SECRET, {
    expiresIn: 60 * 100,
  });

  user.tokens = [{token}];//user.tokens.concat({ token });
  await user.save();
  return token;
};

//*******************Authenticate the user from Database************************** */
userSchema.statics.findByCredentials = async (email, password) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return "User not found"
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return "Password Error";
    }
    return user;
  } catch (err) {
    console.log(err);
  }
};

//**********HASH PASSWORDS BEFORE SAVING THE DATA************ */
userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(
      user.password,
      parseInt(process.env.ROUNDS)
    );
  }
  next();
});

module.exports = User = Mongoose.model("User", userSchema);
