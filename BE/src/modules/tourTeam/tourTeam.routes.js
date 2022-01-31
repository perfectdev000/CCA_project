const router = require("express").Router();
const _tourTeamService = require("./tourTeam.service");
const auth = require("../../middleware/auth");

//----- User Authentication -----
router.post("/createTeam", auth.userAuth, _tourTeamService.doCreateTeam);
router.post("/getAvailableTeamList", auth.userAuth, _tourTeamService.doGetAvailableTeamList);
router.post("/getTeamListByQuery", auth.userAuth, _tourTeamService.doGetTeamListByQuery);
router.post("/applyToTeam", auth.userAuth, _tourTeamService.doApplyToTeam);
router.post("/exitFromTeam", auth.userAuth, _tourTeamService.doExitFromTeam);
router.post("/joinToTeam", auth.userAuth, _tourTeamService.doJoinToTeam);
router.post("/outFromTeam", auth.userAuth, _tourTeamService.doOutFromTeam);
router.post("/closeTeam", auth.userAuth, _tourTeamService.doCloseTeam);
router.post("/readyForMatch", auth.userAuth, _tourTeamService.doReadyForMatch);

module.exports = router;