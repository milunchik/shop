exports.newError = (err, next) => {
  const error = new Error(err);
  error.httpStatusCode = 500;
  return next(error);
};
