const { expect, matchTemplate, MatchStyle } = require('@aws-cdk/assert');
const cdk = require('@aws-cdk/core');
const EventDrivenAwsCdkApplication = require('../lib/event-driven-aws-cdk-application-stack');

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new EventDrivenAwsCdkApplication.EventDrivenAwsCdkApplicationStack(app, 'MyTestStack');
    // THEN
    expect(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
