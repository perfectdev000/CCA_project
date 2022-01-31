const Season = require("./season.model");
const LeagueTeam = require("../leagueTeam/leagueTeam.model");
const global = require("../common/global");

exports.doCreateNewSeason = async (req, res, next) => {
    try {
        if(!global.sanitize(req.body))
            throw new Error ("Request can't be started with the letter '$'");

        const { title, startDate, endDate, capacity } = req.body;
        //----- check if the last season is ended
        var season = await Season.findOne().sort({created_at: -1});
        if(season === null || season.closed) {// can create a new season
            var newSeason = new Season ({
                title: title,
                // startDate: startDate,
                // endDate: endDate,
                capacity: capacity,
                games: [],
                closed: false
            });
            var result = await newSeason.save();
            if(!result) {
                res.writeHead( 500, "Can't Creat New Season", {'content-type' : 'text/plain'});
                return res.end();
            }

            return res.status(200).send({
                data: result,
                Message: "Successfully Created New Season",
                token: req.token
            });
        } else {
            return res.status(200).send({
                data: [],
                Message: "There is still unclosed season",
                token: req.token
            });
        }
    } catch (err) {
        res.writeHead( 400, err.message, {'content-type' : 'text/plain'});
        return res.end();
    }
}

exports.doChangeSeasonDetails = async (req, res, next) => {
    try {
        if(!global.sanitize(req.body))
            throw new Error ("Request can't be started with the letter '$'");
        if(!global.sanitize(req.params))
            throw new Error ("Request can't be started with the letter '$'");
        const { title, startDate, endDate, capacity } = req.body;
        const { _id } = req.params;
        var season = await Season.findById({_id: _id});        
        var update = {
            title: title ? title : season.title,
            startDate: startDate ? startDate : season.title,
            endDate: endDate ? endDate : season.endDate,
            capacity: capacity ? capacity : season.capacity,
            games: season.games,
            closed: season.closed
        }
        var result = await Season.findByIdAndUpdate({_id: _id}, update, {new: true});
        if(!result) {
            res.writeHead( 500, "Can't Change the Season detail", {'content-type' : 'text/plain'});
            return res.end();
        }
        return res.status(200).send({
            data: result,
            Message: "Successfully Changed Season Details",
            token: req.token
        });
    } catch (err) {
        res.writeHead( 400, err.message, {'content-type' : 'text/plain'});
        return res.end();
    }
}

exports.doGetSeasonById = async (req, res, next) => {
    try {
        if(!global.sanitize(req.params))
            throw new Error ("Request can't be started with the letter '$'");
        const { _id } = req.params;
        var result = await Season.findById({_id: _id});
        if(!result) {
            res.writeHead( 500, "Can't get Season By Id", {'content-type' : 'text/plain'});
            return res.end();
        }
        return res.status(200).send({
            data: result,
            Message: "Successfully get Season By Id",
            token: req.token
        });
    } catch (err) {
        res.writeHead( 400, err.message, {'content-type' : 'text/plain'});
        return res.end();
    }
}

exports.doGetCurrentSeason = async (req, res, next) => {
    var lastSeason = await Season.findOne().sort({created_at: -1});
    if(!lastSeason) {
        res.writeHead( 400, "There is no season", {'content-type' : 'text/plain'});
        return res.end();
    } else {
        if(lastSeason.closed) {            
            res.writeHead( 400, "There is no opened season", {'content-type' : 'text/plain'});
            return res.end();
        } else {
            return res.status(200).send({
                season: lastSeason,
                Message: "Successfully get Current Season",
                token: req.token
            });
        }
    }
}

exports.doGetSeasonByQuery = async (req, res, next) => {
    try {
        if(!global.sanitize(req.params))
            throw new Error ("Request can't be started with the letter '$'");        
        var query = Season.find();

        //---------------------------------
        //----- SOME FILTERS
        //---------------------------------
        if(!result) {
            res.writeHead( 500, "Can't get Season By Query", {'content-type' : 'text/plain'});
            return res.end();
        }
        return res.status(200).send({
            data: result,
            Message: "Successfully get Season By Query",
            token: req.token
        });
        var result = await query.exec();
    } catch (err) {
        res.writeHead( 400, err.message, {'content-type' : 'text/plain'});
        return res.end();
    }
}

