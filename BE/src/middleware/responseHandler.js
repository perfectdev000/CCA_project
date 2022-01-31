const responseCode = {
  NOTFOUND: 404,
  OK: 200,
  CREATED: 201,
  BADREQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  INTERNALSERVERERROR: 500,
  SERVICEUNAVAILABLE: 503,
};

/* Object.prototype.getKeyByValue = function (value) {
  for (let prop in this) {
    if (this.hasOwnProperty(prop)) {
      if (this[prop] === value) return prop;
    }
  }
}; */

exports.responseHandler = async (data, token, status, Message) => {
  try {
    let response = {};
    if (data.length <= 0) {
      response.data = [];
      response.type = status;
      response.Message = Message;
      response.token = [];
      return response;
    }
    response.data = data;
    response.type = responseCode.getKeyByValue(status);
    response.Message = Message;
    response.token = token;
    return response;
  } catch (err) {
    return err
  }
};
