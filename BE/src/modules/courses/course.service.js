const Course = require("./course.model");
const global = require("../common/global");

exports.doGetCourseListByQuery= async (req, res, next) => {
    try {
        if(!global.sanitize(req.body))
            throw new Error ("Request can't be started with the letter '$'");
        var data = req.body;
        var query = Course.find();
        const title = req.body.title;
        const _id = req.body._id;
        if(title)
            query.where({ "title": { '$regex' : title, '$options' : 'i' } });
        if(_id)
            query.where({_id: _id});
        var result = await query.exec();
        var total = await Course.count();
        data = {
            total: total,
            courses: result
        }
        return res.status(200).send({
            data: data,
            Message: "Successfully Get Courses",
            token: req.token
        }); 
    } catch (err) {
        res.writeHead( 400, err.message, {'content-type' : 'text/plain'});
        return res.end();
    }
};

exports.doGetVideoListByQuery= async (req, res, next) => {
    try {
        if(!global.sanitize(req.body))
            throw new Error ("Request can't be started with the letter '$'");
        var query = Course.findOne({_id: req.body._id}); 
        const title = req.body.title;
        if(title)
            query.where({ "title": { '$regex' : title, '$options' : 'i' } });
        var result = await query.exec();
        var data = {
            videos: result.videos
        }
        return res.status(200).send({
            data: data,
            Message: "Successfully Get Videos",
            token: req.token
        }); 
    } catch (err) {
        res.writeHead( 400, err.message, {'content-type' : 'text/plain'});
        return res.end();
    }
};

exports.doSetAsCompleted = async (req, res, next) => {
    try {
        if(!global.sanitize(req.body))
            throw new Error ("Request can't be started with the letter '$'");
        const courseId = req.body.courseId;
        const videoId = req.body.videoId;

        var course = await Course.findById({_id: courseId});
        for(var i = 0; i < course.videos.length; i++ ){
            if(course.videos[i]._id == videoId)
                course.videos[i].completed = true;
        }

        await Course.findByIdAndUpdate({_id: course._id}, {videos: course.videos}, {new: true});
        var data = {
            courses: await Course.find(),
            total: await Course.count()
        }
        return res.status(200).send({
            data: data,
            Message: "Successfully Set As Completed",
            token: req.token,
        });
    } catch (err) {
      res.writeHead( 400, err.message, {'content-type' : 'text/plain'});
    return res.end();
    }
};

exports.doAddCourse = async (req, res, next) => {
    try {
        if(!global.sanitize(req.body))
            throw new Error ("Request can't be started with the letter '$'");
        const course = new Course( req.body );
        const result = await course.save();
        if (!result) {
            res.writeHead( 500, "Cannot Add Course", {'content-type' : 'text/plain'});
            return res.end();
        }
        var data = {
            courses: await Course.find(),
            total: await Course.count()
        }
        return res.status(200).send({
            data: data,
            Message: "Course Added Successfully",
            token: req.token,
        });
    } catch (err) {
      res.writeHead( 400, err.message, {'content-type' : 'text/plain'});
    return res.end();
    }
};
exports.doDeleteCourse = async (req, res, next) => {
    try {
        if(!global.sanitize(req.body))
            throw new Error ("Request can't be started with the letter '$'");
        const result = await Course.deleteOne(req.body);
        if (!result) {
            res.writeHead( 500, "Cannot Delete Course", {'content-type' : 'text/plain'});
            return res.end();
        }
        var data = {
            courses: await Course.find(),
            total: await Course.count()
        }
        return res.status(200).send({
            data: data,
            Message: "Course Deleted Successfully",
            token: req.token,
        });
    } catch (err) {
      res.writeHead( 400, err.message, {'content-type' : 'text/plain'});
    return res.end();
    }
};
exports.doAddVideo = async (req, res, next) => {
    try {
        if(!global.sanitize(req.body))
            throw new Error ("Request can't be started with the letter '$'");
        const _id = req.body._id; console.log(_id);
        const title = req.body.title;
        const link = req.body.link;
        
        var result = await Course.findOne({_id: _id});
        var videos = result.videos;
        videos.push({
            title: title,
            link: link
        });
        console.log(videos);
        result = await Course.findByIdAndUpdate({_id: _id}, {videos: videos}, {new: true});
        if (!result) {
            res.writeHead( 500, "Cannot Add Video", {'content-type' : 'text/plain'});
            return res.end();
        }
        var data = {
            videos: videos
        }
        return res.status(200).send({
            data: data,
            Message: "Video Added Successfully",
            token: req.token,
        });
    } catch (err) {
      res.writeHead( 400, err.message, {'content-type' : 'text/plain'});
    return res.end();
    }
};
exports.doDeleteVideo = async (req, res, next) => {
    try {
        if(!global.sanitize(req.body))
            throw new Error ("Request can't be started with the letter '$'");
        const _id = req.body._id;
        const videoId = req.body.videoId;
        var videos = await Course.findOne({_id: _id});
        videos = videos.videos;
        for(var i = 0; i < videos.length; i++ ){
            if(videos[i]._id == videoId){
                videos.splice(i, 1);
                break;
            }                
        }
        console.log(videos);
        result = await Course.findByIdAndUpdate({_id: _id}, {videos: videos}, {new: true});
        if (!result) {
            res.writeHead( 500, "Cannot Delete Video", {'content-type' : 'text/plain'});
            return res.end();
        }
        var data = {
            videos: videos
        }
        return res.status(200).send({
            data: data,
            Message: "Video Deleted Successfully",
            token: req.token,
        });
    } catch (err) {
        res.writeHead( 400, err.message, {'content-type' : 'text/plain'});
        return res.end();
    }
};