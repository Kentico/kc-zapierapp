const getContentTypeElements = require('./getContentTypeElements');
const getLinkedItemField = require('../getLinkedItemField');

async function getItemElementFields(z, bundle, contentTypeId) {

    function getField(element, extra) {
        const base = {
            key: `elements__${element.codename}`,
            label: element.name,
            helpText: element.guidelines,
            required: !!element.is_required
        };

        if(element.type === 'modular_content' ||
           element.type === 'multiple_choice' ||
           element.type === 'asset' ||
           element.type === 'taxonomy') {
            base.helpText += ' The value of this field should be a comma-separated list of content item IDs, or a single item ID on each line.';
        }

        return Object.assign(base, extra);
    }

    function getSimpleElementField(element) {
        switch (element.type) {
            case 'text':
            case 'rich_text':
            case 'custom':
                return getField(element, {type: 'text'});

            case 'number':
                return getField(element, {type: 'float'});

            case 'date_time':
                return getField(element, {type: 'datetime'});

            case 'modular_content': 
                return getLinkedItemField(getField(element));

            case 'multiple_choice':
            case 'asset':
            case 'taxonomy':
                return getField(element, {type: 'unicode', list: true});

            case 'url_slug':
                return getField(element, {type: 'unicode'});

            case 'guidelines':
                return getField(element, {type: 'copy'});
        }
    }

    const elements = await getContentTypeElements(z, bundle, contentTypeId);
    const fields = elements.map(getSimpleElementField);

    return fields;
}

module.exports = getItemElementFields;
