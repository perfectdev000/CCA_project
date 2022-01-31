const router = require("express").Router();
const auth = require("../../middleware/auth");
const _userService = require("./signup.service");

//----- No Authentication -----
router.post("/signup", _userService.doSignup);
router.post("/login", _userService.doLogin);
router.post("/loginWithDiscord", _userService.doLoginWithDiscord);
router.post("/emailCheck", _userService.emailCheck);

//----- User Authentication -----
router.post("/countByQuery", auth.userAuth, _userService.countByQuery);
router.delete("/deleteItself", auth.userAuth, _userService.doDeleteUserById);
router.get("/getItself", auth.userAuth,  _userService.doGetUserById);
router.post("/buySubscription/:_id", auth.userAuth, _userService.doBuySubscription);
router.post("/linkDiscord", auth.userAuth, _userService.doLinkDiscord);
router.post("/updateUserById/:_id", auth.userAuth, _userService.doUpdateUserById);

//----- Member Authentication -----
router.post("/signUpForSeason", auth.memberAuth, _userService.doSignUpForSeason);
router.post("/signOutFromSeason", auth.memberAuth, _userService.doSignOutFromSeason);
router.post("/signUpForTour", auth.memberAuth, _userService.doSignUpForTour);
router.post("/signOutFromTour", auth.memberAuth, _userService.doSignOutFromTour);
router.post("/signOutFromTour", auth.memberAuth, _userService.doSignOutFromTour);
router.post("/getCCAPlayers", auth.memberAuth, _userService.doGetCCAPlayers);
router.post("/getByQuery", auth.memberAuth, _userService.doGetByQuery);
router.post("/getAllCoaches", auth.memberAuth, _userService.doSetCoachTimes);
router.post("/buyCoachTime", auth.memberAuth, _userService.doBuyCoachTime);
router.post("/bookCoachTime", auth.memberAuth, _userService.doBookCoachTime);
router.get("/getById/:_id", auth.memberAuth,  _userService.doGetUserById);

//----- Coach Authentication -----
router.post("/setCoachTimes/:_id", auth.coachAuth, _userService.doSetCoachTimes);
router.post("/cancelCoachTimes/:_id", auth.coachAuth, _userService.doCancelCoachTimes);
router.post("/manageSession", auth.coachAuth, _userService.doManageSession);


//----- Admin Authentication -----
router.get("/deleteUserById/:_id", auth.adminAuth,  _userService.doDeleteUserById);
router.post("/setAvailableForTourById/:_id", auth.adminAuth, _userService.doSetAvailableForTourById);
router.post("/adminChangeUserType/:_id", auth.adminAuth, _userService.doUpdateUserById);

//----- Super Admin Authentication -----
router.post("/getAllAdmins", auth.superadminAuth, _userService.doGetByQuery); 
router.post("/setUserRoleForSeasonById/:_id", auth.superadminAuth,  _userService.doSetUserRoleForSeasonById);
router.post("/superadminChangeUserType/:_id", auth.superadminAuth, _userService.doUpdateUserById);
router.post("/formatDB", auth.superadminAuth, _userService.doFormatDB);

module.exports = router;
