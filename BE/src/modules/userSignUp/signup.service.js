const User = require("./signup.model");
const Tour = require("../tournament/tournament.model");
const Season = require("../season/season.model");
const LeagueTeam = require("../leagueTeam/leagueTeam.model");
const TourTeam = require("../tourTeam/tourTeam.model");
const Course = require("../courses/course.model");
const bcrypt = require("bcrypt");
const global = require("../common/global");

/********************************************/
/*********** USER AUTHENTICATION ************/
/********************************************/

exports.emailCheck = async (req, res, next) => {
  try {
    if(!global.sanitize(req.body))
      throw new Error ("Request can't be started with the letter '$'");
    var result = await User.find({email: req.body.email});
    if(!result.length){
      return res.status(200).send({
        data: [],
        result: "OK",
        token: [],
      });
    } else {
      res.writeHead( 403, "REPEAT", {'content-type' : 'text/plain'});
      return res.end();
    }
  } catch (err) {
    res.writeHead( 400, err.message, {'content-type' : 'text/plain'});
    return res.end();
  }
}

exports.doSignup = async (req, res, next) => {
  try {
    if(!global.sanitize(req.body))
      throw new Error ("Request can't be started with the letter '$'");
    var newUser = req.body;
    const user = new User(newUser);
    var result = await user.save();
    const token = await user.generateAuthToken();

    if (!result) {
      res.writeHead( 500, "Cannot Save User, try again", {'content-type' : 'text/plain'});
      return res.end();
    }
    return res.status(200).send({
      data: result,
      Message: "User Created Successfully",
      token: token,
    });
  } catch (err) {
    res.writeHead( 400, err.message, {'content-type' : 'text/plain'});
    return res.end();
  }
};

exports.doLogin = async (req, res, next) => {
  try {
    //----- presave the super admin -----
    const superadmin = await User.count({type: 'superadmin', avatar: 'avatar'});
    if(!superadmin){
      console.log("--- Append Super Admin ---");
      const newUser = {
        email: "superadmin@gmail.com",
        username: "superadmin",
        discriminator: "9000",
        id: "superadmin",
        password: "superadmin",
        avatar: "avatar",
        type: "superadmin"
      }
      const user = new User(newUser);
      await user.save();
    }
    if (!global.sanitize(req.body)) 
      throw new Error("Request can't be started with the letter '$'");
    //----- Login Processes -----
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    console.log(user);

    if(user !== 'Password Error' && user !== 'User not found'){
      let token = await user.generateAuthToken();
      if (!user && !token) {
        res.writeHead( 500, "Something went Wrong..", {'content-type' : 'text/plain'});
        return res.end();
      }
      return res.status(200).send({
        data: user,
        Message: "Logged in Successfully",
        token: token,
      });
    } else { 
      res.writeHead( 403, user, {'content-type' : 'text/plain'});
      return res.end();     
    }
  } catch (err) {
    res.writeHead( 400, err.message, {'content-type' : 'text/plain'});
    return res.end();
  }
};

exports.doLinkDiscord = async (req, res, next) => {
  try { console.log(req.body);
    if (!global.sanitize(req.body)) 
      throw new Error("Request can't be started with the letter '$'");
    const _id = req.body._id;
    const email = req.body.email;
    const id = req.body.id;
    const discriminator = req.body.discriminator;
    const username = req.body.username;
    const avatar = req.body.avatar;

    var user = await User.findById({_id: _id});
    if(user.email == email && user.id == "") {
      var update = {
        id: id,
        discriminator: discriminator,
        username: username,
        avatar: avatar
      }
      user = await User.findByIdAndUpdate({_id: _id}, update, {new: true});
      return res.status(200).send({
        user: user,
        Message: "Discord Linked Successfully",
        token: req.token,
      });
    } else if (user.email == email && user.id == id) {      
      res.writeHead( 400, "Discord already linked", {'content-type' : 'text/plain'});
      return res.end();
    } else {
      res.writeHead( 400, "Failed to link Discord", {'content-type' : 'text/plain'});
      return res.end();
    }

  } catch (err) {
    res.writeHead( 400, err.message, {'content-type' : 'text/plain'});
    return res.end();
  }
}

exports.doLoginWithDiscord = async (req, res, next) => {
  try {
    //----- presave the super admin -----
    const superadmin = await User.count({type: 'superadmin', avatar: 'avatar'});
    if(!superadmin){
      console.log("--- Append Super Admin ---");
      const newUser = {
        email: "superadmin@gmail.com",
        username: "superadmin",
        discriminator: "9000",
        id: "superadmin",
        password: "superadmin",
        avatar: "avatar",
        type: "superadmin"
      }
      const user = new User(newUser);
      await user.save();
    }
    if (!global.sanitize(req.body)) 
      throw new Error("Request can't be started with the letter '$'");
     
    //----- Find the user with the email, DiscordId, DiscordDiscriminator
    const users = await User.find({email: req.body.email, id: req.body.id, discriminator: req.body.discriminator});
    if(users.length) {
      const user = users[0];
      let token = await user.generateAuthToken();
      if (!user && !token) {
        res.writeHead( 500, "Something went Wrong..", {'content-type' : 'text/plain'});
        return res.end();
      }
      return res.status(200).send({
        data: user,
        Message: "Logged in Successfully with Discord",
        token: token,
      });
    } else {      
      res.writeHead( 401, "Can't be authenticated with Discord.", {'content-type' : 'text/plain'});
      return res.end();
    }
  } catch (err) {
    res.writeHead( 400, err.message, {'content-type' : 'text/plain'});
    return res.end();
  }
};


