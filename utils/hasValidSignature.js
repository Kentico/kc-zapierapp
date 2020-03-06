const crypto = require('crypto');
const getSecret = require('./getSecret');

function hasValidSignature(z, bundle) {
    const secret = getSecret(z, bundle);
    const givenSignature = bundle.rawRequest.headers['Http-X-Kc-Signature'];
    const computedSignature = crypto.createHmac('sha256', secret)
            .update(bundle.rawRequest.content)
            .digest();
            
    return crypto.timingSafeEqual(Buffer.from(givenSignature, 'base64'), computedSignature);
}

module.exports = hasValidSignature;