exports.doAddNewGame = async (req, res, next) => {
    try {
        if(!global.sanitize(req.body))
            throw new Error ("Request can't be started with the letter '$'");
        const { seasonId, games } = req.body;
        var season = await Season.findById({_id: seasonId});        
        var update = {
            title: season.title,
            startDate: season.title,
            endDate: season.endDate,
            capacity: season.capacity,
            games: games,
            closed: season.closed
        }
        var result = await Season.findByIdAndUpdate({_id: seasonId}, update, {new: true});
        if(!result) {
            res.writeHead( 500, "Can't Add New Game", {'content-type' : 'text/plain'});
            return res.end();
        }
        return res.status(200).send({
            data: result,
            Message: "Successfully Add New Game",
            token: req.token
        });
            
    } catch (err) {
        res.writeHead( 400, err.message, {'content-type' : 'text/plain'});
        return res.end();
    }
}

exports.doRemoveGameById = async (req, res, next) => {
    try {
        if(!global.sanitize(req.body))
            throw new Error ("Request can't be started with the letter '$'");
        if(!global.sanitize(req.params))
            throw new Error ("Request can't be started with the letter '$'");
        const { gameId } = req.params;

        //----- check if the last season is still opened and not started yet
        var season = await Season.findOne().sort({created_at: -1});
        var currentDate = new Date();
        currentDate.setUTCHours(0,0,0,0);
        var startDate = new Date( season.startDate );
        if( currentDate < startDate && !season.closed ) {
            var games = season.games;
            games.splice(getLocationById(gameId, games), 1);
            var update = {
                title: season.title,
                startDate: season.title,
                endDate: season.endDate,
                capacity: season.capacity,
                games: games,
                closed: season.closed
            }
            var result = await Season.findByIdAndUpdate({_id: seasonId}, update, {new: true});
            if(!result) {
                res.writeHead( 500, "Can't Remove the Game", {'content-type' : 'text/plain'});
                return res.end();
            }
            return res.status(200).send({
                data: result,
                Message: "Successfully Remove the Game",
                token: req.token
            });
        } else {
            return res.status(200).send({
                data: [],
                Message: "No Available Season",
                token: req.token
            });
        }

    } catch (err) {
        res.writeHead( 400, err.message, {'content-type' : 'text/plain'});
        return res.end();
    }
}

exports.doSetGameStatusResult = async (req, res, next) => {
    try {
        if(!global.sanitize(req.body))
            throw new Error ("Request can't be started with the letter '$'");
        if(!global.sanitize(req.params))
            throw new Error ("Request can't be started with the letter '$'");
        const { gameId } = req.params;
        const { status, rslt} = req.body;
        //----- check if the last season is still opened and not started yet
        var season = await Season.findOne().sort({created_at: -1});
        var currentDate = new Date();
        currentDate.setUTCHours(0,0,0,0);
        var startDate = new Date( season.startDate );
        if( currentDate < startDate && !season.closed ) {
            var games = season.games;
            var game = games[getLocationById(gameId, games)];
            var update = {status: status?status:game.status, result: rslt?rslt:game.result};
            var result = await Season.findOneAndUpdate({_id: season._id, "games._id": game._id}, {'$set':  {'games.$': update}}, {new: true});
            if(!result) {
                res.writeHead( 500, "Can't Set the Game Status", {'content-type' : 'text/plain'});
                return res.end();
            }
            return res.status(200).send({
                data: result,
                Message: "Successfully Set the Game Status",
                token: req.token
            });
        } else {
            return res.status(200).send({
                data: [],
                Message: "No Available Season",
                token: req.token
            });
        }
    } catch (err) {
        res.writeHead( 400, err.message, {'content-type' : 'text/plain'});
        return res.end();
    }
}

exports.doCloseTheSeason = async (req, res, next) => {
    try {
        //----- check if the last season isn't closed yet
        var season = await Season.findOne().sort({created_at: -1});
        if(! season.closed) { // can close the season
            var result = await Season.findByIdAndUpdate({_id: season._id}, {closed: true}, {new: true});
            if(!result) {
                res.writeHead( 500, "Can't Close the Season", {'content-type' : 'text/plain'});
                return res.end();
            }
            return res.status(200).send({
                data: result,
                Message: "Successfully Close the Season",
                token: req.token
            });
        } else {
            return res.status(200).send({
                data: [],
                Message: "Season Already Closed",
                token: req.token
            });
        }
    } catch (err) {
        res.writeHead( 400, err.message, {'content-type' : 'text/plain'});
        return res.end();
    }
}

const getLocationById = (_id, arrays) => {
    for (var i = 0; i < arrays.length; i++) {
        if (arrays[i]._id === _id) {
            return i;
        }
    }
}