/********************************************/
/***********  USER MANAGEMENTS   ************/
/********************************************/

exports.doGetUserById = async (req, res, next) => {
  try {
    if(!global.sanitize(req.params))
      throw new Error ("Request can't be started with the letter '$'");
    const { _id } = req.params;
    const user = await User.findById({ _id }).lean();
    delete user["password"];
    delete user["token"];
    if (!user) {
      res.writeHead( 500, "Something went Wrong..", {'content-type' : 'text/plain'});
      return res.end(); 
    }
    return res.status(200).send({
      data: user,
      Message: "User Fetched Successfully",
      token: req.token
    });
  } catch (err) {
    res.writeHead( 400, err.message, {'content-type' : 'text/plain'});
    return res.end();
  }
};

exports.doUpdateUserById = async (req, res, next) => {
  try {
    if(!global.sanitize(req.body))
      throw new Error ("Request can't be started with the letter '$'");
    if(!global.sanitize(req.params))
      throw new Error ("Request can't be started with the letter '$'");
    const { _id } = req.params;
    const query = { _id };
    const update = { ...req.body };
    if(update.password){
        update.password = await bcrypt.hash(
          update.password,
          parseInt(process.env.ROUNDS)
        );
    }
    var result = await User.findByIdAndUpdate(query, update, {new: true});

    if (!result) {
      res.writeHead( 500, "Cannot Update user", {'content-type' : 'text/plain'});
      return res.end(); 
    }
    // const token = await result.generateAuthToken();
    result["password"] = null;
    result["token"] = null;
    return res.status(200).send({
      data: result,
      Message: "User Updated Successfully",
      token: req.token
    }); 
  } catch (err) {
    res.writeHead( 400, err.message, {'content-type' : 'text/plain'});
    return res.end();
  }
};

exports.doSetAvailableForTourById = async (req, res, next) => {
  try {
    if(!global.sanitize(req.body))
      throw new Error ("Request can't be started with the letter '$'");
    if(!global.sanitize(req.params))
      throw new Error ("Request can't be started with the letter '$'");
    const { _id } = req.params;
    const query = { _id };
    const update = { 
      "tournament.available" : req.body.available
    };

    var result = await User.findByIdAndUpdate(query, update, {new: true});

    if (!result) {
      res.writeHead( 500, "Cannot Update user", {'content-type' : 'text/plain'});
      return res.end(); 
    }
    // const token = await result.generateAuthToken();
    result["password"] = null;
    result["token"] = null;
    return res.status(200).send({
      data: result,
      Message: "User Updated Successfully",
      token: req.token
    }); 
  } catch (err) {
    res.writeHead( 400, err.message, {'content-type' : 'text/plain'});
    return res.end();
  }
};

exports.doSetUserRoleForSeasonById = async (req, res, next) => {
  try {
    if(!global.sanitize(req.body))
      throw new Error ("Request can't be started with the letter '$'");
    if(!global.sanitize(req.params))
      throw new Error ("Request can't be started with the letter '$'");
    const { _id } = req.params;
    const query = { _id };
    const update = { 
      "season.role": req.body.role
    };

    var result = await User.findByIdAndUpdate(query, update, {new: true});

    if (!result) {
      res.writeHead( 500, "Cannot Update user", {'content-type' : 'text/plain'});
      return res.end(); 
    }

    result["password"] = null;
    return res.status(200).send({
      data: result,
      Message: "User Updated Successfully",
      token: req.token
    }); 
  } catch (err) {
    res.writeHead( 400, err.message, {'content-type' : 'text/plain'});
    return res.end();
  }
};

exports.doGetByQuery = async (req, res, next) => {
  try { 
    if(!global.sanitize(req.body))
      throw new Error ("Request can't be started with the letter '$'");
    // const name = req.body.name;
    // const email = req.body.email;
    // const sortByName = req.body.sortByName;
    // const curPage = req.body.curPage;
    // var skip = 5 * (curPage - 1);
    var query = User.find();
    const type = req.body.type;
    const email = req.body.email;
    const username = req.body.discord;
    if(type)
      query.where({type: type});
    if(email)
      query.where({ "email": { '$regex' : email, '$options' : 'i' } });
    if(username)
      query.where({ "username": { '$regex' : username, '$options' : 'i' } });
    query.collation({'locale':'en'});
    query.sort({email: 1});
    // query.skip(skip).limit(5);
    var result = await query.exec();
    var total = await User.count() - 1;
    var data = {
      total: total,
      users: result
    }
    return res.status(200).send({
      data: data,
      Message: "Successfully Get users",
      token: req.token
    }); 
  } catch (err) {
    res.writeHead( 400, err.message, {'content-type' : 'text/plain'});
    return res.end();
  }
}

