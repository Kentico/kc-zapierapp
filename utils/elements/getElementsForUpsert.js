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

        case 'modular_content':
            return value && value.map(item => {
                //try to determine if it's an ID or external ID
                if(item.length == 36 && (item.match(/-/g)||[]).length === 4) return { id: item };
                else return { external_id: item };
            });

        case 'multiple_choice':
        case 'asset':
        case 'taxonomy':
            return value && value.map(item => {
                //try to determine if it's an ID or codename
                if(item.length == 36 && (item.match(/-/g)||[]).length === 4) return { id: item };
                else return { codename: item };
            });

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