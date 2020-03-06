function getSampleWorkflowPayload(z, bundle, sampleItem) {
  return {
    data: {
      items: [
        {
          item: {
            id: sampleItem.system.id
          },
          language: {
            id: bundle.inputData.languageId ? bundle.inputData.languageId : '00000000-0000-0000-0000-000000000000'
          },
          transition_from: {
            id: '13145328-b946-4e47-9c9d-6f40c7aaeaef'
          },
          transition_to: {
            id: 'b4363ccd-8f21-45fd-a840-5843d7b7f008'
          }
        }
      ]
    },
    message: {
      id: 'e2f99f74-4111-4033-8eff-54073fbd4e32',
      project_id: bundle.authData.projectId,
      type: 'content_item_variant',
      operation: 'change_workflow_step',
      api_name: 'content_management',
      created_timestamp: new Date().toJSON(),
      webhook_url: bundle.targetUrl
    }
  }
}

module.exports = getSampleWorkflowPayload;