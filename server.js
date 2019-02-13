const config = require('./config')
const path = require('path')
const bodyParser = require('body-parser')
const http = require('http')
const express = require('express')
const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

const ncco = []
let options = '<speak>'

config.ivrSymbols.forEach(function (item, index, array) {
  options += `Press option ${index} for ${config.ivrCompanies[index]}<break time='1s' />`  
  });

options += '</speak>'

// Handle inbound call
app.get('/webhooks/answer', function (req, res) {

  ncco.push({
    'action': 'talk',
    'text': 'Thanks for calling the stock price checking service.'
  })
  
  ncco.push({
    'action': 'talk',
    'bargeIn': true,
    'text': options
  })

  ncco.push({
    'action': 'input',
    'maxDigits': 1,
    'eventUrl': [`${req.protocol}://${req.get('host')}/webhooks/dtmf`]
  })
  
  res.json(ncco)

});

// Log VAPI events to the console
app.post('/webhooks/event', function (req, res) {
  console.log(req.body);
  res.status(204).end();
});

// Get the requested stock price
const getStockPrice = (req, res) => {

  const symbol = config.ivrSymbols[parseInt(req.body.dtmf)]
  http.get(`${config.stockPriceUrl}/${symbol}`, (response) => {
    let data = '';

    // A chunk of data has been recieved
    response.on('data', (chunk) => {
      data += chunk;
    });

    // The complete response has been received
    response.on('end', () => {
      console.log(data);
      let price_ncco = JSON.parse(data)
      res.json(price_ncco)
    });

  }).on("error", (err) => {
    console.log("Error: " + err.message);
  });
}

// Receive DTMF
app.post('/webhooks/dtmf', getStockPrice)

// Serve app
const server = app.listen(config.port || 5000, () => {
  console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
});