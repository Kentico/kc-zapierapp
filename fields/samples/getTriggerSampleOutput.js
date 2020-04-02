const getAllItemsDelivery = require('../../utils/items/get/getAllItemsDelivery');
const getContentType = require('../../utils/types/getContentType');
const getLanguage = require('../../utils/languages/getLanguage');
const makeHookItemOutput = require('../../triggers/makeHookItemOutput');

async function getTriggerSampleOutput(z, bundle, payloadFunc) {
    const allItems = await getAllItemsDelivery(z, bundle);
    if(!allItems) return null;
    let items = allItems;

    //try to load items of the selected type
    const contentTypeId = bundle.inputData.contentTypeId;
    if(contentTypeId) {
        const type = await getContentType(z, bundle, contentTypeId);
        const typeMatches = items.filter(i => i.system.type === type.codename);
        if(typeMatches.length > 0) {
            items = typeMatches;
        }
    }

    //try to load items of the selected language
    const languageId = bundle.inputData.languageId;
    if(languageId) {
        const lang = await getLanguage(z, bundle, languageId);
        const langMatches = items.filter(i => i.system.language === lang.codename);
        if(langMatches.length > 0) {
            items = langMatches;
        }
    }

    items = items.slice(0, 3);
    if(items.length === 0) items.push(allItems[0]);

    return await makeHookItemOutput(z, bundle, items, payloadFunc);
}

module.exports = getTriggerSampleOutput;