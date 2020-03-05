const getTaxonomyGroupRaw = require('../utils/taxonomy/get/getTaxonomyGroupRaw');

async function makeHookTaxonomyOutput(z, bundle, group, payload) {
    let returnObj = {};
    
    if(group) {
        returnObj['Taxonomy group'] = group;
    }
    else {
        //create fake taxonomy group so that the available data is consistent regardless of operation
        returnObj['Taxonomy group'] = {
            system: {
                id: payload.data.taxonomies[0].id,
                codename: payload.data.taxonomies[0].codename
            },
            terms: []
        }
    }

    const selectedOutputs = bundle.inputData.selectedOutput;
    if(selectedOutputs && selectedOutputs.includes('items')) returnObj['Items'] = payload.data.items;
    if(selectedOutputs && selectedOutputs.includes('json') && payload.message.operation !== 'archive') {
        const responseText = await getTaxonomyGroupRaw(z, bundle, group.system.codename);
        const rawGroup = z.JSON.parse(responseText);
        if(rawGroup.system) {
            returnObj['Raw JSON'] = responseText;
        }
        else {
            //couldn't find taxonomy group (maybe codename was specified but it doesn't exist yet)
            //stringify the 'group' object instead
            returnObj['Raw JSON'] = z.JSON.stringify(group);
        }
        
    }
    if(selectedOutputs && selectedOutputs.includes('payload')) returnObj['Webhook payload'] = z.JSON.stringify(payload);

    return [returnObj];
}

module.exports = makeHookTaxonomyOutput;