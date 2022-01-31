const Team = require("./tourTeam.model");
const Tour = require("../tournament/tournament.model");
const User = require("../userSignUp/signup.model");
const global = require("../common/global");

exports.doCreateTeam = async (req, res, next) => {
    try {
        if(!global.sanitize(req.body.data))
            throw new Error ("Request can't be started with the letter '$'");
        if(!global.sanitize(req.body.query))
            throw new Error ("Request can't be started with the letter '$'");
        
        //----- check if the last tournament is opened and still not started.
        var count = await Tour.count();
        if(count) {
            var tour = await Tour.findOne().sort({created_at: -1});
            var currentDate = new Date();
            currentDate.setUTCHours(0,0,0,0);
            var startDate = new Date( tour.startDate );
            if( currentDate < startDate && !tour.closed ) {
                //----- check if the creator already has got a team 
                var result = await User.findById({_id: req.body.data.creator});
                if(result.tournament.type !== "") { //----- creator or player can't create more than one team
                    return res.status(200).send({
                        data: [],
                        Message: "Can't create more than one team",
                        token: req.token
                    });
                } else {
                    //----- check if the same team name already exists
                    result = await Team.count({ name: req.body.data.name });
                    if(result > 0) { //----- name repeat
                        return res.status(200).send({
                            data: [],
                            Message: "The same name already exists",
                            token: req.token
                        });
                    } else {
                        //----- create a new team
                        const team = new Team( {
                            name: req.body.data.name,
                            creator: req.body.data.creator,
                            players: [],
                            pendingInvites: [],
                            readyForTournament: false,
                            tourId: tour._id,
                            signal: {}
                        } );
                        result = await team.save();
                        if (!result) { //----- if something went wrong
                            res.writeHead( 500, "Cannot Create a Team", {'content-type' : 'text/plain'});
                            return res.end();
                        }

                        //----- update the creator's user info
                        const query =  { 
                            _id: req.body.data.creator
                        }
                        const update = {
                            "tournament.teamId": result._id,
                            "tournament.type": "creator",
                        }
                        await User.findByIdAndUpdate(query, {"$set": update}, {new: true});

                        //----- get team list by query and response it
                        result = await getTeamListByQuery(req.body.query, next);
                        const user = await User.findById({_id: req.body.data.creator});
                        var data = {
                            teams: result,
                            user: user
                        }
                        return res.status(200).send({
                            data: data,
                            Message: "Team Created Successfully",
                            token: req.token
                        });
                    }
                }
            } else {
                return res.status(200).send({
                    Message: "Can't create team for the closed or started tournament",
                    token: req.token
                });
            }
        } else {
            return res.status(200).send({
                data: [],
                Message: "No opened tourmanent yet",
                token: req.token
            });
        }
    } catch (err) {
        res.writeHead( 400, err.message, {'content-type' : 'text/plain'});
        return res.end();
    }
};

exports.doGetTeamListByQuery = async (req, res, next) => { console.log("here");
    try {
        if(!global.sanitize(req.body))
            throw new Error ("Request can't be started with the letter '$'");
        
        var result = await getTeamListByQuery(req.body, next);
        
        return res.status(200).send({
            data: result,
            Message: "Successfully Get Team Lists",
            token: req.token
        });
    } catch (err) {
        res.writeHead( 400, err.message, {'content-type' : 'text/plain'});
        return res.end();
    }
};

exports.doGetAvailableTeamList = async (req, res, next) => {
    try {
        //----- get the teams have got matching -> true
        var result = await getTeamListByQuery({matching: true}, next);

        // //----- Filter teams with the condition of players.length = 4 (all the members are ready)
        // var _result = [];
        // for(var i = 0; i < result.length; i++) {
        //     if(result[i].players.length === 4) {
        //         _result.push(result[i]);
        //     }
        // }
        // console.log(_result);
        return res.status(200).send({
            data: result,
            Message: "Successfully Get Team Lists",
            token: req.token
        });
    } catch (err) {
        res.writeHead( 400, err.message, {'content-type' : 'text/plain'});
    return res.end();
    }
};

