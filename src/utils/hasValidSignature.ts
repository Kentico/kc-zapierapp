import * as crypto from 'crypto';
import { getSecret } from './getSecret';
import { ZObject } from 'zapier-platform-core';
import { KontentBundle } from '../types/kontentBundle';

export function hasValidSignature(z: ZObject, bundle: KontentBundle<{}>) {
    const secret = getSecret(z, bundle);
    const givenSignature = bundle.rawRequest?.headers?.['Http-X-Kc-Signature'] ?? '';
    const computedSignature = crypto.createHmac('sha256', secret)
            .update(bundle.rawRequest?.content ?? '')
            .digest();
            
    return crypto.timingSafeEqual(Buffer.from(givenSignature, 'base64'), computedSignature);
}
