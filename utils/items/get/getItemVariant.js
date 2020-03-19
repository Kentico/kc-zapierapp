const handleErrors = require('../../handleErrors');
async function getItemVariant(z, bundle, itemId) {
    const options = {
        url: `https://manage.kontent.ai/v2/projects/${bundle.authData.projectId}/items/${itemId}/variants`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${bundle.authData.cmApiKey}`
        },
    };

    const response = await z.request(options);
    handleErrors(response);

    const variants = z.JSON.parse(response.content);

    //try to get variant in selected language, or use default
    let variant;
    const languageId = bundle.inputData.languageId ? bundle.inputData.languageId : '00000000-0000-0000-0000-000000000000';
    let matchedVariant = variants.filter(v => v.language.id === languageId);
    if(matchedVariant.length > 0) {
        //found match by language ID
        variant = matchedVariant[0];
    }
    else {
        //try to get default language
        matchedVariant = variants.filter(v => v.language.id === '00000000-0000-0000-0000-000000000000');
        if(matchedVariant.length > 0) {
            variant = matchedVariant[0];
        }
        else {
            //couldn't find matching language or default language, just load any variant
            variant = variants[0];
        }
    }

    return variant;
}

module.exports = getItemVariant;