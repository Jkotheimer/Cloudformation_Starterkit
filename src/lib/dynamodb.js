'use strict';

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';

  ///////////////
 // CONSTANTS //
///////////////

const tableName = process.env.SAMPLE_TABLE;
const region = process.env.AWS_REGION;

const dynamodb = DynamoDBDocumentClient.from(new DynamoDBClient({ region }));

export async function getItem(id) {
    const data = await dynamodb.send(
        new GetCommand({
            TableName: tableName,
            Key: { id: id }
        })
    );
    return data.Item;
}