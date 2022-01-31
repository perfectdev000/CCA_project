export const callApi = (
    method = 'GET',
    endpoint,
    auth = {},
    data = {},
    file = false
  ) => {
    
    method = method ? method : 'GET';
    let fullUrl = process.env.REACT_APP_SERVER_URL + endpoint;
    console.log('********* FULL URL ************' + fullUrl);
    let options = {
      headers: {
        'Content-Type': 'application/json',
        'X-My-Custom-Header': 'value-v',
        'Authorization': auth ? auth : '',
      },
      crossDomain: true,
      method: method,
    };
    if (['POST', 'PUT'].indexOf(method) > -1) options.body = JSON.stringify(data);
  
    if (file) {
      const formData = new FormData()
      formData.append("media", data.file, data.file.name);
      options = {
        method: 'POST',
        body: formData
      }
    }
    console.log(options);

    return fetch(fullUrl, options)
      .then((response) => {
        if (!response.ok) {
          const error = Object.assign({}, response, {
            status: response.status,
            statusText: response.statusText,
          });     
          return Promise.reject(error);
        }
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.indexOf('application/json') > -1) {
          return response
            .json()
            .then((json) => {
              if ([200, 403].indexOf(response.status) === -1)
                throw new Error(response.status);
              if ([304, 403].indexOf(response.status) > -1)
                throw new Error(response.status);
              if (Array.isArray(json)) 
                return [...json];
              else 
                return { ...json };
            })
            .catch(() => {
              throw new Error(response.status);
            });
        } else {
          return {};
        }
      })
      .catch((error) => {
        if(error.status === 401){
          removeSession();
          window.location.href = '/login';
        }
        console.log(error);
        return error
      });
  };

  export const setSession = (token, _id, userType) => {
    if(token)
      localStorage.setItem("token",token);
    if(_id)
      localStorage.setItem("_id", _id);
    if(userType)
      localStorage.setItem("type", userType);
  }

  export const removeSession = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("_id");
    localStorage.removeItem("type");
  }