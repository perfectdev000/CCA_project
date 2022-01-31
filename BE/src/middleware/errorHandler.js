module.exports = (err, req, res, next) => {
  try {
    console.log("congrats you hit the error middleware", err);
    if (err.code && err.code == 11000)
      return (err = handleDuplicateKeyError(err, res));

    // if (err.kind == "ObjectId") console.log('');
  } catch (err) {
    res.status(500).send("An unknown error occurred.");
  }
};
//handle email or username duplicates
const handleDuplicateKeyError = (err, res) => {
  const field = Object.keys(err.keyValue);
  const code = 409;
  res.status(code).send(`An account with that ${field} already exists.`);
};
