async function makeHookItemOutput(z, bundle, items, payloadFunc) {
    if(items) {
        const objs = items.map(item => {
            return {'Webhook payload': payloadFunc(z, bundle, item)};
        });
        return [...objs];
    }
    else {
        //items will be null for archive events
        return [{'Webhook payload': payloadFunc()}];
    }
}

module.exports = makeHookItemOutput;