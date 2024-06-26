const mongoose = require('mongoose')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')

const UserSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please add a name"],
      },
      email: {
        type: String,
        required: [true, "Please add an email"],
        unique: true,
        match: [
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
          "Please add a valid email",
        ],
      },
      role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
      },
      password: {
        type: String,
        required: [true, "Please add a password"],
        minlength: 6,
        select: false,
    },
    tel: {
        type: String,
        required: [true, "Please add a tel"],
        match: [/^\d+$/, "Tel must only contain digits"],
        minlength: [10, "Tel must have 10 digits"],
        maxlength: [10, "Tel must have 10 digits"]
        
    },
    
      resetPasswordToken: String,
      resetPasswordExpire: Date,
      createdAt: {
        type: Date,
        default: Date.now,
      },
},{
  toJSON: {virtuals:true},
  toObject: {virtuals:true}
})

UserSchema.virtual('appointments',{
  ref: 'Appointment',
  localField: '_id',
  foreignField:'user',
  justOne: false
});

UserSchema.pre('save',async function(){
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password,salt);
})

UserSchema.methods.matchPassword = function(enteredpassword){
    return bcrypt.compare(enteredpassword,this.password);
}

UserSchema.methods.getSignedJwtToken = function(){
    const token = jwt.sign({id:this._id,name:this.name},process.env.JWT_SECRET,{
      expiresIn:process.env.JWT_EXPIRE
    });
    return token;

}

module.exports = mongoose.model('User',UserSchema);