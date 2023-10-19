const catchAsync = (fn) => (req, res, next) => {
    Promise
        .resolve(fn(req, res, next))
        .catch((err) => {
            console.error(err);
            if (err.type) {
                return res.status(err.status || 400).json({
                    success: false,
                    message: err.message,
                    type: err.type,
                    errno: err.errno
                });
            }
            else {
                return res.status(500).json({
                    success: false,
                    message: "Something went wrong",
                    type: "INTERNAL_ERROR",
                    errno: 500
                });
            }
        });
};

module.exports = catchAsync;
