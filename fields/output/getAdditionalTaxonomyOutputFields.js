function getAdditionalTaxonomyOutputFields(extras) {
    return {
        label: 'Additional step output',
        key: 'selectedOutput',
        helpText: 'Additional data about the webhook that can be made available in later steps',
        list: true,
        choices: {
            json: 'Raw JSON of the taxonomy group (not available for Delete events)',
            payload: 'Webhook payload'
        }
    }
}

module.exports = getAdditionalTaxonomyOutputFields;