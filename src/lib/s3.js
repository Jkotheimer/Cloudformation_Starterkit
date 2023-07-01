'use strict';

import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({ region });

export async function get(objectName) {
    return s3.send(new GetObjectCommand({
    }));
}