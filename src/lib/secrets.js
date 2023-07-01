'use strict';

import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

/**
 * Get application secrets
 * @param SecretId - Name of secret to retrieve. Defaults to environment value
 * @param VersionStage - Stage of version. Defaults to AWSCURRENT
 * @param VersionId - Version ID
 * @returns {Promise<object>} 
 */
export async function getSecrets(SecretId = process.env.SECRETS_ID, VersionStage = 'AWSCURRENT', VersionId) {
    const client = new SecretsManagerClient({ region });
    const command = new GetSecretValueCommand({ SecretId, VersionStage, VersionId });
    const response = await client.send(command)
    return JSON.parse(response.SecretString);
}