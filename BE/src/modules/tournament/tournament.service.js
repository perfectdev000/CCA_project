const Tour = require("./tournament.model");
const Team = require("../tourTeam/tourTeam.model");
const User = require("../userSignUp/signup.model");
const global = require("../common/global");

exports.doCreateNewTournament = async (req, res, next) => {
    try {
        if(!global.sanitize(req.body.data))
            throw new Error ("Request can't be started with the letter '$'");
        if(!global.sanitize(req.body.query))
            throw new Error ("Request can't be started with the letter '$'");
        var count = await Tour.count({});
        if(count > 0) {
            var tour = await Tour.findOne().sort({created_at: -1});

            //----- check if there is still ongoing tournament or not
            if(tour.status === "finished"){
                tour = new Tour( req.body.data );
                var result = await tour.save();
                if (!result) { //----- if something went wrong
                    res.writeHead( 400, "Failed to create a new tournament", {'content-type' : 'text/plain'});
                    return res.end();
                }
                console.log(result);
                var rounds = await getSpecRounds(result.rounds);        
                var _tour = {
                    _id: result._id,
                    title: result.title,
                    startDate: result.startDate,
                    endDate: result.endDate,
                    rounds: rounds,
                    closed: result.closed
                }
                return res.status(200).send({
                    tour: _tour,
                    Message: "SUCCESS",
                    token: req.token
                });
            } else {
                return res.status(200).send({
                    tour: [],
                    Message: "FAILURE",
                    token: req.token
                });
            }
        } else {
            tour = new Tour( req.body.data );
            var result = await tour.save();
            if (!result) { //----- if something went wrong
                res.writeHead( 400, "Failed to create a new tournament", {'content-type' : 'text/plain'});
                return res.end();
            }
            console.log(result);
            var rounds = await getSpecRounds(result.rounds);        
            var _tour = {
                _id: result._id,
                title: result.title,
                startDate: result.startDate,
                endDate: result.endDate,
                rounds: rounds,
                closed: result.closed
            }
            return res.status(200).send({
                tour: _tour,
                Message: "SUCCESS",
                token: req.token
            });
        }
    } catch (err) {
        res.writeHead( 400, err.message, {'content-type' : 'text/plain'});
        return res.end();
    }
};

exports.doGetCurrentTournament = async (req, res, next) => {
    try {
        if(!global.sanitize(req.body))
            throw new Error ("Request can't be started with the letter '$'");
        
        var count = await Tour.count();
        if(count){
            var tour = await Tour.findOne().sort({created_at: -1});
            console.log(tour);
            var rounds = await getSpecRounds(tour.rounds);
            var _tour = {
                _id: tour._id,
                title: tour.title,
                startDate: tour.startDate,
                endDate: tour.endDate,
                rounds: rounds,
                closed: tour.closed
            }
            return res.status(200).send({
                tour: _tour,
                Message: "SUCCESS",
                token: req.token
            });
        } else {
            return res.status(200).send({
                tour: [],
                Message: "NO_TOUR",
                token: req.token
            });
        }
    } catch (err) {
      res.writeHead( 400, err.message, {'content-type' : 'text/plain'});
    return res.end();
    }
};

exports.doCreateNewRound = async (req, res, next) => {
    try {        
        if(!global.sanitize(req.body))
        throw new Error ("Request can't be started with the letter '$'");
        var tour = await Tour.findOne().sort({created_at: -1});
        var rounds = tour.rounds;
        if(rounds.length){
            var round = rounds[rounds.length - 1];   
            //----- new round can be created just after previous round gets finished
            if(round.status === "finished"){
                var newRound = req.body;
                rounds.push(newRound);
                await Tour.findByIdAndUpdate({_id: tour._id}, {rounds: rounds}, {new: true});
                var _rounds = await getSpecRounds(rounds);
                var _tour = {
                    _id: tour._id,
                    title: tour.title,
                    startDate: tour.startDate,
                    endDate: tour.endDate,
                    rounds: _rounds,
                    closed: tour.closed
                }
                return res.status(200).send({
                    tour: _tour,
                    Message: "SUCCESS",
                    token: req.token
                });
            } else {
                return res.status(200).send({
                    tour: [],
                    Message: "Can't create new round because the previous one isn't finished yet.",
                    token: req.token
                });
            }
        } else {
            var newRound = req.body;
            rounds.push(newRound);
            await Tour.findByIdAndUpdate({_id: tour._id}, {rounds: rounds}, {new: true});
            var _rounds = await getSpecRounds(rounds);
            var _tour = {
                _id: tour._id,
                title: tour.title,
                startDate: tour.startDate,
                endDate: tour.endDate,
                rounds: _rounds,
                closed: tour.closed
            }
            return res.status(200).send({
                tour: _tour,
                Message: "SUCCESS",
                token: req.token
            });
        }
    } catch(err) {
        res.writeHead( 400, err.message, {'content-type' : 'text/plain'});
        return res.end();
    }
}

