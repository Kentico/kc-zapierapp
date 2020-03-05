const getContentItemRaw = require('../utils/items/get/getContentItemRaw');
const getSampleWorkflowPayload = require('../fields/getSampleWorkflowPayload');
const getSampleItemPayload = require('../fields/getSampleItemPayload');

async function makeHookItemOutput(z, bundle, item, hookType) {
    const result = {'Item': item};

    //check additional output fields
    const selectedOutputs = bundle.inputData.selectedOutput;
    if(selectedOutputs && selectedOutputs.includes('json')) {
        const responseText = await getContentItemRaw(z, bundle, item.system.codename, item.system.language);
        result['Raw JSON'] = responseText;
    }
    if(selectedOutputs && selectedOutputs.includes('payload')) {
        switch(hookType) {
            case 'management':
                result['Webhook payload'] = getSampleWorkflowPayload(z, bundle, item);
                break;
            case 'delivery':
                result['Webhook payload'] = getSampleItemPayload(z, bundle, item);
                break;
        }
    }

    return [result];
}

module.exports = makeHookItemOutput;