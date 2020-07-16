const axios = require('axios');
const fs = require('fs');

let rawdata = fs.readFileSync('cookies.json');
let cookies = JSON.parse(rawdata);

cookies = processCookies(cookies)

let rawdataheaders = fs.readFileSync('headers.json');
let headers = JSON.parse(rawdataheaders);
headers.cookie = cookies;
console.log("URL ", "https://restaurant-dashboard.uber.com/rt/eats/v1/stores/" + headers["x-auth-params-uuid"] + "/active-orders")
console.log("HEADERS ", headers);

axios.request({
    url: "https://restaurant-dashboard.uber.com/rt/eats/v1/stores/" + headers["x-auth-params-uuid"] + "/active-orders",
    method: "get",
    headers: headers
}).then(function (response) {
    console.log("ESTATUS ", response.status);
    console.log("DATA ", response.data);
    console.log("HEADERS ", response.headers);
})


function processCookies(cookies) {
    var string = '';
    cookies.forEach(cookie => {
        string = string + cookie.name + "=" + cookie.value + "; "
    });
    console.log(string.slice(0, -2));
    return string;
}