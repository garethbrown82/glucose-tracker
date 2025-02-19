import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apiGateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as path from 'node:path';

export class GlucoseTrackerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const insulinTrackFunction = new lambda.Function(this, 'InsulinTrackFunction', {
      runtime: lambda.Runtime.NODEJS_LATEST,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, 'lambda-handler')),
    });

    const insulinTrackApiGateway = new apiGateway.LambdaRestApi(this, 'InsulinTrackApiGateway', {
      handler: insulinTrackFunction,
      restApiName: 'InsulinTrackRestApi',
    });

    const insulinTrackTable = new dynamodb.TableV2(this, 'InsulinTrackTable', {
      partitionKey: { name: 'timestamp', type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    })
  }
}
