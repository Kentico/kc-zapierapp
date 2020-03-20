const handleErrors = require('../../handleErrors');
const getContentTypeElements = require('../../../fields/elements/getContentTypeElements');

function getElementValue(value, element) {
    switch (element.type) {
        case 'rich_text':
            if (value.trim().startsWith('<')) {
                return value;
            }
            return `<p>${value}</p>`;

        case 'text':
        case 'custom':
        case 'number':
        case 'date_time':
        case 'url_slug':
            return value;

        case 'multiple_choice':
        case 'asset':
        case 'modular_content':
        case 'taxonomy':
            return value && value.map(item => ({ id: item }));

        case 'guidelines':
        default:
            return undefined;
    }
}

async function getElements(z, bundle, contentTypeId) {
    const typeElements = await getContentTypeElements(z, bundle, contentTypeId);
    const elements = typeElements.map((element) => {
        let value = bundle.inputData[`elements__${element.codename}`];
        value = getElementValue(value, element);
        if (!value) {
            return undefined;
        }

        const returnObj = {
            element: {
                id: element.id
            },
            value: value
        };

        //element-specific fixes
        switch(element.type) {
            case 'url_slug':
                if(value !== '') returnObj['mode'] = 'custom';
                break;
        }

        return returnObj;
    }).filter(e => !!e);

    return elements;
}

async function updateVariant(z, bundle, itemId, languageId, contentTypeId) {
    const elements = await getElements(z, bundle, contentTypeId);

    const options = {
        url: `https://manage.kontent.ai/v2/projects/${bundle.authData.projectId}/items/${itemId}/variants/${languageId}`,
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${bundle.authData.cmApiKey}`
        },
        params: {},
        body: {
            elements,
        }
    };

    const variantResponse = await z.request(options);
    handleErrors(variantResponse);

    const variant = z.JSON.parse(variantResponse.content);

    return variant;
}

module.exports = updateVariant;