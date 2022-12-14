import { ZObject } from 'zapier-platform-core';
import * as crypto from 'crypto';
import { KontentBundle } from '../types/kontentBundle';

const key = process.env['SECRET_KEY'];

export function getSecret(z: ZObject, bundle: KontentBundle<{}>) {
    if (!key) {
        throw new Error('Missing environment variable.');
    }

    const zapID = (bundle.authData.projectId ?? '') + (bundle.authData.cmApiKey ?? '') + bundle.authData.previewApiKey;
    return crypto.createHmac('sha256', key).update(zapID, 'utf8').digest('base64');
}
