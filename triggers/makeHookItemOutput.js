const getContentItemRaw = require('../utils/items/get/getContentItemRaw');

async function makeHookItemOutput(z, bundle, items, payloadFunc) {
    const result = [];

    for(const item of items) {
        const obj = {'system': item.system};
        obj['elements'] = item.elements;
        const payload = payloadFunc(z, bundle, item);

        //check additional output fields
        const selectedOutputs = bundle.inputData.selectedOutput;
        if(selectedOutputs && selectedOutputs.includes('json')) {
            if(payload.message.operation !== 'archive') {
                const responseText = await getContentItemRaw(z, bundle, item.system.codename, item.system.language);
                obj['Raw JSON'] = responseText;
            }
            else {
                obj['Raw JSON'] = null;
            }
        }
        if(selectedOutputs && selectedOutputs.includes('payload')) {
            obj['Webhook payload'] = payload;
        }

        result.push(obj);
    };

    return result;
}

module.exports = makeHookItemOutput;