#!/usr/bin/env node

const cdk = require('@aws-cdk/core');
const { EventDrivenAwsCdkApplicationStack } = require('../lib/event-driven-aws-cdk-application-stack');

const app = new cdk.App();
new EventDrivenAwsCdkApplicationStack(app, 'EventDrivenAwsCdkApplicationStack');
