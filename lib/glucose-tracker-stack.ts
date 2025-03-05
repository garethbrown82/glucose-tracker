import * as path from 'node:path';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apiGateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';

export class GlucoseTrackerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Insulin Tracker Service

    const insulinTrackTable = new dynamodb.TableV2(this, 'InsulinTrackTable', {
      partitionKey: { name: 'timestamp', type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const insulinTrackFunction = new lambda.Function(this, 'InsulinTrackFunction', {
      runtime: lambda.Runtime.NODEJS_LATEST,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, 'dist', 'insulin-track')),
      environment: {
        INSULIN_TABLE: insulinTrackTable.tableName,
      }
    });
    insulinTrackTable.grantWriteData(insulinTrackFunction);

    const insulinTrackApiGateway = new apiGateway.LambdaRestApi(this, 'InsulinTrackApiGateway', {
      handler: insulinTrackFunction,
      restApiName: 'InsulinTrackRestApi',
      proxy: false,
    });
    const injections = insulinTrackApiGateway.root.addResource('injections');
    injections.addMethod('POST');

    // Glucose Tracker Service

    const glucoseReadingsBucket = new s3.Bucket(this, 'GlucoseReadingBucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const glucoseTrackFunction = new lambda.Function(this, 'GlucoseTrackFunction', {
      runtime: lambda.Runtime.NODEJS_LATEST,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, 'dist', 'glucose-track')),
      timeout: cdk.Duration.seconds(20),
    });

    glucoseReadingsBucket.addEventNotification(s3.EventType.OBJECT_CREATED, new s3n.LambdaDestination(glucoseTrackFunction));
    glucoseReadingsBucket.grantRead(glucoseTrackFunction);
  }
}