exports.doAddNewMatch = async (req, res, next) => {
    try {
        if(!global.sanitize(req.body))
            throw new Error ("Request can't be started with the letter '$'");
        var newMatch = req.body;
        console.log(req.body);
        var tour = await Tour.findOne().sort({created_at: -1});
        var rounds = tour.rounds;
        var round = rounds[rounds.length - 1];
        var matches = round.matches;
        //----- check if the team A or team B of the new match has already added to the current round -----
        var repeat = false;
        for(var i = 0; i < matches.length; i++){
            console.log(matches[i].teamA);
            console.log(matches[i].teamB);
            if(newMatch.teamA == matches[i].teamA || newMatch.teamA == matches[i].teamB || newMatch.teamB == matches[i].teamA || newMatch.teamB == matches[i].teamB ){
                repeat = true;
                break;
            }
        } 
        if(!repeat) {
            //----- set addedToMatch of team A, B to true
            await Team.findByIdAndUpdate({_id: newMatch.teamA}, {addedToMatch: true}, {new: true}); 
            await Team.findByIdAndUpdate({_id: newMatch.teamB}, {addedToMatch: true}, {new: true}); 
            rounds[rounds.length - 1].matches.push(newMatch);
            await Tour.findByIdAndUpdate({_id: tour._id}, {rounds: rounds}, {new: true});
            var _rounds = await getSpecRounds(rounds);
            var _tour = {
                _id: tour._id,
                title: tour.title,
                startDate: tour.startDate,
                endDate: tour.endDate,
                rounds: _rounds,
                closed: tour.closed
            }
            return res.status(200).send({
                tour: _tour,
                Message: "SUCCESS",
                token: req.token
            });
        } else {
            return res.status(200).send({
                tour: [],
                Message: "FAILURE",
                token: req.token
            }); 
        }
    } catch (err) {
        res.writeHead( 400, err.message, {'content-type' : 'text/plain'});
    return res.end();
    }
}

exports.doRemoveNewMatch = async (req, res, next) => {
    try {
        if(!global.sanitize(req.body))
            throw new Error ("Request can't be started with the letter '$'");
        var matchId = req.body.matchId;
        var tour = await Tour.findOne().sort({created_at: -1});
        var rounds = tour.rounds;
        var matches = rounds[rounds.length - 1].matches;
        rounds[rounds.length - 1].matches.splice(getLocationById(matchId, matches), 1);
        await Tour.findByIdAndUpdate({_id: tour._id}, {rounds: rounds}, {new: true});
        var _rounds = await getSpecRounds(rounds);
        var _tour = {
            _id: tour._id,
            title: tour.title,
            startDate: tour.startDate,
            endDate: tour.endDate,
            rounds: _rounds,
            closed: tour.closed
        }
        return res.status(200).send({
            tour: _tour,
            Message: "SUCCESS",
            token: req.token
        });
    } catch (err) {
        res.writeHead( 400, err.message, {'content-type' : 'text/plain'});
    return res.end();
    }
}

exports.doSignalToTeams = async (req, res, next) => {
    try {     
        var tour = await Tour.findOne().sort({created_at: -1});
        var rounds = tour.rounds;
        var available = false;
        //----- if the last round's status is 'created', can signal to teams
        if(rounds.length > 0 && rounds[rounds.length - 1].status === "created")
            available = true;
        if(available) {
            rounds[rounds.length - 1].status = "signaled";
            await Tour.findByIdAndUpdate({_id: tour._id}, {rounds: rounds}, {new: true});
            var round = rounds[rounds.length - 1];
            var matches = round.matches;
            for(const match of matches) {
                var teamA = await Team.findById({_id: match.teamA});                
                var teamB = await Team.findById({_id: match.teamB});
                var signal = {
                    tourTitle: tour.title,
                    tourStartDate: tour.startDate,
                    tourEndDate: tour.endDate,
                    roundNum: rounds.length,
                    roundStartDate: round.startDate,
                    roundEndDate: round.endDate,
                    matchDate: match.date,
                    teamA: teamA.name,
                    teamB: teamB.name
                }
                await Team.findByIdAndUpdate({_id: match.teamA}, {"$set": {signal: signal}}, {new: true}); 
                await Team.findByIdAndUpdate({_id: match.teamB}, {"$set": {signal: signal}}, {new: true});                 
            }
            rounds[rounds.length - 1].status = 'signaled';
            await Tour.findByIdAndUpdate({_id: tour._id}, {rounds: rounds}, {new: true});
            return res.status(200).send({
                Message: "SUCCESS",
                token: req.token
            });
        } else {            
            return res.status(200).send({
                Message: "FAILURE",
                token: req.token
            });
        }
    } catch (err) {
        res.writeHead( 400, err.message, {'content-type' : 'text/plain'});
    return res.end();
    }
}

