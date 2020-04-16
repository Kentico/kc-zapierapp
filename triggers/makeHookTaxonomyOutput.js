async function makeHookTaxonomyOutput(z, bundle, groups, payloadFunc) {
    if(groups) {
        const objs = groups.map(group => {
            return payloadFunc(z, bundle, group);
        });
    
        return [...objs];
    }
    else {
        return [payloadFunc()];
    }
}

module.exports = makeHookTaxonomyOutput;