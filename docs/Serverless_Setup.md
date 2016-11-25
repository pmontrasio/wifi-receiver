# Setup

We must use node v4.3.2 because it's the one supported by AWS Lambda.

Install ```serverless```. Follow the guide at https://github.com/serverless/serverless

Here are some tips that could make you through some of the steps. Read them in parallel with the guide.

1. The first step is

```
npm install -g serverless
```

but if you have to install as ```root``` and are using ```nvm``` you might have to do this

```
sudo bash -ic "nvm use v4.3.2; npm install -g serverless"
sudo chown -R your-id.your-group ~/.nvm/
nvm use v4.3.2
```

2. This demo runs on AWS Lambda so you need an account there.
You need a user for serverless. The second step of the guide starts with "Creating an administrative IAM User". These are more up to date instructions:

Sign into the AWS Dashboard. Use the search box to look for "IAM" and click on it. Click on "Users", "Create New Users". Write ```serverless-admin``` in the first input box, the click on "Create".

Copy the credentials (Access Key ID and Secret Access Key) then "Close".

Click on ```serverless-admin``` in the list of users.
Click on the "Permissions" tab.
Click on "Attach Policy" in "Managed Policies".
Look for ```AdministratorAccess``` in the list (it should be the first item but you can use the filter).
Select it by clicking its checkbox.
Click "Attach Policy".

3. Do not run this code yet (in the page about AWS accounts)

```
export AWS_ACCESS_KEY_ID=<key>
export AWS_SECRET_ACCESS_KEY=<secret>
serverless deploy
```

You'll get and error because you must create a service first (step 3).

4. When creating a service I didn't use the default ```hello``` function name but ```counters-receiver```

```
serverless create --template aws-nodejs --name counters-receiver
```

The files are created in the current directory.

Edit ```serverless.yml``` to configure the AWS region you want to deploy to.
You might also want to change the function name from the default ```hello``` to something more meaningful. Remember to also edit ```handler.js``` to rename the ```hello``` function in there. Example:

```
functions:
  countersReceiver:
    handler: handler.countersReceiver
```

and

```
module.exports.countersReceiver = (event, context, callback) => {
```

Finally ```export``` the keys as in the previous step and ```serverless deploy -v```

5. Check that the function runs with

```
$ serverless invoke --function countersReceiver -p event.json
{
    "statusCode": 200,
    "body": "200"
}
```

6. Setup an HTTP endpoint for the function with

```
functions:
  countersReceiver:
    handler: handler.countersReceiver
    events:
      - http: POST countersReceiver
```

Add the code to the handler as shown in the GitHub page and ```serverless deploy```. Wait and look for the endpoint definition in the output. Example

```
endpoints:
  POST - https://xxxxxxxxxx.execute-api.eu-west-1.amazonaws.com/dev/countersReceiver
```

Then

```
$ curl -X POST https://xxxxxxxxxx.execute-api.eu-west-1.amazonaws.com/dev/countersReceiver -d timestamp=1475921874 -d presences=10

{"statusCode":200,"body":"200"}
```

7. If you get errors go to the list of functions (click on Functions in the menu on the left). Click on the function with errors. Click on the "Monitoring" tab. Click on "View logs in CloudWatch". The errors are there.

8. Remove the function with ```serverless remove``` and verify that the function is no more in the AWS Lambda dashboard.