exports.doStartRound = async (req, res, next) => {
    try {     
        var tour = await Tour.findOne().sort({created_at: -1});
        var rounds = tour.rounds;
        var available = false;
        if(rounds.length === 1)
            available = true;
        else if (rounds[rounds.length - 2].status === "finished")
            available = true 
        //----- check if there is still the round of "started"
        if(available){
            //----- check if all the teams are ready for the round (readyForTournament === 5)
            var round = rounds[rounds.length - 1];
            var matches = round.matches;
            var unreadyTeams = 0;
            for(const match of matches) {
                var teamA = await Team.findById({_id: match.teamA});
                if(teamA.readyForTournament < 5)
                    unreadyTeams++;
                var teamB = await Team.findById({_id: match.teamB});
                if(teamB.readyForTournament < 5)
                    unreadyTeams++;
            }

            if(!unreadyTeams) { // there's no unready teams so can start the round now
                rounds[rounds.length - 1].status = "started";
                console.log(rounds);
                await Tour.findByIdAndUpdate({_id: tour._id}, {rounds: rounds}, {new: true});
                var _rounds = await getSpecRounds(rounds);
                var _tour = {
                    _id: tour._id,
                    title: tour.title,
                    startDate: tour.startDate,
                    endDate: tour.endDate,
                    rounds: _rounds,
                    closed: tour.closed
                }

                //------ set the matching value to false for all the teams
                    // if they win in the match it will be true so they can continue to the next round
                var teams = await Team.find();
                for(const team of teams){
                    await Team.findByIdAndUpdate({_id: team._id}, {matching: false}, {new: true});
                }

                return res.status(200).send({
                    tour: _tour,
                    Message: "SUCCESS",
                    token: req.token
                });
            } else {
                return res.status(200).send({
                    unreadyTeams: unreadyTeams,
                    Message: "Some teams aren't ready yet",
                    token: req.token
                }); 
            }
        } else {
            return res.status(200).send({
                tour: [],
                Message: "FAILURE",
                token: req.token
            });
        }
    } catch (err) {
        res.writeHead( 400, err.message, {'content-type' : 'text/plain'});
        return res.end();
    }
}

exports.doSetWinner = async (req, res, next) => {
    try {     
        if(!global.sanitize(req.body))
            throw new Error ("Request can't be started with the letter '$'");
        
        const matchId = req.body.matchId;
        const winId = req.body.winId;

        var tour = await Tour.findOne().sort({created_at: -1});
        var rounds = tour.rounds;
        var round = rounds[rounds.length - 1];
        //---- can set winner only for the match of the started round
        var available = round.status === "started" ? true : false;
        if(available) {
            //----- check if the match is in the current round
            var matchNum = -1;
            var matches = round.matches;
            for(var i = 0; i < matches.length; i++){
                if(matchId == matches[i]._id)
                    matchNum = i;
            }

            if(matchNum > -1) {
                var match = matches[matchNum];
                if(match.teamA == winId) {
                    match.winA = true;
                    match.winB = false;
                    await Team.findByIdAndUpdate({_id: match.teamA}, {matching: true});
                    await Team.findByIdAndUpdate({_id: match.teamB}, {matching: false});
                } else if (match.teamB == winId) {
                    match.winB = true;
                    match.winA = false;
                    await Team.findByIdAndUpdate({_id: match.teamB}, {matching: true});
                    await Team.findByIdAndUpdate({_id: match.teamA}, {matching: false});
                }
                match.status = "finished";
                rounds[rounds.length - 1].matches[matchNum] = match;
                await Tour.findByIdAndUpdate({_id: tour._id}, {rounds: rounds}, {new: true});

                var _rounds = await getSpecRounds(rounds);
                var _tour = {
                    _id: tour._id,
                    title: tour.title,
                    startDate: tour.startDate,
                    endDate: tour.endDate,
                    rounds: _rounds,
                    closed: tour.closed
                }
                
                return res.status(200).send({
                    tour: _tour,
                    Message: "SUCCESS",
                    token: req.token
                });

            } else {
                return res.status(200).send({
                    Message: "The MatchId isn't one of the current round's",
                    token: req.token
                });
            }
            
        } else {
            return res.status(200).send({
                Message: "Can't set winner to the match of unstarted or finished round.",
                token: req.token
            });
        }

    } catch (err) {
        res.writeHead( 400, err.message, {'content-type' : 'text/plain'});
        return res.end();
    }
}