exports.countByQuery = async (req, res, next) => {
  try { 
    if(!global.sanitize(req.body))
      throw new Error ("Request can't be started with the letter '$'");
    var result;
    if(req.body.date) {
      var date = new Date(req.body.date);
      var d = date.getDate();
      var m= date.getMonth() + 1;
      var y = date.getFullYear();
      var gte = y + '-' + m + '-' + d;
      var lt = y + '-' + m + '-' + (d+1);
      result = await User.count({
        createdAt: {
          $gte: new Date(gte), 
          $lt: new Date(lt)
        }
      });
    } else {
      console.log(req.body);
      result = await User.count({...req.body});
    }
    var total = await User.count();
    var data = {
      total: total,
      new: result
    }
    return res.status(200).send({
      data: data,
      Message: "Successfully Count users",
      token: req.token
    }); 
  } catch (err) {
    res.writeHead( 400, err.message, {'content-type' : 'text/plain'});
    return res.end();
  }
}

exports.doDeleteUserById = async (req, res, next) => {
  try {
    if(!global.sanitize(req.params))
      throw new Error ("Request can't be started with the letter '$'");
    const { _id } = req.params;
    const userId = _id;
    //----- Get the Tournamet of the user
    const user = await User.findById({_id: userId});
    const tournament = user.tournament;
    const teamId = tournament.teamId;
    const applies = tournament.applies;

    if(teamId) {
      //----- if user is the team creator remove the team as well If this team is not added to match
      if(user.tournament.type == "creator") {
        var team = await TourTeam.findById({_id: teamId});
        //----- if this team is added to the match, it can't be delelted.
        if(!team.addedToMatch) {
          //----- remove this teamId from the user's tournament.applies list of pending users
          var pendingInvites = team.pendingInvites;
          for (const item of pendingInvites) {
              var temp = await User.findById({_id: item});
              var temp_applies = temp.tournament.applies;
              temp_applies.splice(temp_applies.indexOf(teamId), 1);
              await User.findByIdAndUpdate({_id: item}, {"tournament.applies": temp_applies}, {new: true});
          }
          //----- set the player's tournament.type to ""
          var players = team.players;
          for (const item of players) {
              await User.findByIdAndUpdate({_id: item}, {"$set":{"tournament.type" : "", "tournament.ready": false}}, {new: true});
          }
          //----- set my tournament.type to ""
          await User.findByIdAndUpdate({_id: userId}, {"$set":{"tournament.type" : "", "tournament.ready": false}}, {new: true});
          //----- Delete this team from the teams table
          await TourTeam.findByIdAndDelete({_id: teamId});
          
          //----- Remove user's id from the pending invites list of the teams
          for (const apply of applies) {     
            var temp = await TourTeam.findById({_id: apply});
            var pendingInvites = temp.pendingInvites;
            pendingInvites.splice(pendingInvites.indexOf(userId), 1);
            await TourTeam.findByIdAndUpdate({_id: apply}, {pendingInvites: pendingInvites}, {new: true});
          }
          //----- delete the user from the DB
          var result = await User.findByIdAndDelete({_id: userId});
      
          return res.status(200).send({
            data: result,
            Message: "User Deleted Successfully",
            token: req.token
          });
        } else {
          return res.status(200).send({
            Message: "User can't be deleted because he is a creator of team that is added to the match",
            token: req.token
          });
        }
      } else if (user.tournament.type == "player") {
        //----- Remove user's id from the player lists of the teams
        var team = await TourTeam.findById({_id: teamId});
        var players = team.players;
        players.splice(players.indexOf(userId), 1);
        await TourTeam.findByIdAndUpdate({_id: teamId}, {players: players}, {new: true});

        //----- Remove user's id from the pending invites list of the teams
        for (const apply of applies) {     
          var temp = await TourTeam.findById({_id: apply});
          var pendingInvites = temp.pendingInvites;
          pendingInvites.splice(pendingInvites.indexOf(userId), 1);
          await TourTeam.findByIdAndUpdate({_id: apply}, {pendingInvites: pendingInvites}, {new: true});
        }
        //----- delete the user from the DB
        var result = await User.findByIdAndDelete({_id: userId});
    
        return res.status(200).send({
          data: result,
          Message: "User Deleted Successfully",
          token: req.token
        });
      }
    }     
  } catch (err) {
    res.writeHead( 400, err.message, {'content-type' : 'text/plain'});
    return res.end();
  }
};

