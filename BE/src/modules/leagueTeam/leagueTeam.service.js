const LeagueTeam = require("./leagueTeam.model");
const User = require("../userSignUp/signup.model");
const Season = require("../season/season.model");
const global = require("../common/global");

exports.doCreateTeam = async (req, res, next) => {
    try {
        if(!global.sanitize(req.body))
            throw new Error ("Request can't be started with the letter '$'");

        //----- check if the last season is still opened and not started yet
        var season = await Season.findOne().sort({created_at: -1});
        // var currentDate = new Date();
        // currentDate.setUTCHours(0,0,0,0);
        // var startDate = new Date( season.startDate );
        // if( currentDate < startDate && !season.closed ) {
        if( !season.closed ) {  // the last season is available for creating new team for it
            //check if the same name already exists
            var count = await LeagueTeam.count ({name: req.body.name, seasonId: req.body.seasonId});
            //check if the capacity is full
            var count1 = await LeagueTeam.count ({seasonId: req.body.seasonId});
            console.log(count1);
            console.log(season.capacity);
            if(!count) {
                if(count1 < season.capacity) {
                    var leagueTeam = new LeagueTeam ({
                        name: req.body.name,
                        mid: [],
                        top: [],
                        adc: [],
                        jungle: [],
                        support: [],
                        coach: [],
                        readyForLeague: false,
                        seasonId: season._id
                    });
                    var result = await leagueTeam.save();
                    if(!result) {
                        res.writeHead( 500, "Can't Creat League Team", {'content-type' : 'text/plain'});
                        return res.end();
                    }
                    var data = await LeagueTeam.find({seasonId: result.seasonId});
                    return res.status(200).send({
                        data: data,
                        Message: "Successfully Created League Team",
                        token: req.token
                    });
                } else {
                    res.writeHead( 400, "Can't add anymore.", {'content-type' : 'text/plain'});
                    return res.end();
                }
            } else {
                res.writeHead( 400, "Same name already exists", {'content-type' : 'text/plain'});
                return res.end();
            }
        } else {
            res.writeHead( 400, "No Season Available For Creating League Team", {'content-type' : 'text/plain'});
            return res.end();
        }
    } catch (err) {
        res.writeHead( 400, err.message, {'content-type' : 'text/plain'});
        return res.end();
    }
};

exports.doGetTeamListByQuery = async (req, res, next) => {
    try {
        if(!global.sanitize(req.body))
            throw new Error ("Request can't be started with the letter '$'");
        var query = LeagueTeam.find();
        const seasonId = req.body.seasonId;
        if(seasonId)
            query.where({seasonId: seasonId});
        //---------------------------
        //----- Some Filters
        //---------------------------
        var result = await query.exec();
        if(!result) {
            res.writeHead( 500, "Can't get League Teams", {'content-type' : 'text/plain'});
            return res.end();
        }

        return res.status(200).send({
            data: result,
            Message: "Successfully Get League Teams By Query",
            token: req.token
        });
    } catch (err) {
        res.writeHead( 400, err.message, {'content-type' : 'text/plain'});
        return res.end();
    }
};

