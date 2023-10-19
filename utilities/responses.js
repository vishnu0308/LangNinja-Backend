exports.throwError = (message, type, errno) => {
    const error = new Error(message);
    error.type = type;
    error.errno = errno;

    throw error;
};


exports.sendResponse = (res, data, additional_data = {}) => {
    return res.status(200).json({
        success: true,
        data: data,
        ...additional_data
    });
};