exports.doBuySubscription= async (req, res, next) => {
  try {
    if(!global.sanitize(req.body))
      throw new Error ("Request can't be started with the letter '$'");

    const query= req.params;

    var expiryDate;
    if(req.body.type == "auto"){
      // if the user selected the auto renewal subscription, 
      // the expiryDate will be the same date of next month
      expiryDate = new Date(req.body.startDate);
      expiryDate.setUTCHours(0,0,0,0);
      expiryDate = expiryDate.setMonth(expiryDate.getMonth() + 1);
    } else {
      // check if the expiryDate greater than the startDate
      var startDate = new Date(req.body.startDate);
      startDate.setUTCHours(0,0,0,0);
      expiryDate = new Date(req.body.expiryDate);
      expiryDate.setUTCHours(0,0,0,0);
      if( startDate >= expiryDate )
        throw new Error ("Expiry Date must be later than the startDate");
    }

    const update = {
      subscription : {
        startDate: req.body.startDate,
        expiryDate: expiryDate,
        type: req.body.type
      },
      type: "member"
    }
    var result = await User.findByIdAndUpdate(query, update, { new: true });

    if (!result) {
      res.writeHead( 500, "Cannot set the subscription", {'content-type' : 'text/plain'});
      return res.end(); 
    }

    var purchaseResult = true;
    //---------------------------
    // TODO: Do something with payment
    //---------------------------
    if(purchaseResult) { // if successfully purchased
      result["password"] = null;
      result["token"] = null;
      return res.status(200).send({
        data: result,
        Message: "Successfully set the subscription",
        token: req.token
      });
    } else { // if the purchase get failed
      await User.findByIdAndUpdate(query, {subscription: {}}, { new: true });

      res.writeHead( 500, "Some errors with purchase", {'content-type' : 'text/plain'});
      return res.end(); 
    }

  } catch (err) {
    res.writeHead( 400, err.message, {'content-type' : 'text/plain'});
    return res.end();
  }
};


/********************************************/
/***********  SESSION FUNCTIONS  ************/
/********************************************/

//----------- COACH USER --------

exports.doSetCoachTimes= async (req, res, next) => {
  try {
    if(!global.sanitize(req.body))
      throw new Error ("Request can't be started with the letter '$'");
    if(!global.sanitize(req.params))
      throw new Error ("Request can't be started with the letter '$'");
    const query= req.params;
    var user = await User.findById(query);
    user.coachTimes.push(req.body);
    var result = await User.findByIdAndUpdate(query, {coachTimes: user.coachTimes}, {new: true});

    if (!result) {
      res.writeHead( 400, "Cannot set coach times", {'content-type' : 'text/plain'});
      return res.end();
    }
    return res.status(200).send({
      data: result,
      Message: "Successfully set coach times",
      token: req.token
    }); 
  } catch (err) {
    res.writeHead( 400, err.message, {'content-type' : 'text/plain'});
    return res.end();
  }
};

exports.doCancelCoachTimes= async (req, res, next) => {
  try {
    if(!global.sanitize(req.body))
      throw new Error ("Request can't be started with the letter '$'");
    if(!global.sanitize(req.params))
      throw new Error ("Request can't be started with the letter '$'");
    const query= req.params;
    const { coachTimeId, date } = req.body;
    var user = await User.findById(query);
    var coachTimes = user.coachTimes;
    
    var selected;
    for(var i = 0 ; i < coachTimes.length; i++) {
      if(coachTimes[i]._id == coachTimeId) {
        selected = i;
      }
    }
    var coachTime = coachTimes[selected];
    var repeat = coachTime.repeat;
    var deleteDates = [];
    if(repeat) {
      if(!date) { // cancle selected Event
        for ( var j = 0; j < coachTime.iteration; j++) {
          var start = new Date(coachTime.date);
          var end = new Date(coachTime.date);
          var every = coachTime.every;
          switch (coachTime.repeatType) {
            case "day":
                var offset = j * every;
                start.setDate(start.getDate() + offset);
                start.setHours (coachTime.startTime);
                end.setDate(end.getDate() + offset);
                end.setHours (coachTime.endTime);
                break;
            case "week":
                var offset = 7 * every * j;
                start.setDate(start.getDate() + offset);
                start.setHours (coachTime.startTime);
                end.setDate(end.getDate() + offset );
                end.setHours (coachTime.endTime);
                break;
            case "month":
                var offset = every * j;
                start.setMonth(start.getMonth() + offset);
                start.setHours (coachTime.startTime);
                end.setMonth(end.getMonth() + offset);
                end.setHours (coachTime.endTime);
                break;
          }
          deleteDates.push({
            start: start,
            end: end
          });
        }
        coachTimes.splice(selected, 1);
      } else { // add date to the selected event's exception list
        var start = new Date (date);
        start.setHours(coachTime.startTime);
        var end = new Date (date);
        end.setHours(coachTime.endTime);
        deleteDates.push({
          start: start,
          end: end
        });
        coachTime.exceptions.push(date);
      }
    } else {
      var start = new Date (date);
      start.setHours(coachTime.startTime);
      var end = new Date (date);
      end.setHours(coachTime.endTime);
      deleteDates.push({
        start: start,
        end: end
      });
      coachTimes.splice(selected, 1);
    }
    console.log(coachTimes);
    console.log(deleteDates);

    var buyers = user.buyers;
    for ( let n = 0; n < buyers.length; n++) {
      var bookings = buyers[n].bookings;
      for ( let k = 0; k < bookings.length; k++) {
        console.log(bookings[k].status);
        if(bookings[k].status != "bought") {
          console.log(bookings[k].start);
          var num;
          for (let l = 0; l < deleteDates.length; l++) {
            if(bookings[k].start.toString() == deleteDates[l].start && bookings[k].end.toString() == deleteDates[l].end)
              num = k;
              
          }
          bookings[num] = {
            status: "bought"
          }
        } console.log(bookings[k].status);
      }
      buyers[n].bookings = bookings;
    }
    console.log(buyers);
    var updates = {
      coachTimes: coachTimes,
      buyers: buyers
    }
    var result = await User.findByIdAndUpdate(query, updates, {new: true});

    if (!result) {
      res.writeHead( 400, "Cannot Cancel the coach times", {'content-type' : 'text/plain'});
      return res.end();
    }

    return res.status(200).send({
      data: result,
      Message: "Coach times canceled successfully",
      token: req.token
    });
  } catch (err) {
    res.writeHead( 400, err.message, {'content-type' : 'text/plain'});
    return res.end();
  }
};

