const userRoleSchema = mongoose.Schema({

    role: {
        type: String
    }
});

module.exports = mongoose.model("userroles", userRoleSchema);