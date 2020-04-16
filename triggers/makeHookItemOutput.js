async function makeHookItemOutput(z, bundle, items, payloadFunc) {
    if(items) {
        const objs = items.map(item => {
            return payloadFunc(z, bundle, item);
        });
        return [...objs];
    }
    else {
        //items will be null for archive events
        return [payloadFunc()];
    }
}

module.exports = makeHookItemOutput;