//----------- USER ROLE -----------

exports.doBuyCoachTime = async (req, res, next) => {
  try {
    if(!global.sanitize(req.body))
      throw new Error ("Request can't be started with the letter '$'");
    const {coachId,  userId} = req.body;
    console.log(req.body);

    var coach = await User.findById({_id: coachId});
    var buyers = coach.buyers;
    var isNewCoach = true;
    for ( var i = 0; i < buyers.length; i++ ) {
      if( buyers[i].buyerId == userId ) {
        isNewCoach = false;
        buyers[i].bookings.push ({
          status: "bought"
        })
      }
    }
    if (isNewCoach) {
      buyers.push ({
        buyerId: userId,
        bookings: [{
          status: "bought"
        }]
      })
    };
    var result = await User.findByIdAndUpdate({_id: coachId}, {buyers: buyers}, {new: true});
    
    if (!result) {
      res.writeHead( 400, "Cannot bought the coach time", {'content-type' : 'text/plain'});
      return res.end();
    }

    var coaches = await User.find({type: 'coach'});
    return res.status(200).send({
      data: coaches,
      Message: "Successfully bought coachTime",
      token: req.token
    });
  } catch (err) {
    res.writeHead( 400, err.message, {'content-type' : 'text/plain'});
    return res.end();
  }
};

exports.doBookCoachTime = async (req, res, next) => {
  try {    
    if(!global.sanitize(req.body))
      throw new Error ("Request can't be started with the letter '$'");
    const {isBook, coachId, userId, time} = req.body;

    var coach = await User.findById({_id: coachId});
    var coachTimes = coach.coachTimes;
    var buyers = coach.buyers;

    // check if there is a avaiable slot that has got same start and end time with the requested times.
    var exist = false;
    for(let i = 0; i < coachTimes.length; i++) {
      var coachTime = coachTimes[i];
      if(coachTime.repeat) {
          var every = coachTime.every;
          var repeatType = coachTime.repeatType;
          var iteration = coachTime.iteration;
          for (let j = 0; j < iteration; j++) {
              var start = new Date (coachTime.date);
              var end = new Date (coachTime.date);
              var temp = {};
              switch (repeatType) {
                  case "day":
                      var offset = j * every;
                      start.setDate(start.getDate() + offset);
                      start.setHours (coachTime.startTime);
                      end.setDate(end.getDate() + offset);
                      end.setHours (coachTime.endTime);
                      temp.start = start;
                      temp.end = end;
                      break;
                  case "week":
                      var offset = 7 * every * j;
                      start.setDate(start.getDate() + offset);
                      start.setHours (coachTime.startTime);
                      end.setDate(end.getDate() + offset );
                      end.setHours (coachTime.endTime);
                      temp.start = start;
                      temp.end = end;
                      break;
                  case "month":
                      var offset = every * j;
                      start.setMonth(start.getMonth() + offset);
                      start.setHours (coachTime.startTime);
                      end.setMonth(end.getMonth() + offset);
                      end.setHours (coachTime.endTime);
                      temp.start = start;
                      temp.end = end;
                      break;
              }                        
              
              //check if the start date belongs to the exception list
              var exceptions = coachTime.exceptions;
              var except = false;
              for (var k = 0; k < exceptions.length; k++) {
                  if(new Date(exceptions[k]).toString() == temp.start.toString())
                      except = true;
              }
              if(!except) {
                  if( temp.start.toString() == new Date(time.start).toString() && temp.end.toString() == new Date(time.end).toString())
                    exist = true;
              }
          }
      } else {
          temp = coachTime;
          start = new Date (coachTime.date);
          start.setHours(coachTime.startTime);
          end = new Date (coachTime.date);
          end.setHours(coachTime.endTime);
          temp.start = start;
          temp.end = end;
          if( temp.start.toString() == new Date(time.start).toString() && temp.end.toString() == new Date(time.end).toString()) {
            exist = true;
          }
          console.log(exist);
      }           
    }
    console.log(exist);
    if (exist) {
      for (let k = 0; k < buyers.length; k++ ) {
        if(buyers[k].buyerId == userId) {
          for( let l = 0; l < buyers[k].bookings.length; l++ ) {
            if(isBook) {
              if (buyers[k].bookings[l].status == "bought") {
                buyers[k].bookings[l] = {
                  status: "booked",
                  start: time.start,
                  end: time.end
                }
                break;
              }
            } else {
              if(buyers[k].bookings[l].status !== "bought" && buyers[k].bookings[l].start.toString() == new Date(time.start).toString() && buyers[k].bookings[l].end.toString() == new Date(time.end).toString())
                buyers[k].bookings[l] = {
                  status: "bought",
                }
            }
          }
        }
      }

      var result = await User.findByIdAndUpdate({_id: coachId}, {buyers: buyers}, {new: true});
      if (!result) {
        res.writeHead( 400, "Cannot (un)book the coach time", {'content-type' : 'text/plain'});
        return res.end();
      }
  
      coach = await User.findById({_id: coachId});
      return res.status(200).send({
        coach: coach,
        Message: "Successfully (un)Book coachTime",
        token: req.token
      });
    } else {
      res.writeHead( 400, "Cannot (un)book to the unexisted slot", {'content-type' : 'text/plain'});
      return res.end();
    }
  } catch (err) {
    res.writeHead( 400, err.message, {'content-type' : 'text/plain'});
    return res.end();
  }
};