exports.doApplyToTeam = async (req, res, next) => {
    try {
        if(!global.sanitize(req.body.data))
            throw new Error ("Request can't be started with the letter '$'");
        if(!global.sanitize(req.body.query))
            throw new Error ("Request can't be started with the letter '$'");
        const userId = req.body.data.userId;
        const teamId = req.body.data.teamId;
        const apply = req.body.data.apply;
        const query = req.body.query;

        var user = await User.findById({_id: userId});

        //----- check if the user's available still remains as true
        //----- check if the user's type still remains as ""
        //----- check if the user applied to this team
        var appliedToThisTeam = false;
        if(user.tournament.applies.length)
            appliedToThisTeam = user.tournament.applies.indexOf(teamId) > -1 ? true : false;
            console.log(appliedToThisTeam);
        if(apply) {
            if(user.tournament.available === true && user.tournament.type === "" && !appliedToThisTeam) {
                //---- append the userId to the team's pendingInvites list
                const team = await Team.findById({_id: teamId});
                var pendingInvites = team.pendingInvites;
                pendingInvites.push(userId);
                await Team.findByIdAndUpdate({_id: teamId}, {pendingInvites: pendingInvites}, { new: true });

                //---- append teamId to the user's applies list
                var applies = user.tournament.applies;
                if(!applies) applies = [];
                console.log(applies);
                applies.push(teamId);
                await User.findByIdAndUpdate({_id: userId}, {"tournament.applies": applies}, { new: true });
            } else {
                return res.status(200).send({
                    data: [],
                    Message: "Failed to apply to the team",
                    token: req.token
                });
            }    
        } else {
            if(user.tournament.available === true && user.tournament.type === "" && appliedToThisTeam) {
                //---- append the userId to the team's pendingInvites list
                const team = await Team.findById({_id: teamId});
                var pendingInvites = team.pendingInvites;
                pendingInvites.push(userId);
                await Team.findByIdAndUpdate({_id: teamId}, {pendingInvites: pendingInvites}, { new: true });

                //---- remove teamId from the user's applies list
                var applies = user.tournament.applies;
                applies.splice(applies.indexOf(teamId), 1);
                await User.findByIdAndUpdate({_id: userId}, {"$set":{"tournament.applies": applies, "tournament.ready": false}}, { new: true });
            } else {
                return res.status(200).send({
                    data: [],
                    Message: "Failed to cancel apply from the team",
                    token: req.token
                });
            }
        }    

        //----- Find Team List By Query And Response
        result = await getTeamListByQuery(query, next);
        user = await User.findById({_id: userId});
        var data = {
            teams: result,
            user: user
        }
        return res.status(200).send({
            data: data,
            Message: "SUCCESS",
            token: req.token
        });
    } catch (err) {
        res.writeHead( 400, err.message, {'content-type' : 'text/plain'});
        return res.end();
    }
}

//----- cancel apply
exports.doExitFromTeam = async (req, res, next) => {
    try {
        if(!global.sanitize(req.body.data))
            throw new Error ("Request can't be started with the letter '$'");
        if(!global.sanitize(req.body.query))
            throw new Error ("Request can't be started with the letter '$'");
        const  teamId = req.body.data.teamId,
            userId = req.body.data.playerId,
            query = req.body.query;
        //----- check if the user's available still remains as true
        //----- check if the user's type still remains as "player"
        //----- check if the user applied to this team
        var user =  await User.findById({_id: userId});
        if(user.tournament.available === true && user.tournament.type === "player" && user.tournament.teamId == teamId) {
            
            //----- Remove userId from the team's pendingInvites list
            const team = await Team.findById({_id: teamId});
            var players = team.players;
            players.splice(players.indexOf(userId), 1);

            var pendingInvites = team.pendingInvites;
            if(!pendingInvites) pendingInvites = [];
            pendingInvites.push(userId);

            await Team.findByIdAndUpdate({_id: teamId}, {"$set":{players: players, pendingInvites: pendingInvites}}, { new: true });


            //----- add the teamId to the user's tournament.applies
            //----- set the user's tournament.type to the ""
            user = await User.findById({_id: userId});
            var applies = user.tournament.applies;
            if(!applies) applies = [];
            applies.push(teamId);
            await User.findByIdAndUpdate({_id: userId}, {"$set": {"tournament.applies":applies, "tournament.type":"", "tournament.ready": false}}, {new: true});
        } else {
            return res.status(200).send({
                data: [],
                Message: "Failed to exit from the team",
                token: req.token
            });
        }
        var result = await getTeamListByQuery(query, next);
        user = await User.findById({_id: userId});
        var data = {
            teams: result,
            user: user
        }
        return res.status(200).send({
            data: data,
            Message: "SUCCESS",
            token: req.token
        });
    } catch (err) {
        res.writeHead( 400, err.message, {'content-type' : 'text/plain'});
        return res.end();
    }
};

