#!/usr/bin/env node

const cdk = require('@aws-cdk/core');
const { AwsStepFunctionsSagaPatternStack } = require('../lib/aws-step-functions-saga-pattern-stack');

const app = new cdk.App();
new AwsStepFunctionsSagaPatternStack(app, 'AwsStepFunctionsSagaPatternStack');
