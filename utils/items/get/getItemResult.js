const getContentType = require('../../types/getContentType');
const getLanguage = require('../../languages/getLanguage');
const getVariant = require('./getVariant');
const findItemByIdentifier = require('./findItemByIdentifier');

async function findContentItemByIdentifier(z, bundle, languageId, searchField, searchValue, doModular) {
    const item = await findItemByIdentifier(z, bundle, null, searchField, searchValue);
    if (!item) {
        // Cannot search
        return null;
    }

    if (!item.length) {
        // Not found
        return [];
    }

    const itemId = item[0].id;

    const variant = await getVariant(z, bundle, itemId, languageId);
    if (!variant) {
        // Not found
        return [];
    }

    // Found
    return await getItemResult(z, bundle, item[0], variant, doModular);
}

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

        case 'modular_content':
        case 'multiple_choice':
        case 'asset':
        case 'taxonomy':
            return value && value.map(item => item.id);

        default:
            return value;
    }
}

function getElements(z, bundle, variant, contentType) {
    const elements = variant.elements;
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

async function getModularContent(z, bundle, variant, contentType, doModular) {
    const modularContent = [];
    const modularElements = contentType.elements.filter(el => el.type === 'modular_content');
 
    for(const modularElement of modularElements) {
        const variantElement = variant.elements.filter(el => el.element.id === modularElement.id)[0];
        if (variantElement) {
            //request all items and add to array
            for await (const item of variantElement.value) {
                const result = await findContentItemByIdentifier(z, bundle, variant.language.id, 'id', item.id, doModular);
                modularContent.push(result);
            }     
        }
    }

    return modularContent;
}

async function getItemResult(z, bundle, item, variant, doModular = true) {
    const contentType = await getContentType(z, bundle, item.type.id);
    const language = await getLanguage(z, bundle, variant.language.id);
    const elements = await getElements(z, bundle, variant, contentType);
    let modular = [];

    //get modular content and set doModular to false to prevent too much depth
    if(doModular) {
        modular = await getModularContent(z, bundle, variant, contentType, false);
    }

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
        elements: elements,
        modular_content: z.JSON.stringify(modular)
    };

    return contentItem;
}

module.exports = getItemResult;
