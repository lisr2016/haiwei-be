var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

var UserSchema = new Schema({
    phone: {
        type: String,
        unique: true,
        required: true
    },
    username: {
        type: String,
        unique: false,
    },
    password: {
        type: String,
        required: true
    },
    organization_id: {
      type: String,
      required: true
    },
    is_deleted: {
        type: Boolean,
        default: false
    }
}, {timestamps: {createAt: 'created', updateAt: 'updated'}});

UserSchema.pre('save', function (next) {
    var user = this;
    if (this.isModified('password') || this.isNew) {
        bcrypt.genSalt(10, function (err, salt) {
            if (err) {
                return next(err);
            }
            bcrypt.hash(user.password, salt, null, function (err, hash) {
                if (err) {
                    return next(err);
                }
                user.password = hash;
                next();
            });
        });
    } else {
        return next();
    }
});

UserSchema.methods.comparePassword = function (passw, cb) {
    bcrypt.compare(passw, this.password, function (err, isMatch) {
        if (err) {
            return cb(err);
        }
        cb(null, isMatch);
    });
};

UserSchema.index({ username: 1 });

module.exports = mongoose.model('user', UserSchema);
