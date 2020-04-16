function getSampleItemPublishPayload(z, bundle, sampleItem) {
  return {
    data: {
      items: [
        {
          id: sampleItem.system.id,
          codename: sampleItem.system.codename,
          language: sampleItem.system.language,
          type: sampleItem.system.type
        }
      ]
    },
    message: {
      id: 'e2f99f74-4111-4033-8eff-54073fbd4e32',
      project_id: bundle.authData.projectId,
      type: 'content_item_variant',
      operation: 'publish',
      api_name: 'delivery_production',
      created_timestamp: new Date().toJSON(),
      webhook_url: bundle.targetUrl ? bundle.targetUrl : 'https://hooks.zapier.com/hooks/standard/47991d003732'
    }
  }
}

module.exports = getSampleItemPublishPayload;