const jwt = require("jsonwebtoken");
const User = require("../modules/userSignUp/signup.model");

const auth = async (token, req, res, next) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    var user = await User.findOne({
      _id: decoded._id
    });
    if (!user) {
      throw new Error();
    } else {
      req.token = await user.generateAuthToken();
      req.user = user;
      if(req.params._id);
        // console.log(req.params);
      else 
        req.params = { _id: decoded._id};
      next();
    }
  } catch (e) {
    res.status(401).send({ error: "Please authenticate." });
  }
}

exports.userAuth = async (req, res, next) => {
  try {
    var type = req.header("Authorization").split("_kackey_");
    const token = type[1];
    auth(token, req, res, next);
  } catch (e) {
    res.status(401).send({ error: "Please authenticate." });
  }
};

exports.memberAuth = async (req, res, next) => {
  try {
    var type = req.header("Authorization").split("_kackey_");
    const token = type[1];
    type = type[0];
    if(type === "member" || type === "coach" || type === "admin" || type === "superadmin"){
      auth(token, req, res, next);
    } else
      throw new Error();
  } catch (e) {
    res.status(401).send({ error: "Please authenticate." });
  }
};

exports.coachAuth = async (req, res, next) => {
  try {
    var type = req.header("Authorization").split("_kackey_");
    const token = type[1];
    type = type[0];
    if( type === "coach" || type === "admin" || type === "superadmin"){
      auth(token, req, res, next);
    } else
      throw new Error();
  } catch (e) {
    res.status(401).send({ error: "Please authenticate." });
  }
};

exports.adminAuth = async (req, res, next) => {
  try {
    var type = req.header("Authorization").split("_kackey_");
    const token = type[1];
    type = type[0];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    //----- check if the request from the admin or super admin -----
    if(type === "admin" || type === "superadmin"){
      //----- check if the request try to change the admin user -----
      const {_id} = req.params;
      var num = await User.count({_id: _id, type: 'admin'});
      if(req.body.type === "admin" || (num > 0 && _id !== decoded._id))
        res.status(401).send({ error: "Please authenticate." });
      else
        auth(token, req, res, next);
    } else
      throw new Error();
  } catch (e) {
    res.status(401).send({ error: "Please authenticate." });
  }
};

exports.superadminAuth = async (req, res, next) => {
  try {
    var type = req.header("Authorization").split("_kackey_");
    const token = type[1];
    type = type[0];
    if(type === "superadmin"){
      auth(token, req, res, next);
    } else
      throw new Error();
  } catch (e) {
    res.status(401).send({ error: "Please authenticate." });
  }
};
