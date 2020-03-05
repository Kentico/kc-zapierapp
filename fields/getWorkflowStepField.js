function getWorkflowStepField(extras) {
    return Object.assign(
        {
            list: false,
            dynamic: "get_workflow_steps.id.name",
            label: "Workflow steps",
            key: "workflowStepIds",
            type: "string",
        },
        extras || {},
    );
}

module.exports = getWorkflowStepField;