exports.doAddMemberToTeam = async (req, res, next) => {
    try {
        if(!global.sanitize(req.body))
            throw new Error ("Request can't be started with the letter '$'");
        const {  newTeam, userId, oldTeam, role } = req.body;
        console.log(req.body);
        var result;
        if(!oldTeam) {
            console.log("OK");
        } else { // if old team has got the user as a player remove him from there
            var team = await LeagueTeam.findById({_id: oldTeam});
            switch (role) {
                case "mid":
                    if(team.mid.length && team.mid[0] == userId) {
                        await LeagueTeam.findByIdAndUpdate({_id: oldTeam}, {mid: []}, {new: true});
                    }
                    break;            
                case "adc":
                    if(team.adc.length && team.adc[0] == userId) {
                        await LeagueTeam.findByIdAndUpdate({_id: oldTeam}, {adc: []}, {new: true});
                    }
                    break;
                case "top":
                    if(team.top.length && team.top[0] == userId) {
                        await LeagueTeam.findByIdAndUpdate({_id: oldTeam}, {top: []}, {new: true});
                    }
                    break;
                case "jungle":
                    if(team.jungle.length && team.jungle[0] == userId) {
                        await LeagueTeam.findByIdAndUpdate({_id: oldTeam}, {jungle: []}, {new: true});
                    }
                    break;
                case "support":
                    if(team.support.length && team.support[0] == userId) {
                        await LeagueTeam.findByIdAndUpdate({_id: oldTeam}, {support: []}, {new: true});
                    }
                    break;
                case "coach":
                    if(team.coach.length && team.coach[0] == userId) {
                        await LeagueTeam.findByIdAndUpdate({_id: oldTeam}, {coach: []}, {new: true});
                    }
                    break;
            }
        }
        // if newTeam is provided check if the role is already includes user and add user
        if(newTeam !== "") {
            var team = await LeagueTeam.findById({_id: newTeam});
            switch (role) {
                case "mid":
                    if(!team.mid.length)
                        result = await LeagueTeam.findByIdAndUpdate({_id: newTeam}, {mid: [userId]}, {new: true});
                    else
                        result = "repeat";
                    break;
                case "adc":
                    if(!team.adc.length)
                        result = await LeagueTeam.findByIdAndUpdate({_id: newTeam}, {adc: [userId]}, {new: true});
                    else
                        result = "repeat";
                    break;
                case "top":
                    if(!team.top.length)
                        result = await LeagueTeam.findByIdAndUpdate({_id: newTeam}, {top: [userId]}, {new: true});
                    else
                        result = "repeat";
                    break;
                case "jungle":
                    if(!team.jungle.length)                        
                        result = await LeagueTeam.findByIdAndUpdate({_id: newTeam}, {jungle: [userId]}, {new: true});
                    else
                        result = "repeat";
                    break;
                case "support":
                    if(!team.support.length)                        
                        result = await LeagueTeam.findByIdAndUpdate({_id: newTeam}, {support: [userId]}, {new: true});
                    else
                        result = "repeat";
                    break;
                case "coach":
                    if(!team.coach.length)                        
                        result = await LeagueTeam.findByIdAndUpdate({_id: newTeam}, {coach: [userId]}, {new: true});
                    else
                        result = "repeat";
                    break;
            }
            if(result === "repeat") {
                res.writeHead( 400, "Can't Add more than one member to League Team", {'content-type' : 'text/plain'});
                return res.end();
            }
        }

        //----- set teamId to the user's season.teamId
        //----- set role to the user's season.role
        var user = await User.findById({_id: userId});
        var season = user.season;
        var update;
        if(newTeam !== "") {
            update = {
                season: {
                    signedUp: true,
                    assigned: true,
                    role: role,
                    teamId: newTeam
                }
            }
        } else {
            update = {
                season: {
                    signedUp: true,
                    assigned: false,
                    role: role
                }
            }
        }
        await User.findByIdAndUpdate({_id: userId}, update, {new: true});

        return res.status(200).send({
            Message: "Successfully Add the member",
            token: req.token
        });
    } catch (err) {
        res.writeHead( 400, err.message, {'content-type' : 'text/plain'});
        return res.end();
    }
};

exports.doRemoveMemberFromTeam = async (req, res, next) => {
    try {
        if(!global.sanitize(req.body))
            throw new Error ("Request can't be started with the letter '$'");
        const { userId, role, teamId } = req.body;
        var result;
        switch (role) {
            case "mid":
                result = await LeagueTeam.findByIdAndUpdate({_id: teamId}, {mid: []}, {new: true});
                break;
            case "adc":
                result = await LeagueTeam.findByIdAndUpdate({_id: teamId}, {adc: []}, {new: true});
                break;
            case "top":
                result = await LeagueTeam.findByIdAndUpdate({_id: teamId}, {top: []}, {new: true});
                break;
            case "jungle":
                result = await LeagueTeam.findByIdAndUpdate({_id: teamId}, {jungle: []}, {new: true});
                break;
            case "support":
                result = await LeagueTeam.findByIdAndUpdate({_id: teamId}, {support: []}, {new: true});
                break;
            case "coach":
                result = await LeagueTeam.findByIdAndUpdate({_id: teamId}, {coach: []}, {new: true});
                break;
        }
        if(!result) {
            res.writeHead( 500, "Can't Add member to League Team", {'content-type' : 'text/plain'});
            return res.end();
        }

        //----- set user's season.assigned to false
        var user = await User.findById({_id: userId});
        var season = user.season;
        var update = {
            season: {
                signedUp: season.signedUp,
                assigned: false,
                role: role,
                teamId: season.teamId
            }
        }
        await User.findByIdAndUpdate({_id: userId}, update, {new: true});

        return res.status(200).send({
            data: result,
            Message: "Successfully removed the member",
            token: req.token
        });
    } catch (err) {
        res.writeHead( 400, err.message, {'content-type' : 'text/plain'});
        return res.end();
    }
};

