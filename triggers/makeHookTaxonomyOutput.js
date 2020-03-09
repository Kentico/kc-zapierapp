const getTaxonomyGroupRaw = require('../utils/taxonomy/get/getTaxonomyGroupRaw');

async function makeHookTaxonomyOutput(z, bundle, group, payload) {
    let returnObj = {'system': group.system};
    returnObj['terms'] = group.terms.map(t => t.codename);

    const selectedOutputs = bundle.inputData.selectedOutput;
    if(selectedOutputs && selectedOutputs.includes('json')) {
        if(payload.message.operation !== 'archive') {
            const responseText = await getTaxonomyGroupRaw(z, bundle, group.system.codename);
            const rawGroup = z.JSON.parse(responseText);
            if(rawGroup.system) {
                returnObj['Raw JSON'] = responseText;
            }
            else {
                returnObj['Raw JSON'] = null;
            }
        }
        else {
            returnObj['Raw JSON'] = null;
        }
        
    }
    if(selectedOutputs && selectedOutputs.includes('payload')) returnObj['Webhook payload'] = payload;

    return [returnObj];
}

module.exports = makeHookTaxonomyOutput;