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

###