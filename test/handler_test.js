'use strict';

const lambda = require('../handler.js');
const AWS = require("aws-sdk");
AWS.config.update({
  region: "eu-west-1",
  endpoint: "http://localhost:8000"
});
const docClient = new AWS.DynamoDB.DocumentClient();
lambda.setDocClient(docClient); // make the lambda use the local db

const now = Math.floor(Date.now() / 1000); // or faster: Date.now()/1000 | 0
const presences = 10
const event = { "body": { "timestamp": now, "presences": presences } }
const context = {}; // we're not using it in the lambda

function callback(error, result) {
  console.log(result.statusCode == 200);
  console.log(result.body == '200');

  let params = { TableName: "Presences", Key:{ "timestamp": now } };
  docClient.get(params, function (err, data) {
    if (err) {
      console.log("Unable to query. Error:", JSON.stringify(err, null, 2));
    } else {
      console.log(data.Item.timestamp == now);
      console.log(data.Item.presences == presences);
    }
  });
}

lambda.countersReceiver(event, context, callback);