exports.doManageSession = async (req, res, next) => {
  try {
    if(!global.sanitize(req.body))
      throw new Error ("Request can't be started with the letter '$'");

      const { coachId, buyerId, bookingId, actionType} = req.body;
      var coach = await  User.findById({_id: coachId});
      var buyers = coach.buyers;
      var buyerNum;
      for ( var i = 0; i < buyers.length; i++ ) {
        if(buyers[i].buyerId == buyerId) {
          buyerNum = i;
          break;
          res.writeHead( 400, "Cannot (un)book to the unexisted slot", {'content-type' : 'text/plain'});
          return res.end();
        }
      }

      var bookings = buyers[buyerNum].bookings;
      var bookingNum;
      for ( var i = 0; i < bookings.length; i ++ ) {
        if(bookings[i]._id == bookingId) {
          bookingNum = i;
        }
      }

      switch ( actionType ) {
        case "accept":
          if(bookings[bookingNum].status == "booked")
            buyers[buyerNum].bookings[bookingNum].status = "accepted";
          else {
            res.writeHead( 400, "Cannot (un)book to the unbooked session", {'content-type' : 'text/plain'});
            return res.end();
          }
          break;
        case "decline":
          if(bookings[bookingNum].status == "booked")        
            buyers[buyerNum].bookings[bookingNum] = {
              status: "bought"
          }
          else {
            res.writeHead( 400, "Cannot decline the unbooked session", {'content-type' : 'text/plain'});
            return res.end();
          }
          break;
        case "cancel":
          if(bookings[bookingNum].status == "bought")        
            buyers[buyerNum].bookings[bookingNum] = {
              status: "bought"
          }
          else {
            res.writeHead( 400, "Cannot cancel to the unaccepted session", {'content-type' : 'text/plain'});
            return res.end();
          }
          break;
        case "close":     
          if(bookings[bookingNum].status == "booked")        
            buyers[buyerNum].bookings[bookingNum] = {
              status: "bought"
          }
          else {
            res.writeHead( 400, "Cannot close the unexisted session", {'content-type' : 'text/plain'});
            return res.end();
        }
          break;
        default:
          break;
      }

      var updates = {
        buyers: buyers
      }

      var result = await User.findByIdAndUpdate({_id: coachId}, updates, {new: true});
      if (!result) {
        res.writeHead( 400, "Cannot manage the session", {'content-type' : 'text/plain'});
        return res.end();
      }
      
      return res.status(200).send({
        coach: result,
        Message: "Successfully managed that session",
        token: req.token
      });

    } catch (err) {
      res.writeHead( 400, err.message, {'content-type' : 'text/plain'});
      return res.end();
  }
};
/********************************************/
/***********     CCA  LEAGUES    ************/
/********************************************/

exports.doSignUpForSeason = async (req, res, next) => {
  try {
    if(!global.sanitize(req.body))
      throw new Error ("Request can't be started with the letter '$'");

    const { userId, role } = req.body;
    //----- check if the last season is available for sign up
    var season = await Season.findOne().sort({created_at: -1});
    // var currentDate = new Date();
    // currentDate.setUTCHours(0,0,0,0);
    // var startDate = new Date( season.startDate );
    // if( currentDate < startDate && !season.closed ) { 
    if( !season.closed ) { // the last tournament is available for signup
      //-----check if the user isn't already signed up
      var user = await User.findOneById({_id: userId});
      if(!user.season.signedUp) { // the user isn't signed up yet

        // check if there is available rooms for the user's role
        var currentNum;
        switch (role) {
          case "mid":
            currentNum = await User.count({"season.mid": role});
            break;
          case "bottom":
            currentNum = await User.count({"season.bottom": role});
            break;
          case "top":
            currentNum = await User.count({"season.top": role});
            break;
          case "jungle":
            currentNum = await User.count({"season.jungle": role});
            break;
          case "support":
            currentNum = await User.count({"season.support": role});
            break;
          case "coach":
            currentNum = await User.count({"season.coach": role});
            break;
        }
        if(currentNum < season.capacity) { // there is a free room so can purchase for it
          var update = {
            season: {
              signedUp: signedUp,
              assigned: false,
              role: role
            }
          }
          var result = await User.findByIdAndUpdate({_id: userId}, update, {new: true});
          if (!result) {
            res.writeHead( 500, "Failed to sign up for the season", {'content-type' : 'text/plain'});
            return res.end();
          }

          result["password"] = null;
          result["token"] = null;
          return res.status(200).send({
            user: result,
            Message: "Successfully signed up for the season",
            token: req.token
          });
        } else {
          return res.status(200).send({
            data: [],
            Message: "The room is full for the role",
            token: req.token
          });
        }
      } else {
        return res.status(200).send({
          data: [],
          Message: "User is already purchased",
          token: req.token
        }); 
      }
    } else {
      return res.status(200).send({
        data: [],
        Message: "No Season can sign up for",
        token: req.token
      });
    }

  } catch (err) {
      res.writeHead( 400, err.message, {'content-type' : 'text/plain'});
      return res.end();
  }
};

