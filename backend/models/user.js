const mongoose = require("mongoose");
const uuidv1 = require("uuid/v1");
const crypto = require("crypto");
const {ObjectId} = mongoose.Schema
const userSchema = new mongoose.Schema({
	name: {
		type: String,
		trim: true,   //if there's space it will ignore it
		required: true
	},
	email: {
		type: String,
		trim: true,
		required: true
	},
	hashed_password: {
		type: String,
		required: true
	},
	salt: String, 
	created: {
		type: Date,
		default: Date.now
	},
	updated: Date,
	photo: {
        data: Buffer,
        contentType: String
    },
	about: {
    	type: String,
        trim: true
    },
});

//virtual field
userSchema.virtual('password')
.set(function(password){
	// create temp variable called _password
	this._password = password
	// generate a timestamp
	this.salt = uuidv1()
	// encryptPassword()
	this.hashed_password = this.encryptPassword(password)

})
.get(function(){
	return this._password
})

userSchema.methods = {
	authenticate: function(plainText) {
		return this.encryptPassword(plainText) === this.hashed_password;
	},

	encryptPassword: function(password){
		if(!password) return "";
		try{
			return crypto.createHmac('sha1',this.salt)
					.update(password)
					.digest('hex');
		} catch(err) {
				return "";
		}
	}
}

// pre middleware
userSchema.pre("remove", function(next) {
    Post.remove({ postedBy: this._id }).exec();
    next();
});

module.exports = mongoose.model("User",userSchema)