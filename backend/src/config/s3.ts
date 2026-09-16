import { S3Client } from '@aws-sdk/client-s3';
import { env } from './env';

// When running on EC2 with an IAM instance profile attached, omit
// AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY and the SDK will pick up
// credentials automatically from the instance metadata service.
export const s3Client = new S3Client({
  region: env.aws.region,
  ...(env.aws.accessKeyId && env.aws.secretAccessKey
    ? {
        credentials: {
          accessKeyId: env.aws.accessKeyId,
          secretAccessKey: env.aws.secretAccessKey,
        },
      }
    : {}),
});
