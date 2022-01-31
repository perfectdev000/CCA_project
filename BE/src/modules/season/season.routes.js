const router = require("express").Router();
const auth = require("../../middleware/auth");
const _seasonService = require("./season.service");
//----- Member Authentication -----
router.post("/getCurrentSeason", auth.memberAuth,  _seasonService.doGetCurrentSeason);

//----- Admin Authentication -----
router.post("/createNewSeason", auth.adminAuth, _seasonService.doCreateNewSeason);
router.post("/changeSeasonDetails/:_id", auth.adminAuth,  _seasonService.doChangeSeasonDetails);
router.get("/getById/:_id", auth.adminAuth,  _seasonService.doGetSeasonById);
router.post("/getByQuery", auth.adminAuth,  _seasonService.doGetSeasonByQuery);
router.post("/addNewGame", auth.adminAuth,  _seasonService.doAddNewGame);
router.post("/removeGameById/:_id", auth.adminAuth,  _seasonService.doRemoveGameById);
router.post("/setGameStatusResult/:_id", auth.adminAuth,  _seasonService.doSetGameStatusResult);
router.post("/closeTheSeason/:_id", auth.adminAuth,  _seasonService.doCloseTheSeason);

module.exports = router;