exports.doFinishRound = async (req, res, next) => {
    try {
        var tour = await Tour.findOne().sort({created_at: -1});
        var rounds = tour.rounds;
        var round = rounds[rounds.length - 1];

        //----- can end only the started round
        if(round.status === "started") {
            //----- check if all the matches of the round are finished
            var matches = round.matches;
            var finished = true;
            for(var i = 0; i < matches.length; i++) {
                if(matches[i].status !== "finished")
                    finished = false;
            }
            if(finished) {
                //----- set tournament.ready: false for all users
                var users = await User.find();
                for(const user of users) {
                    await User.findByIdAndUpdate({_id: user._id}, {"tournament.ready": false}, {new: true});
                }
                //----- set readyForTournament: 0, signal: {}, addedToMatch: false for all teams
                var teams = await Team.find();
                for(const team of teams) {
                    await Team.findByIdAndUpdate({_id: team._id}, {"$set": {readyForTournament: 0, signal: {}, addedToMatch: false}});
                }

                //----- finish the round
                rounds[rounds.length - 1].status = "finished";
                console.log(rounds);
                await Tour.findByIdAndUpdate({_id: tour._id}, {rounds: rounds}, {new: true});
                var _rounds = await getSpecRounds(rounds);
                var _tour = {
                    _id: tour._id,
                    title: tour.title,
                    startDate: tour.startDate,
                    endDate: tour.endDate,
                    rounds: _rounds,
                    closed: tour.closed
                }
                return res.status(200).send({
                    tour: _tour,
                    Message: "SUCCESS",
                    token: req.token
                });
            } else {
                return res.status(200).send({
                    Message: "Can't finish because there is some unfinished matches.",
                    token: req.token
                });
            }
        } else {
            return res.status(200).send({
                Message: "Can't finish unstarted round.",
                token: req.token
            });
        }
    } catch (err) {
        res.writeHead( 400, err.message, {'content-type' : 'text/plain'});
        return res.end();
    }
}

exports.doCloseTournament = async (req, res, next) => {
    try {
        //----- get last tour
        var tour = await Tour.findOne().sort({created_at: -1});

        //----- check if the last tour is started but not eneded yet
        var currentDate = new Date();
        currentDate.setUTCHours(0,0,0,0);
        var startDate = new Date( tour.startDate );
        var endDate = new Date( tour.endDate );
        if(!tour.closed && currentDate >= startDate && currentDate <= endDate) { // can close the tournament
            var result = await Tour.findByIdAndUpdate({_id: tour._id}, {closed: true}, {new: true});
            if(!result) {
                res.writeHead( 500, "Can't close the tournament", {'content-type' : 'text/plain'});
                return res.end();
            }

            //----- get all the users that are available to be signed up for the current tournament
            const users = await User.find({"tournament.available": true});

            //----- clear the tournament field of the users 
            for(const user of users) {
                await User.findByIdAndUpdate({_id: user._id}, {tournament: {}}, {new: true});
            }

            var rounds = await getSpecRounds(tour.rounds);
            var _tour = {
                _id: tour._id,
                title: tour.title,
                startDate: tour.startDate,
                endDate: tour.endDate,
                rounds: rounds,
                closed: tour.closed
            }
            return res.status(200).send({
                tour: _tour,
                Message: "SUCCESS",
                token: req.token
            });
        } else {            
            return res.status(200).send({
                tour: [],
                Message: "No tournament to be closed",
                token: req.token
            });
        }
    } catch (err) {
        res.writeHead( 400, err.message, {'content-type' : 'text/plain'});
        return res.end();
    }
}

const getSpecRounds = async (rounds) => {
    var _rounds = [];
    for(const round of rounds) {
        const matches = round.matches;
        var _matches = [];
        for(const match of matches) {
            var teamA = await Team.findById({_id: match.teamA});
            var teamB = await Team.findById({_id: match.teamB});
            var _match = {
                teamA: teamA,
                readyA: match.readyA,
                winA: match.winA,
                teamB: teamB,
                readyB: match.readyB,
                winB: match.winB,
                date: match.date,
                status: match.status,
                _id: match._id
            }
            _matches.push(_match);
        }
        var _round = {
            startDate: round.startDate,
            endDate: round.endDate,
            matches: _matches,
            status: round.status,
            _id: round._id
        }
        _rounds.push(_round);
    }
    return _rounds;
}

const getLocationById = (_id, matches) => {
    for (var i = 0; i < matches.length; i++) {
        if (matches[i]._id === _id) {
            return i;
        }
    }
}
