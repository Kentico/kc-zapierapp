const getContentTypeElements = require('../../fields/elements/getContentTypeElements');

function getElementValue(value, element) {
    switch (element.type) {
        case 'rich_text':
            if (!value) value = '';
            if (value && value.trim().startsWith('<')) {
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

async function getElementsForUpsert(z, bundle, contentTypeId) {
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
        switch (element.type) {
            case 'url_slug':
                if (value !== '') returnObj['mode'] = 'custom';
                break;
        }

        return returnObj;
    }).filter(e => !!e);

    return elements;
}

module.exports = getElementsForUpsert;