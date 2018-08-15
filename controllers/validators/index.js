module.exports = {
    toResponse: toResponse,
    user: require('./user')
};


function toResponse(validationResult, res, view) {
    const responseBody = {
        error: "Validation error",
        validation: []
    };

    validationResult.error.details
        .forEach(detail => responseBody.validation.push({key: detail.context.key, message: detail.message }));

    res.status(400);

    view ? res.render(view, responseBody) : res.json(responseBody);
}
