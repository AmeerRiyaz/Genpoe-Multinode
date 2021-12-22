var cts = function cts() {
    var current = new Date();
    var curr_ts = current.toString();
    return curr_ts;
};
var getErrorMessage = function getErrorMessage(field) {
    var response = {
        status: "Failed",
        message: field,
        result: ""
    };
    return response;
};

exports.cts = cts;
exports.getErrorMessage = getErrorMessage;
