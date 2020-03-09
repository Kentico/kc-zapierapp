const getContentType = require('../../types/getContentType');
const getLanguage = require('../../languages/getLanguage');

function getElementValue(element, typeElement) {
    const value = element.value;
    switch (typeElement.type) {
        case 'text':
        case 'rich_text':
        case 'custom':
        case 'number':
        case 'date_time':
        case 'url_slug':
            return value;

        case 'multiple_choice':
        case 'asset':
        case 'modular_content':
        case 'taxonomy':
            return value && value.map(item => item.id);

        default:
            return value;
    }
}

function getElements(elements, contentType) {
    const result = {};

    for (var i = 0; i < elements.length; i++) {
        const element = elements[i];
        if (element.type === 'guidelines') {
            continue;
        }

        const elementId = element.element.id;

        const typeElement = contentType.elements.filter(el => el.id === elementId)[0];
        if (typeElement) {
            const value = getElementValue(element, typeElement);
            result[typeElement.codename] = value;
        }
    }

    return result;
}

async function getItemResult(z, bundle, item, variant) {
    const contentType = await getContentType(z, bundle, item.type.id);
    const language = await getLanguage(z, bundle, variant.language.id)

    const projectId = bundle.authData.projectId;
    const fullId = `${item.id}/${variant.language.id}`;

    const contentItem = {
        system: {
            projectId: projectId,
            id: item.id,
            name: item.name,
            codename: item.codename,
            type: contentType.codename,
            language: language.codename,
            externalId: item.external_id,
            lastModified: variant.last_modified,
            fullId: fullId,
            workflowStepId: variant.workflow_step.id,
            contentTypeId: item.type.id,
            languageId: variant.language.id,
        },
        elements: getElements(variant.elements, contentType),
    };

    return contentItem;
}

module.exports = getItemResult;
