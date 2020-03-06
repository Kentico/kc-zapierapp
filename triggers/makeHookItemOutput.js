const getContentItemRaw = require('../utils/items/get/getContentItemRaw');

async function makeHookItemOutput(z, bundle, item, payloadFunc) {
    const result = {'Item': item};
    const payload = payloadFunc(z, bundle, item);

    //check additional output fields
    const selectedOutputs = bundle.inputData.selectedOutput;
    if(selectedOutputs && selectedOutputs.includes('json')) {
        if(payload.message.operation !== 'archive') {
            const responseText = await getContentItemRaw(z, bundle, item.system.codename, item.system.language);
            result['Raw JSON'] = responseText;
        }
        else {
            result['Raw JSON'] = null;
        }
    }
    if(selectedOutputs && selectedOutputs.includes('payload')) {
        result['Webhook payload'] = payload;
    }

    return [result];
}

module.exports = makeHookItemOutput;