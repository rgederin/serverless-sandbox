# serverless-sandbox
Sandbox for playing with Serverless framework


## Serverless demo plan

Demo plan for showing basic Serverless framework features

### Installation and setup

Install serverless globaly:

```
npm install -g serverless
```

Check serverless version:

```
serverless --version
```

Setting up AWS profile for serverless:

```
serverless config credentials --provider provider --key key --secret secret
```

Use custom profile:

```
serverless config credentials --provider aws --key 1234 --secret 5678 --profile custom-profile
```

### Serverless framework core aspects

**Services**

A service is like a project. It's where you define your AWS Lambda Functions, the events that trigger them and any AWS infrastructure resources they require, all in a file called serverless.yml.

To get started building your first Serverless Framework project, create a service:

```
# Create service with nodeJS template in the folder ./hello-service
serverless create --template aws-nodejs --path hello-service
```

You'll see the following files in your working directory:

* serverless.yml
* handler.js

**serverless.yml** 

Each service configuration is managed in the serverless.yml file. The main responsibilities of this file are:

* Declare a Serverless service
* Define one or more functions in the service
* Define the provider the service will be deployed to (and the runtime if provided)
* Define any custom plugins to be used
* Define events that trigger each function to execute (e.g. HTTP requests)
* Define a set of resources (e.g. 1 DynamoDB table) required by the functions in this service
* Allow events listed in the events section to automatically create the resources required for the event upon deployment
* Allow flexible configuration using Serverless Variables
* You can see the name of the service, the provider configuration and the first function inside the functions definition which points to the handler.js file. Any further service configuration will be done in this file.

**handler.js**

The handler.js file contains your function code. The function definition in serverless.yml will point to this handler.js file and the function exported here.