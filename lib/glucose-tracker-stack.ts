import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apiGateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'node:path';

export class GlucoseTrackerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const uploadFunction = new lambda.Function(this, 'FileUploadFunction', {
      runtime: lambda.Runtime.NODEJS_LATEST,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, 'lambda-handler')),
    })

    const uploadApiGateway = new apiGateway.LambdaRestApi(this, 'FileUploadApiGateway', {
      handler: uploadFunction,
      restApiName: 'FileUploadRestApi',
    })
  }
}
