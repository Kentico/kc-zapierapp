const handleErrors = require('../utils/handleErrors');
const getWorkflowSteps = require('../utils/workflows/getWorkflowSteps');

async function execute(z, bundle) {
    async function findWorkflowStep(stepName) {
        if (!stepName) {
            return [];
        }

        const workflowSteps = await getWorkflowSteps(z, bundle);
        const search = stepName.toLowerCase();

        const fullMatch = workflowSteps.filter(step => step.name.toLowerCase() === search);
        if (fullMatch.length) {
            return fullMatch;
        }

        const partialMatch = workflowSteps.filter(step => step.name.toLowerCase().indexOf(search) >= 0);
        return partialMatch;
    }

    const stepName = bundle.inputData.stepName;

    const found = await findWorkflowStep(stepName);

    return found;
}

const findWorkflowStep = {
    noun: 'Workflow step search',
    display: {
        hidden: false,
        important: false,
        description: 'Finds a workflow step based on its name.',
        label: 'Find Workflow Step',
    },
    key: 'find_workflow_step',
    operation: {
        perform: execute,
        inputFields: [
            {
                label: 'Step name',
                key: 'stepName',
                helpText: 'Name of the workflow step, the search is case insensitive. If exact match is not found, searches as a substring.',
                type: 'string',
                required: true,
            }
        ],
        sample: {
            'transitions_to': [],
            'id': '88ac5e6e-1c5c-4638-96e1-0d61221ad5bf',
            'name': 'Draft'
        },
        outputFields: [
            {
                'key': 'id',
                'label': 'Workflow step ID'
            },
            {
                'key': 'name',
                'label': 'Name'
            }
        ]
    },
};

module.exports = findWorkflowStep;
