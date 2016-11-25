'use strict';

var AWS = require("aws-sdk");

// We create the client here because the code outside the lambda function
// is run only when the container is instantiated. If the container survives up
// to the second and further invocations of the function, we save the time
// to connect to DynamoDB.
// This defaults to the DynamoDB running on AWS.
var docClient = new AWS.DynamoDB.DocumentClient();

// This is used by test scripts to override docClient with a connection to a local db
// or a mock object
module.exports.setDocClient = (otherDocClient) => {
  docClient = otherDocClient;
}

// POST /counters
// { "timestamp": 1475921874, "presences": 10 }
module.exports.countersReceiver = (event, context, callback) => {

  const timestamp = parseInt(event.body.timestamp, 10);
  const presences = parseInt(event.body.presences, 10);

  var params = {
    TableName: "Presences",
    Item: {
        "timestamp": timestamp,
        "presences": presences
    }
  };

  var statusCode = null;

  docClient.put(params, function (err, data) {
    if (err) {
      callback(null, {statusCode: 500, body: err});
    } else {
      callback(null, {statusCode: 200, body: "200"});
    }
  });

};

// You can add more handlers here, and reference them in serverless.yml