exports.doJoinToTeam = async (req, res, next) => {
    try {
        if(!global.sanitize(req.body.data))
            throw new Error ("Request can't be started with the letter '$'");
        if(!global.sanitize(req.body.query))
            throw new Error ("Request can't be started with the letter '$'");
        const  teamId = req.body.data.teamId,
            userId = req.body.data.pendingId,
            query = req.body.query;

        //----- check if the user's available still remains as true
        //----- check if the user's type still remains as ""
        //----- check if the user applied to this team
        var user =  await User.findById({_id: userId});
        var appliedToThisTeam = user.tournament.applies.indexOf(teamId) > -1 ? true : false;
        if( user.tournament.available && user.tournament.type === "" && appliedToThisTeam ) { // the user can be joined to the team
            //----- Remove userId from the team's pendingInvites list and append it to the players list
            const team = await Team.findById({_id: teamId});
            var pendingInvites = team.pendingInvites;
            pendingInvites.splice(pendingInvites.indexOf(userId), 1);
            var players = team.players;

            //----- check if the room is full or not
            if(players.length < 4) {
                players.push(userId);
                await Team.findByIdAndUpdate({_id: teamId}, {"$set":{pendingInvites: pendingInvites, players: players}}, { new: true });

                //----- remove the teamId from the user's tournament.applies list
                //----- set the teamId to the user's tournament.teamId and its type to the "player"        
                var applies = user.tournament.applies;
                applies.splice(applies.indexOf(teamId), 1);
                await User.findByIdAndUpdate({_id: userId}, {"$set": {"tournament.teamId": teamId, "tournament.type":"player", "tournament.applies": applies}}, {new: true});

                var result = await getTeamListByQuery(query, next);
                return res.status(200).send({
                    data: result,
                    Message: "SUCCESS",
                    token: req.token
                });
            } else {
                return res.status(200).send({
                    data: [],
                    Message: "Failed To Join Team : The room is full",
                    token: req.token
                });
            }
        } else {
            return res.status(200).send({
                data: [],
                Message: "Failed To Join Team",
                token: req.token
            });
        }
    } catch (err) {
        res.writeHead( 400, err.message, {'content-type' : 'text/plain'});
        return res.end();
    }
};

exports.doOutFromTeam = async (req, res, next) => {
    try {
        if(!global.sanitize(req.body.data))
            throw new Error ("Request can't be started with the letter '$'");
        if(!global.sanitize(req.body.query))
            throw new Error ("Request can't be started with the letter '$'");
        const  teamId = req.body.data.teamId,
            userId = req.body.data.userId,
            query = req.body.query;
        //----- check if user's available still remains as true
        //----- check if user's type still remains as "player"
        //----- check if user's teamId is the same with the provided teamId
        var user = await User.findById({_id: userId}); 
        if( user.tournament.available && user.tournament.type === "player" && user.tournament.teamId == teamId){
        
            //----- remove myId from the team's players list
            const team = await Team.findById({_id: teamId});
            var players = team.players;
            players.splice(players.indexOf(userId), 1);
            await Team.findByIdAndUpdate({_id: teamId}, {players: players}, {new: true});

            //----- set my tournament.type to ""
            await User.findByIdAndUpdate({_id: userId}, {"$set":{"tournament.type" : "", "tournament.ready": false}}, {new: true});

            var result = await getTeamListByQuery(query, next);
            user = await User.findById({_id: userId});
            var data = {
                teams: result,
                user: user
            }
            return res.status(200).send({
                data: data,
                Message: "SUCCESS",
                token: req.token
            });
        } else {
            return res.status(200).send({
                data: [],
                Message: "Failed To Out From Team",
                token: req.token
            });
        }
    } catch (err) {
        res.writeHead( 400, err.message, {'content-type' : 'text/plain'});
        return res.end();
    }
};

