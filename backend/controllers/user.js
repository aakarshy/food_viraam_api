const _ = require('lodash')
const User = require("../models/user")
const formidable = require('formidable')
const fs = require('fs')

exports.userById = (req,res,next,id )=> {
	User.findById(id)
		.exec((err,user) => {
			
			if(err || !user) {
				return res.status(400).json({
					error: "User not found"
				})
			}
			req.profile = user //adds profile object in req with user info
			next()
	})
};

exports.hasAuthorization = (req, res, next) => {
	let sameUser = req.profile && req.auth && req.profile._id == req.auth._id
	let adminUser = req.profile && req.auth && req.auth.role === "admin"
	
	const authorized = sameUser || adminUser
	if(!authorized) {
		return res.status(403).json({
			error: `User is not authorized to perform this action ${req.profile} ::::: ${req.auth._id}`
		});
	}
	next();
};

exports.allUsers = (req,res) => {
	User.find((err, users) => {
		if(err) {
			return res.status(400).json({
				error: err
			})
		}
		res.json(users);
	}).select("name email updated created role");
}

exports.getUser = (req, res) => {
	return res.json(req.profile)
}

// exports.updateUser = (req,res,next) =>{
// 	let user = req.profile
// 	user = _.extend(user, req.body) // extend - mutate the source object
// 	user.updated = Date.now()
// 	user.save((err) => {
// 		if(err) {
// 			return res.status(400).json({
// 				error: "You are unauthorized to perform this action"
// 			})
// 		}
// 		user.hashed_password = undefined;
// 		user.salt = undefined;
// 		res.json({user})
// 	})
// }

exports.updateUser = (req,res,next) =>{
	let form = new formidable.IncomingForm()
	form.keepExtensions = true
	form.parse(req, (err, fields, files) => {
		if(err) {
			return res.status(400).json({
				error: "Photo could not be uploaded"
			})
		}
		let user = req.profile
		user = _.extend(user, fields)
		user.updated = Date.now()

		if(files.photo) {
			user.photo.data = fs.readFileSync(files.photo.path)
			user.photo.contentType = files.photo.type
		}

		user.save((err, result) => {
			if(err) {
				return res.status(400).json({
					error: err
				})
			}
			user.hashed_password = undefined
			user.salt = undefined
			res.json(user)
		})
	})
}


// exports.postsForTimeline = (req, res) => {
//   let following = req.profile.following
//   following.push(req.profile._id)
//   Post.find({postedBy: { $in : req.profile.following } })
//   .populate('comments', 'text created')
//   .populate('comments.postedBy', '_id name')
//   .populate('postedBy', '_id name')
//   .sort('-created')
//   .exec((err, posts) => {
//     if (err) {
//       return res.status(400).json({
//         error: errorHandler.getErrorMessage(err)
//       })
//     }
//     res.json(posts)
//   })
// }

exports.userPhoto = (req,res,next) => {
	if(req.profile.photo.data){
		res.set("Content-Type", req.profile.photo.contentType)
		return res.send(req.profile.photo.data)
	}
	next();
}
exports.deleteUser = (req, res, next) => {
	let user = req.profile;
	user.remove((err, user) =>{
		if(err) {
			return res.status(400).json({
				error: err
			})
		}
		res.json({ message: "User deleted successfully" });
	})
}


