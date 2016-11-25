Start DynamoDB locally, from the directory you downloaded it to and make sure that the Presences table exists. Follow the instructions in ../docs/DynamoDB.md

Run the test script. You must see this output

```
$ nvm use v4.3.2
$ node handler_test.js
true
true
true
true
```


This is a very basic test script. It doesn't use any framework such as Jasmine, Mocha or Chai.
It demostrates the basic concepts of requiring the module with the lambda function, injecting the database
connection, calling the function and handling the callback to check if the results are OK.

Adapt it to your preferred test framework.

Read https://medium.com/@rotemtam/serverless-applications-continuous-delivery-with-aws-lambda-and-api-gateway-part-1-unit-tests-e517aa1cd09e for an example using Chai.
