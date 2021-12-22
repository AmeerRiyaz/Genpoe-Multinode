const courseSchema = mongoose.Schema({

    name: {
        type: String
    },
    code: {
        type: Number
    }
});

/* courseSchema.index({
    code: 1
}, {
    unique: true
}); */

module.exports = mongoose.model("course", courseSchema);
