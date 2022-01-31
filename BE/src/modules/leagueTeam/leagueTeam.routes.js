const router = require("express").Router();
const _leagueTeamService = require("./leagueTeam.service");
const auth = require("../../middleware/auth");

//----- Member Authentication -----
router.post("/getTeamListByQuery", auth.memberAuth, _leagueTeamService.doGetTeamListByQuery);

//----- Admin Authentication -----
router.post("/createTeam", auth.adminAuth, _leagueTeamService.doCreateTeam);
router.post("/addMemberToTeam", auth.adminAuth, _leagueTeamService.doAddMemberToTeam);
router.post("/removeMemberFromTeam", auth.adminAuth, _leagueTeamService.doRemoveMemberFromTeam);
router.post("/deleteTeam", auth.adminAuth, _leagueTeamService.doDeleteTeam);

//----- User Authentication -----
router.post("/exitFromTeam", auth.userAuth, _leagueTeamService.doExitFromTeam);

module.exports = router;