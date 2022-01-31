const router = require("express").Router();
const _courseService = require("./course.service");
const auth = require("../../middleware/auth");

//----- Member Authentication -----
router.post("/getCourseListByQuery", auth.memberAuth, _courseService.doGetCourseListByQuery);
router.post("/getVideoListByQuery", auth.memberAuth, _courseService.doGetVideoListByQuery);
router.post("/setAsCompleted", auth.memberAuth, _courseService.doSetAsCompleted);

//----- admin Authentication -----
router.post("/addCourse", auth.memberAuth, _courseService.doAddCourse);
router.post("/addVideo", auth.memberAuth, _courseService.doAddVideo);
router.post("/deleteCourse", auth.memberAuth, _courseService.doDeleteCourse);
router.post("/deleteVideo", auth.memberAuth, _courseService.doDeleteVideo);

module.exports = router;