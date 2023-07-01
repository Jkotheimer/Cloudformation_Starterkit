'use strict';

  /////////////////////
 // LIBRARY IMPORTS //
/////////////////////

import { Buffer } from 'node:buffer';
import { exec } from 'node:child_process';
import { createDecipheriv, createCipheriv, randomBytes } from 'node:crypto';

  ///////////////
 // CONSTANTS //
///////////////

import constants from '../constants.js';

  //////////////////////
 // TYPE DEFINITIONS //
//////////////////////

/**
 * @typedef {string} Encoding
 */

/**
 * @enum {Encoding}
 */
export const ENCODINGS = {
    ASCII: 'ascii',
    BASE64: 'base64',
    BASE64URL: 'base64url',
    BINARY: 'binary',
    HEX: 'hex',
    LATIN1: 'latin1',
    UCS2: 'ucs2',
    UTF8: 'utf8',
    UTF16LE: 'utf16le'
};

/**
 * @typedef {Object} EncryptionOptions
 * @property {string} algorithm - The algorithm to use for encryption. Default: aes-256-cbc
 * @property {Encoding} keyEncoding - Encoding of the encryption key. Default: hex
 * @property {Encoding} outputEncoding - Encoding of the encrypted data to be returned. Default: hex
 */

/**
 * @typedef {Object} DecryptionOptions
 * @property {string} algorithm - Algorithm to use for decryption. Default:aes-256-cbc
 * @property {Encoding} dataEncoding - If the data is a string, this option tells us how that string is encoded. Default: hex
 * @property {Encoding} keyEncoding - If the key is a string, this option tells us how that string is encoded. Default: hex
 * @property {Encoding} outputEncoding - Specify the encoding of the decrypted data to be returned. Default: utf-8
 */

/**
 * @typedef ResponseBody
 * @property {number} statusCode
 * @property {string} body
 */

  ////////////////////////////////
 // EXPORTED UTILITY FUNCTIONS //
////////////////////////////////

/**
 * Constructs response body for a handler
 * @param {number} statusCode 
 * @param {*} body 
 * @returns {ResponseBody}
 */
export function respond(statusCode, body) {
    if (statusCode >= 400 && body?.error == null) {
        body = {
            error: body
        };
    }
    if (typeof body === 'object') {
        body = JSON.stringify(body);
    }
    return {
        statusCode,
        body
    };
}

/**
 * @description - Encrypt data with a key. Initialization vector is generated at runtime and included in the results
 * @param {Buffer | string} data - Data to encrypt
 * @param {Buffer | string} key - Key to use for encryption
 * @param {EncryptionOptions} options - Options to use for encryption
 * @returns {Buffer | string} - Encrypted data
 */
export function encrypt(data, key, options) {
    if (!data?.length) {
        return '';
    }
    if (!key?.length) {
        throw new Error('Unable to encrypt data without a key');
    }
    options = Object.assign(constants.DEFAULT_ENCRYPTION_OPTIONS, options);
    const iv = randomBytes(16);
    const cipher = createCipheriv(options.algorithm, Buffer.from(key, options.keyEncoding), iv);
    const encryptedBuffer = Buffer.concat([iv, cipher.update(data), cipher.final()]);
    if (ENCODINGS.BINARY === options.outputEncoding) {
        return encryptedBuffer;
    } else {
        return encryptedBuffer.toString(options.outputEncoding);
    }
}

/**
 * @description - Decrypt a value with a key. It is assumed that the encrypted data includes a 16 byte initialization vector at the start
 * @param {Buffer | string} encryptedData - Encrypted data to decrypt
 * @param {Buffer | string} key - Key to use for decryption
 * @param {DecryptionOptions} options - Options used to describe how the data and key are encoded
 * @throws {Error} - If the key is empty or decryption fails
 * @returns {Buffer | string}
 */
export function decrypt(encryptedData, key, options) {
    if (!encryptedData?.length) {
        return '';
    }
    if (!key?.length) {
        throw new Error('Cannot decrypt a value without a key.');
    }
    try {
        options = Object.assign(constants.DEFAULT_DECRYPTION_OPTIONS, options);
        if (!Buffer.isBuffer(encryptedData)) {
            encryptedData = Buffer.from(encryptedData, options.dataEncoding);
        }
        if (!Buffer.isBuffer(key)) {
            key = Buffer.from(key, options.keyEncoding);
        }
        const iv = encryptedData.subarray(0, 16);
        const encrypted = encryptedData.subarray(16);
        const decipher = createDecipheriv(options.algorithm, key, iv);
        decipher.setAutoPadding(false);
        const decryptedBuffer = decipher.update(encrypted, options.dataEncoding, options.outputEncoding) + decipher.final(options.outputEncoding);
        switch (options.outputEncoding) {
            case ENCODINGS.BINARY:
                return decryptedBuffer;
            case ENCODINGS.ASCII:
            case ENCODINGS.UCS2:
            case ENCODINGS.UTF8:
            case ENCODINGS.UTF16LE: // Remove non-ascii characters for human readable encodings
                return decryptedBuffer.toString(options.outputEncoding).replace(/[^\x20-\x7E]+/, '');
            default:
                return decryptedBuffer.toString(options.outputEncoding);
        }
    } catch (error) {
        console.error(error);
        throw new Error(`Decryption failed`);
    }
}

export function generateEncryptionKey(encoding = 'hex') {
    return randomBytes(32).toString(encoding);
}

/**
 * Execute a shell command
 * @param {string} cmd 
 * @returns {Promise<string>}
 */
export async function execute(cmd) {
    return new Promise((resolve, reject) => {
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            } else if (stdout) {
                resolve(stdout);
            } else if (stderr) {
                reject(stderr);
            } else {
                resolve('');
            }
        });
    });
}