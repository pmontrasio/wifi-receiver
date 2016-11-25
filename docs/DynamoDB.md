# DynamoDB

DynamoDB can be download in local. Nice for development and tests. Download and setup installations at http://docs.aws.amazon.com/amazondynamodb/latest/gettingstartedguide/GettingStarted.JsShell.html#GettingStarted.JsShell.Prereqs.Download

```
wget http://dynamodb-local.s3-website-us-west-2.amazonaws.com/dynamodb_local_latest.tar.gz
mkdir dynamodb
cd dynamodb
tar xzf ../dynamodb_local_latest.tar.gz
java -version # must be >= 1.6
java version "1.8.0_101"

Java(TM) SE Runtime Environment (build 1.8.0_101-b13)
Java HotSpot(TM) 64-Bit Server VM (build 25.101-b13, mixed mode)

$ java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb

Initializing DynamoDB Local with the following configuration:
Port:	8000
InMemory:	false
DbPath:	null
SharedDb:	true
shouldDelayTransientStatuses:	false
CorsParams:	*
```

Goto http://localhost:8000/shell/ and check that it works.

You stop DynamoDB with ```^C```

# Quick tutorial

You should read

* http://docs.aws.amazon.com/amazondynamodb/latest/gettingstartedguide/Welcome.html
* http://docs.aws.amazon.com/amazondynamodb/latest/gettingstartedguide/GettingStarted.JsShell.html

but here is a tutorial tailored to our case. All the commands are run from the console at http://localhost:8000/shell/

## Create table

We're storing a very simple timeserie: timestamp (resolution X seconds) and number of unique mac addresses in that interval.

Copy in the left panel of the console.

```
var params = {
    TableName : "Presences",
    KeySchema: [
        { AttributeName: "timestamp", KeyType: "HASH" },  //Partition key
    ],
    AttributeDefinitions: [
        { AttributeName: "timestamp", AttributeType: "N" },
    ],
    ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1
    }
};

dynamodb.createTable(params, function(err, data) {
    if (err)
        console.log(JSON.stringify(err, null, 2));
    else
        console.log(JSON.stringify(data, null, 2));
});
```

The ```dynamodb``` object is already defined by the console.


## View table schema

Check the schema of a table with

```
var params = {
    TableName: "Presences"
};

dynamodb.describeTable(params, function(err, data) {
    if (err)
        console.log(JSON.stringify(err, null, 2));
    else
        console.log(JSON.stringify(data, null, 2));
});
```

## View database schema

Display all the tables in the db with

```
var params = {};

dynamodb.listTables(params, function(err, data) {
    if (err)
        console.log(JSON.stringify(err, null, 2));
    else
        console.log(JSON.stringify(data, null, 2));
});
```

## Insert an item

```
var params = {
    TableName: "Presences",
    Item: {
        "timestamp":1475921874,
        "presences":10
    }
};

docClient.put(params, function(err, data) {
    if (err)
        console.log(JSON.stringify(err, null, 2));
    else
        console.log(JSON.stringify(data, null, 2));
});
```

Note that we're using the predefined ```docClient``` object here, not ```dynamodb```.

## Read all the table

Read all data

```
var params = {
    TableName: "Presences"
};

docClient.scan(params, function(err, data) {
    if (err)
        console.log(JSON.stringify(err, null, 2));
    else
        console.log(JSON.stringify(data, null, 2));
});
```

## Read an item

```
var params = {
    TableName: "Presences",
    Key:{
        "timestamp": 1475921874,
    }
};

docClient.get(params, function(err, data) {
    if (err) {
        console.log("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
    }
});
```

## Delete one item

```
var params = {
    TableName: "Presences",
    Key:{
        "timestamp": 1475921874,
    }
};

console.log("Attempting a conditional delete...");
docClient.delete(params, function(err, data) {
    if (err) {
        console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("DeleteItem succeeded:", JSON.stringify(data, null, 2));
    }
});
```

## Delete all the items

Delete and recreate the table.

## Delete a table

```
var params = {
    TableName : "Presences"
};

dynamodb.deleteTable(params, function(err, data) {
    if (err) {
        console.error("Unable to delete table. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Deleted table. Table description JSON:", JSON.stringify(data, null, 2));
    }
});
```


# Connecting from Node.js

Check also

* http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/
* http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/index.html

```
nvm use v4.3.2
npm install aws-sdk
```

```
cat > demo.js <<EOF
var AWS = require("aws-sdk");

AWS.config.update({
  region: "eu-west-1",
  endpoint: "http://localhost:8000"
});

var docClient = new AWS.DynamoDB.DocumentClient();

var params = {
    TableName: "Presences",
    Item: {
        "timestamp":1475921934,
        "presences":15
    }
};

docClient.put(params, function(err, data) {
    if (err)
        console.log(JSON.stringify(err, null, 2));
    else
        console.log(JSON.stringify(data, null, 2));
});
EOF
```

Verify that the new item is in the table.

This is all we need to implement in our data receiver. The bot will receive the new data by a DynamoDB trigger.

But we have to setup that on AWS.

# AWS setup

Search DynamoDB in the Amazon dashboard. Click on the link to its own dashboard.

If you never used DynamoDB you'll see a button "Create table" in the middle of the screen. Do not click on it because we'll make serverless create it for us.

However, if you want to try here is what to type in the table creation form:

* Table name: Presences
* Primary key: timestamp, Number
* Click on "Create"
* Wait for the creation process to end.

Remember that the ```serverless-admin``` user we created as admin access. It can access to DynamoDB.
We edit ```serverless.yml``` to give the ```dynamodb:PutItem``` permission to the lambda. Then we add the definition of the table and let serverlsss create it.

Run

```
serverless deploy
```

If you created the table manually you'll get this: ```An error occurred while provisioning your stack: PresencesTable```. You must go to the DynamoDB dashboard and delete the table now. Then rerun the deploy command.

If there is no table, the deploy will create it and terminate successfully. After a few seconds the DynamoDB dashboard will autoupdate with the ```Presences``` table.

Test with

```
serverless invoke --function countersReceiver -p event.json
```

or

```
curl -X POST https://xxxxxxxxxxx.execute-api.eu-west-1.amazonaws.com/dev/countersReceiver -d timestamp=1475921874 -d presences=10
```

Go to the DynamoDB dashboard, select the Presences table, refresh it and check the items are there.