exports.doCloseTeam = async (req, res, next) => {
    try {
        if(!global.sanitize(req.body.data))
            throw new Error ("Request can't be started with the letter '$'");
        if(!global.sanitize(req.body.query))
            throw new Error ("Request can't be started with the letter '$'");
        const  teamId = req.body.data.teamId,
            userId = req.body.data.userId,
            query = req.body.query;
        //----- Check if the user is the team's creator or not
        const teams = await Team.find({_id: teamId, creator: userId});
        if(teams.length){
            const team = teams[0];
            //----- if this team is added to match, it can't be closed
            if(!team.addedToMatch) {
                //----- remove this teamId from the user's tournament.applies list of pending users
                var pendingInvites = team.pendingInvites;
                for (const item of pendingInvites) {
                    const user = await User.findById({_id: item});
                    var applies = user.tournament.applies;
                    applies.splice(applies.indexOf(teamId), 1);
                    await User.findByIdAndUpdate({_id: item}, {"tournament.applies": applies}, {new: true});
                }

                //----- set the player's tournament.type to ""
                var players = team.players;
                for (const item of players) {
                    await User.findByIdAndUpdate({_id: item}, {"$set":{"tournament.type" : "", "tournament.ready": false}}, {new: true});
                }

                //----- set my tournament.type to ""
                await User.findByIdAndUpdate({_id: userId}, {"$set":{"tournament.type" : "", "tournament.ready": false}}, {new: true});

                //----- Delete this team from the teams table
                await Team.findByIdAndDelete({_id: teamId});

                var result = await getTeamListByQuery(query, next);
                const user = await User.findById({_id: userId});
                var data = {
                    teams: result,
                    user: user
                }
                return res.status(200).send({
                    data: data,
                    Message: "SUCCESS",
                    token: req.token
                });
            } else {
                return res.status(200).send({
                    data: [],
                    Message: "Can't be closed because this team is added to the Match now.",
                    token: req.token
                });
            }
        } else {
            return res.status(200).send({
                data: [],
                Message: "Failed: the user isn't creator so he can't close the team",
                token: req.token
            });
        }
    } catch (err) {
        res.writeHead( 400, err.message, {'content-type' : 'text/plain'});
    return res.end();
    }
};

exports.doReadyForMatch = async (req, res, next) => {
    try {
        if(!global.sanitize(req.body.data))
            throw new Error ("Request can't be started with the letter '$'");
        if(!global.sanitize(req.body.query))
            throw new Error ("Request can't be started with the letter '$'");
        const  teamId = req.body.data.teamId,
            userId = req.body.data.userId,
            query = req.body.query;
        
        //----- Set the user's tournament.ready to true
        await User.findByIdAndUpdate({_id: userId}, {"tournament.ready": true}, {new: true});
        var curUser = await User.findById({_id: userId});
        //----- Calculate team's readyForTournament
        var team = await Team.findById({_id: teamId});
        var readyNum = 0;
        var creator = await User.findById({_id: team.creator});
        if(creator.tournament.ready)
            readyNum++;

        for(const player of team.players) {
            var user = await User.findById({_id: player});
            if(user.tournament.ready)
                readyNum++;
        }

        await Team.findByIdAndUpdate ({_id: team._id}, {readyForTournament: readyNum});
        var team = await Team.findById({_id: teamId});
        res.status(200).send ({
            team: team,
            tournament: curUser.tournament,
            Message: "SUCCESS",
            token: req.token
        })
        
    } catch (err) {
        res.writeHead( 400, err.message, {'content-type' : 'text/plain'});
        return res.end();
    }
};
//----- GLOBAL USAGE ----- 
const getTeamListByQuery = async (qu, next) => {
    const total = await Team.count();
    var query = Team.find(qu);
    //----- Add some filters here

    var teams = await query.exec();
    console.log(teams);
    var _teams = [];
    if(teams.length) {
        //----- find the related users data and add to the teams data
        for (const item of teams) {
            //----- calculate the readyForTournament of each team and update
            var readyNum = 0;
            var creator = await User.findById({_id: item.creator});
            if(creator != null && creator.tournament.ready)
                readyNum++;

            var players = [];
            if(item.players.length)
                for ( const player of item.players ){
                    var temp = await User.findById({_id: player});
                    players.push(temp);
                    if(temp.tournament.ready)
                        readyNum++;
                }
            
            await Team.findByIdAndUpdate ({_id: item._id}, {readyForTournament: readyNum});

            var pendingInvites = [];
            for ( const pendingInvite of item.pendingInvites){
                var temp = await User.findById({_id: pendingInvite});
                pendingInvites.push(temp);
            }
            
            _teams.push({
                _id: item._id,
                name: item.name,
                creator: creator,
                players: players,
                pendingInvites: pendingInvites,
                readyForTournament: readyNum,
                signal: item.signal
            });
        }
    }
    return {
        teams: _teams,
        total: total
    }
}

