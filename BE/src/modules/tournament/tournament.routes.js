const router = require("express").Router();
const _tourService = require("./tournament.service");
const auth = require("../../middleware/auth");

//----- User Authentication -----
router.post("/getCurrentTournament", auth.userAuth, _tourService.doGetCurrentTournament);

//----- Admin Authentication -----
router.post("/createNewTournament", auth.adminAuth, _tourService.doCreateNewTournament);
router.post("/createNewRound", auth.adminAuth, _tourService.doCreateNewRound);
router.post("/addNewMatch", auth.adminAuth, _tourService.doAddNewMatch);
router.post("/removeNewMatch", auth.adminAuth, _tourService.doRemoveNewMatch);
router.post("/signalToTeams", auth.adminAuth, _tourService.doSignalToTeams);
router.post("/startRound", auth.adminAuth, _tourService.doStartRound);
router.post("/setWinner", auth.adminAuth, _tourService.doSetWinner);
router.post("/finishRound", auth.adminAuth, _tourService.doFinishRound);
router.post("/closeTournament", auth.adminAuth, _tourService.doCloseTournament);

module.exports = router;