function getContentTypeField(extras) {
    return Object.assign(
        {
            label: 'Content type',
            key: 'contentTypeId',
            type: 'string',
            helpText: 'Note: dynamic values from other steps cannot be used here',
            dynamic: 'get_content_types.system__id.system__name',
        },
        extras || {},
    );
}

module.exports = getContentTypeField;