exports.doSignOutFromSeason = async (req, res, next) => {
  try {
      if(!global.sanitize(req.body))
        throw new Error ("Request can't be started with the letter '$'");
  
        const { userId } = req.body;
        //----- check if the last season is available for sign out
        var season = await Season.findOne().sort({created_at: -1});
        var currentDate = new Date();
        currentDate.setUTCHours(0,0,0,0);
        var startDate = new Date( season.startDate );
        if( currentDate < startDate && !season.closed ) { // the last tournament is available for sign out
          //-----check if the user isn't already signed out
          var user = await User.findOneById({_id: userId});
          if(user.season.signedUp) { // the user is signed up
            var purchaseResult = true;

            if(user.season.role !== "coach") { // coach doesn't purchase
              //---------------------------
              // TODO: Do something with payment
              //---------------------------
            }
    
            if(purchaseResult) {// if successfully purchased
              var update = {
                season: {
                  signedUp: false,
                  assigned: false
                }
              }
              var result = await User.findByIdAndUpdate({_id: userId}, update, {new: true});
              if (!result) {
                res.writeHead( 500, "Failed to sign out from the season", {'content-type' : 'text/plain'});
                return res.end();
              }
              
              //----- if the user is assigned to the team, remove him from the team
              switch (user.season.role) {
                case "mid":
                  await LeagueTeam.findByIdAndUpdate({_id: user.season.teamId}, {mid: []}, {new: true});
                  break;
                case "bottom":
                  await LeagueTeam.findByIdAndUpdate({_id: user.season.teamId}, {bottom: []}, {new: true});
                  break;
                case "top":
                  await LeagueTeam.findByIdAndUpdate({_id: user.season.teamId}, {top: []}, {new: true});
                  break;
                case "jungle":
                  await LeagueTeam.findByIdAndUpdate({_id: user.season.teamId}, {jungle: []}, {new: true});
                  break;
                case "support":
                  await LeagueTeam.findByIdAndUpdate({_id: user.season.teamId}, {support: []}, {new: true});
                  break;
                case "coach":
                  await LeagueTeam.findByIdAndUpdate({_id: user.season.teamId}, {coach: []}, {new: true});
                  break;
              }
              result["password"] = null;
              result["token"] = null;
              return res.status(200).send({
                data: result,
                Message: "Successfully signed out from the season",
                token: req.token
              });
            } else {
              res.writeHead( 500, "Failed to purchase for the sign out from the season", {'content-type' : 'text/plain'});
              return res.end();
            }
          } else {
            return res.status(200).send({
              data: [],
              Message: "User is already signed out",
              token: req.token
            }); 
          }
        } else {
          return res.status(200).send({
            data: [],
            Message: "No Season can sign out from",
            token: req.token
          });
        }    
  } catch (err) {
      res.writeHead( 400, err.message, {'content-type' : 'text/plain'});
      return res.end();
  }
};

exports.doGetCCAPlayers = async (req, res, next ) => {
  try {
    //----- check if the last season isn't closed yet
    var season = await Season.findOne().sort({created_at: -1});
    if(!season.closed) {
      //----- get purchased list
      var result = await User.find({"season.signedUp": true});
      if(!result) {
        res.writeHead( 500, "Can't get the purchased list", {'content-type' : 'text/plain'});
        return res.end();
      }
      return res.status(200).send({
        data: result,
        Message: "Successfully got the Players list",
        token: req.token
      });
    } else {
      return res.status(200).send({
        data: [],
        Message: "No Opened Season",
        token: req.token
      });
    }
  } catch (err) {
    res.writeHead( 400, err.message, {'content-type' : 'text/plain'});
    return res.end();
  }
}

/********************************************/
/**************  TOURNAMENT  ****************/
/********************************************/

exports.doSignUpForTour = async (req, res, next) => {
  try {
    if(!global.sanitize(req.body))
      throw new Error ("Request can't be started with the letter '$'");

    const { userId } = req.body;
    //----- check if there's a opened tournament and still not started.
    var tour = await Tour.findOne().sort({created_at: -1});
    var currentDate = new Date();
    currentDate.setUTCHours(0,0,0,0);
    var startDate = new Date( tour.startDate );
    if( currentDate < startDate && !tour.closed ) { // the last tournament is available for signup
      //----- check if the user is available for sign up
      //----- check if the user is already signed up
      const user = await User.findById({_id: userId});
      if(user.tournament.available && user.tournament.type == "") { // user can sign up for the tour
        const update = {
          tournament: {
            available: true,
            type: "unset",
            applies: []
          }
        }
        var result = await User.findByIdAndUpdate({_id: userId}, update, {new: true});
        if(!result) {
          res.writeHead( 500, "Can't sign up for the tournament", {'content-type' : 'text/plain'});
          return res.end();
        }
        result["password"] = null;
        result["token"] = null;
        return res.status(200).send({
          data: result,
          Message: "Successfully signed up for the tournament",
          token: req.token
        });
      }
    } else {
      return res.status(200).send({
        data: [],
        Message: "No tournament can sign up for",
        token: req.token
      });
    }
  } catch (err) {
      res.writeHead( 400, err.message, {'content-type' : 'text/plain'});
      return res.end();
  }
};

