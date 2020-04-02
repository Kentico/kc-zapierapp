function getContentTypeFieldForSamples(extras) {
    return Object.assign(
        {
            label: 'Content type for samples',
            key: 'contentTypeId',
            type: 'string',
            helpText: 'If you select a content type, the samples from this trigger will be of that type. If empty, the first found items will be provided.',
            dynamic: 'get_content_types.system__id.system__name',
        },
        extras || {},
    );
}

module.exports = getContentTypeFieldForSamples;