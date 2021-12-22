const studentSchema = mongoose.Schema({

    username: {
        type: String
    },
    password: {
        type: String
        // required: "Please provide password"
    },
    name: {
        type: String
    },
    rollNo:{
        type: String
    },
    mobileNo: {
        type: String
        
    },
    email: {
        type: String
    },
    token: {
        type: String
    },
    enable: {
        type: Boolean
    },
    regDate:{
        type: String
    },
    year:{
        type: String
    },
    month:{
        type: String
    },
    course: {
        type: String
    },
    centre:{
        type: String
    } /*,
    reset:{
        type: Boolean
    }*/
});

studentSchema.index({
    rollNo: 1
}, {
    unique: true
});
module.exports = mongoose.model("student", studentSchema);