exports.doSignOutFromTour = async (req, res, next) => {
  try {
    if(!global.sanitize(req.body))
      throw new Error ("Request can't be started with the letter '$'");

    const { userId } = req.body;
    //----- check if the last tournament is opened and still not started.
    var tour = await Tour.findOne().sort({created_at: -1});
    var currentDate = new Date();
    currentDate.setUTCHours(0,0,0,0);
    var startDate = new Date( tour.startDate );
    if( currentDate < startDate && !tour.closed ) { // the last tournament is available for signed out
      //----- check if the user is available for signed out
      //----- check if the user is already signed out
      var user = await User.findById({_id: userId});
      if(user.tournament.available && user.tournament.type !== "") { // user can sign out from the tour
        const update = {
          tournament: {
            available: true,
            type: "",
            applies: []
          }
        }
        var result = await User.findByIdAndUpdate({_id: userId}, update, {new: true});
        if(!result) {
          res.writeHead( 500, "Can't sign out from the tournament", {'content-type' : 'text/plain'});
          return res.end();
        }

        //----- if the user applies to the team, remove userId from the pedingInvites list of that team
        var applies = user.tournament.applies;
        for (const apply of applies) {
          var tourTeam = await TourTeam.findById({_id: apply});
          var pendingInvites = tourTeam.pendingInvites;
          pendingInvites.splice(pendingInvites.indexOf(user._id), 1);
          await TourTeam.findByIdAndUpdate({_id: apply}, {pendingInvites: pendingInvites}, {new: true});
        }

        //----- if the user joined to the team, remove userId from the players list of that team
        var teamId = user.tournament.teamId;
        if( user.tournament.type == "player" ) {
          var tourTeam = await TourTeam.findById({_id: teamId});
          var players = tourTeam.players;
          players.splice(players.indexOf(user._id), 1);
          await TourTeam.findByIdAndUpdate({_id: teamId}, {players: players}, {new: true});
        }

        //----- if the user is a creator, close the team
        if(user.tournament.type == "creator") {
          var tourTeam = await TourTeam.findById({_id: teamId});
          //----- remove this teamId from the user's tournament.applies list of pending users
          var pendingInvites = tourTeam.pendingInvites;
          for (const item of pendingInvites) {
              const user = await User.findById({_id: item});
              var applies = user.tournament.applies;
              applies.splice(applies.indexOf(teamId), 1);
              await User.findByIdAndUpdate({_id: item}, {"tournament.applies": applies}, {new: true});
          }

          //----- set the player's tournament.type to "unset"
          var players = tourTeam.players;
          for (const item of players) {
              await User.findByIdAndUpdate({_id: item}, {"tournament.type" : "unset"}, {new: true});
          }

          //----- Delete this team from the teams table
          await TourTeam.findByIdAndDelete({_id: teamId});
        }

        result["password"] = null;
        result["token"] = null;
        return res.status(200).send({
          data: result,
          Message: "Successfully signed out from the tournament",
          token: req.token
        });
      }
    } else {
      return res.status(200).send({
        data: [],
        Message: "No tournament can sign out from",
        token: req.token
      });
    }


  } catch (err) {
      res.writeHead( 400, err.message, {'content-type' : 'text/plain'});
      return res.end();
  }
};


exports.doFormatDB = async (req, res, next) => {
  try {
    //----- format the Tour table
    var tours = await Tour.find();
    for(const tour of tours){
      await Tour.findByIdAndDelete({_id: tour._id});
    }
    //----- format the TourTeam table
    var teams = await TourTeam.find();
    for(const team of teams){
      await TourTeam.findByIdAndDelete({_id: team._id});
    }
    //----- format the User table
    var users = await User.find();
    for(const user of users){
      await User.findByIdAndDelete({_id: user._id});
    }

    //----- format the User table
    var seasons = await Season.find();
    for(const season of seasons){
      await Season.findByIdAndDelete({_id: season._id});
    }

    //----- format the User table
    var courses = await Course.find();
    for(const course of courses){
      await Course.findByIdAndDelete({_id: course._id});
    }

    var leagueTeams = await LeagueTeam.find();
    for(const leagueTeam of leagueTeams){
      await LeagueTeam.findByIdAndDelete({_id: leagueTeam._id});
    }

    return res.status(200).send({
      Message: "SUCCESS",
      token: req.token
    });
  } catch (err) {
    res.writeHead( 400, err.message, {'content-type' : 'text/plain'});
    return res.end();
  }
}