async function makeHookTaxonomyOutput(z, bundle, groups, payloadFunc) {
    if(groups) {
        const objs = groups.map(group => {
            return {'Webhook payload': payloadFunc(z, bundle, group)};
        });
    
        return [...objs];
    }
    else {
        return [{ 'Webhook payload' : payloadFunc() }];
    }
}

module.exports = makeHookTaxonomyOutput;