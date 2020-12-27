const axios = require("axios");

module.exports = class MAL_API {
  constructor(token) {
    this.http = axios.default.create();
    this.urlBase = "https://api.myanimelist.net/v2";
    this.http.defaults.baseURL = this.urlBase;
    this.http.defaults.headers["Authorization"] = `Bearer ${token}`;
  }
};
