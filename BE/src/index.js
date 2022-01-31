const path = require("path");
const express = require("express");
require("dotenv").config();
const cors = require("cors");
const bodyParser = require("body-parser");
const db = require("./db/db");
const app = express();
const port = process.env.PORT || 3000;

/**************NECESSARY INCLUDES*********** */

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

//**********IMPORTING ROUTES********* */
const errorrController = require("./middleware/errorHandler");
const userRoutes = require("./modules/userSignUp/signup.routes");
const courseRoutes = require("./modules/courses/course.routes");
const tourTeamRoutes = require("./modules/tourTeam/tourTeam.routes");
const tourRoutes = require("./modules/tournament/tournament.routes");
const leagueTeamRoutes = require("./modules/leagueTeam/leagueTeam.routes");
const seasonRoutes = require("./modules/season/season.routes");
const fileUpload = require("./modules/common/fileUpload/fileUpload.routes");
const discordAPI = require('./api/discord');
const stripeAPI = require("./api/stripe");
//*****************USING THE ROUTES************************* */

app.use("/user", userRoutes);
app.use("/course", courseRoutes);
app.use("/file", fileUpload);
app.use("/tour", tourRoutes);
app.use("/tourTeam", tourTeamRoutes);
app.use("/season", seasonRoutes);
app.use("/leagueTeam", leagueTeamRoutes);
app.use('/api/discord', discordAPI);
app.use("/api/stripe", stripeAPI);

app.use(errorrController);
app.use(express.static('public'));
app.get('*', (req, res) => {
    res.sendFile('index.html', {root: path.join(__dirname, '../public/')});
});
//*************************************************************/

app.listen(port, () => {
  console.log("*************************************************************");
  console.log(
    `Server is up on port ${port}! Started at ${new Date().toUTCString()}`
  );
  console.log(`*************************************************************`);
  //----- Subscription Monthly, Yearly Updates -----
  //  require('./modules/common/global').everydayInvoking();
});