exports.doDeleteTeam = async (req, res, next) => {
    try {
        if(!global.sanitize(req.body))
            throw new Error ("Request can't be started with the letter '$'");
        var { teamId } = req.body;

        //----- set each member's assigned to false
        var leagueTeam = await LeagueTeam.findById({_id: teamId});
        if(leagueTeam.coach.length) 
            await User.findByIdAndUpdate ({_id: leagueTeam.coach[0]}, {"season.assigned": false}, {new: true});
        if(leagueTeam.mid.length) 
            await User.findByIdAndUpdate ({_id: leagueTeam.mid[0]}, {"season.assigned": false}, {new: true});
        if(leagueTeam.top.length) 
            await User.findByIdAndUpdate ({_id: leagueTeam.top[0]}, {"season.assigned": false}, {new: true});
        if(leagueTeam.adc.length) 
            await User.findByIdAndUpdate ({_id: leagueTeam.adc[0]}, {"season.assigned": false}, {new: true});
        if(leagueTeam.jungle.length) 
            await User.findByIdAndUpdate ({_id: leagueTeam.jungle[0]}, {"season.assigned": false}, {new: true});
        if(leagueTeam.support.length) 
            await User.findByIdAndUpdate ({_id: leagueTeam.support[0]}, {"season.assigned": false}, {new: true});

        //----- delete league team from the league team table
        var result = await LeagueTeam.findByIdAndDelete({_id: teamId});
        if(!result) {
            res.writeHead( 500, "Can't delete League Team", {'content-type' : 'text/plain'});
            return res.end();
        }

        var data = await LeagueTeam.find({seasonId: leagueTeam.seasonId});
        return res.status(200).send({
            data: data,
            Message: "Successfully Delete League Team",
            token: req.token
        });
    } catch (err) {
        res.writeHead( 400, err.message, {'content-type' : 'text/plain'});
        return res.end();
    }
};

exports.doExitFromTeam = async (req, res, next) => {
    try {
        if(!global.sanitize(req.body))
            throw new Error ("Request can't be started with the letter '$'");
        if(!global.sanitize(req.params))
            throw new Error ("Request can't be started with the letter '$'");

        const { _id } = req.params;
        const { role, teamId } = req.body;

        //----- remove user from the team
        var result;
        switch (role) {
            case "mid":
                result = await LeagueTeam.findByIdAndUpdate({_id: teamId}, {mid: []}, {new: true});
                break;
            case "adc":
                result = await LeagueTeam.findByIdAndUpdate({_id: teamId}, {adc: []}, {new: true});
                break;
            case "top":
                result = await LeagueTeam.findByIdAndUpdate({_id: teamId}, {top: []}, {new: true});
                break;
            case "jungle":
                result = await LeagueTeam.findByIdAndUpdate({_id: teamId}, {jungle: []}, {new: true});
                break;
            case "support":
                result = await LeagueTeam.findByIdAndUpdate({_id: teamId}, {support: []}, {new: true});
                break;
            case "coach":
                result = await LeagueTeam.findByIdAndUpdate({_id: teamId}, {coach: []}, {new: true});
                break;
        }
        if(!result) {
            res.writeHead( 500, "Can't Add member to League Team", {'content-type' : 'text/plain'});
            return res.end();
        }

        //----- set user's season.assigned to false
        var user = await User.findById({_id: _id});
        var season = user.season;
        season.assigned = false;
        await User.findByIdAndUpdate({_id: _id}, {season: season}, {new: true});

        return res.status(200).send({
            data: result,
            Message: "Successfully exit from the League Team",
            token: req.token
        });
    } catch (err) {
        res.writeHead( 400, err.message, {'content-type' : 'text/plain'});
        return res.end();
    }
};