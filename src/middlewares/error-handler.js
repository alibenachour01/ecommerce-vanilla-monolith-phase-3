export const errorHandler = (err, _req, res, _next) => {
    const status = err.status || 500;
    const message = err.message || "Internal server error";
    // Include details in the response if they exist
    const response = { error: message };
    if (err.details) {
        response.details = err.details;
    }
    return res.status(status).json(response);
};
