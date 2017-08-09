///*
//* HTTP Cloud Function.
//* 
//* @param {Object} req Cloud Function request context.
//* @param {Object} res Cloud Function response context.
//*/
//exports.helloHttp = function helloHttp(req, res) {
//	response = "This is a sample response from your webhook!" // Default repsonse from the Webhook to show its working.
//	res.setHeader('Content-Type', 'application/json');
//	res.send(JSON.stringify({"speech": response, "displayText": response}));
//};


// --- New code start from here --- //

'use strict';
const http = require('http');
const host = 'http://api.worldweatheronline.com/premium/v1/weather.ashx';
const wwoApiKey = 'c08e48798bfc4cfe97b62316170508';

exports.weatherWebhook = (req,res) => {
let city = req.body.result.parameters['geo-city'];

let date = ''
  if (req.body.result.parameters['date']) {
    date = req.body.result.parameters['date'];
    console.log('Date: ' + date);
  }
  // Call the weather API.
  callWeatherApi(city, date).then((output) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({"speech": output, "displayText": output}));
  }).catch((error) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({"speech": error, "displayText": error}));
  });
};

function callWeatherApi(city, date) {
  return new Promise((resolve, reject) => {
    let path = '/premium/v1/weather.ashx?format=json&num_of_days=1' +
      '&q=' + encodeURIComponent(city) + '&date=' + date + '&key=' + wwoApiKey;
    console.log('API Request: ' + host + path);
 
    http.get({host: host, path: path}, (res) => {
      let body = '';
      res.on('data', (d) => {body += d;});
      res.on('end', () => {
        let response = JSON.parse(body);
        let forecast = response['data']['weather'][0];
        let location = response['data']['request'][0];
        let conditions = response['data']['current_condition'][0];
        let currentConditions = conditions['weatherDesc'][0]['value'];
        // Create response
        let output = `Current conditions in the ${location['type']}
        ${location['query']} are ${currentConditions} with a projected high of
        ${forecast['maxtempC']}B0C or ${forecast['maxtempF']}B0F and a low of
        ${forecast['mintempC']}B0C or ${forecast['mintempF']}B0F on 
        ${forecast['date']}.`;
        console.log(output);
        resolve(output);
      });
      res.on('error', (error) => {
        reject(error);
      })
    });
  });
}
