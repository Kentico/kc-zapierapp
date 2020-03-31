const getTaxonomyGroupRaw = require('../utils/taxonomy/get/getTaxonomyGroupRaw');

async function makeHookTaxonomyOutput(z, bundle, groups, payloadFunc) {
    let result;

    if(groups) {
        const promises = groups.map(async group => {
            return await makeObject(z, bundle, group, payloadFunc);
        });
    
        result = await Promise.all(promises);
    }
    else {
        //groups is null in archive operation- only webhook can be sent
        return [{ 'Webhook payload' : payloadFunc() }];
    }
    
    return result;
}

async function makeObject(z, bundle, group, payloadFunc) {
    const payload = payloadFunc(z, bundle, group);
    const responseText = await getTaxonomyGroupRaw(z, bundle, payload.data.taxonomies[0].codename);
    const rawGroup = z.JSON.parse(responseText);

    let obj = {'system': rawGroup.system};
    if(rawGroup.terms) obj['terms'] = rawGroup.terms.map(t => t.codename);
    else obj['terms'] = [];

    const selectedOutputs = bundle.inputData.selectedOutput;
    if(selectedOutputs && selectedOutputs.includes('json')) {
        if(payload.message.operation !== 'archive') {
            
            if(rawGroup.system) {
                obj['Raw JSON'] = responseText;
            }
            else {
                obj['Raw JSON'] = null;
            }
        }
        else {
            obj['Raw JSON'] = null;
        }
        
    }
    if(selectedOutputs && selectedOutputs.includes('payload')) {
        obj['Webhook payload'] = payload;
    }
    return obj;
}

module.exports = makeHookTaxonomyOutput;