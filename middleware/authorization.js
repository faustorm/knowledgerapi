var jwt = require("jwt-simple");
var User = require("../controllers/user")
var tokenSecret = "mOnTeRrEy"

exports.valid = function (req, res, next) {
  if(req.headers.authorization) {
    if(req.headers.authorization.length>0) {
      var decoded = jwt.decode(req.headers.authorization, tokenSecret);
      User.checkValidToken(decoded, req.headers.authorization, function(err, data) {
        if(!err) {
          req.body.userId = decoded.id;
          next();
        } else {
          res.status(401).json({ status:"error", data: null, message:"Unauthorized"});
        }
      });
    }
	} else {
		res.status(401).json({ status:"error", data: null, message:"Unauthorized"});
	}
}
