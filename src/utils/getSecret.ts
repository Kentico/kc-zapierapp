import { ZObject } from 'zapier-platform-core';
import * as crypto from 'crypto';
import { KontentBundle } from '../types/kontentBundle';

const key = 'BP7XqTLDp_9WzvX6BOfsF9mkI25pPD4n4r4FS1d6Fx2pUgXasRDpCOL6tEcnUmVW_MXrc2BRQG1FWu60NHb0tVc';

export function getSecret(z: ZObject, bundle: KontentBundle<{}>) {
    const zapID = (bundle.authData.projectId ?? '') + (bundle.authData.cmApiKey ?? '') + bundle.authData.previewApiKey;
    return crypto.createHmac('sha256', key).update(zapID, 'utf8').digest('base64');
}
