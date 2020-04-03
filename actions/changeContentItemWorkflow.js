const handleErrors = require('../utils/handleErrors');
const getVariant = require('../utils/items/get/getVariant');
const getWorkflowSteps = require('../utils/workflows/getWorkflowSteps');
const getWorkflowStepField = require('../fields/getWorkflowStepField');
const getContentItemField = require('../fields/getContentItemField');

function isFirstWorkflowStep(stepId, workflowSteps) {
    const firstStep = workflowSteps[0];

    return firstStep && (firstStep.id === stepId);
}

function isPublishedWorkflowStep(stepId, workflowSteps) {
    const nextToLastStep = workflowSteps[workflowSteps.length - 2];

    return nextToLastStep && (nextToLastStep.id === stepId) && (nextToLastStep.name === "Published");
}

function isScheduledWorkflowStep(workflowStepId, workflowSteps) {
    const stepBeforePublish = workflowSteps[workflowSteps.length - 3];

    return stepBeforePublish && (stepBeforePublish.id === workflowStepId) && (stepBeforePublish.name === "Scheduled");
}

async function execute(z, bundle) {
    async function createNewVersion(itemId, languageId) {
        const options = {
            url: `https://manage.kontent.ai/v2/projects/${bundle.authData.projectId}/items/${itemId}/variants/${languageId}/new-version`,
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${bundle.authData.cmApiKey}`
            },
            params: {},
        };

        const response = await z.request(options);
        handleErrors(response);
    }

    async function publish(itemId, languageId) {
        const options = {
            url: `https://manage.kontent.ai/v2/projects/${bundle.authData.projectId}/items/${itemId}/variants/${languageId}/publish`,
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${bundle.authData.cmApiKey}`
            },
            params: {},
        };

        const response = await z.request(options);
        handleErrors(response);
    }

    async function schedulePublishing(itemId, languageId, publishDate) {
        const options = {
            url: `https://manage.kontent.ai/v2/projects/${bundle.authData.projectId}/items/${itemId}/variants/${languageId}/publish`,
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${bundle.authData.cmApiKey}`
            },
            params: {},
            body: {
                'scheduled_to': publishDate
            }
        };

        const response = await z.request(options);
        handleErrors(response);
    }

    async function cancelScheduling(itemId, languageId) {
        const options = {
            url: `https://manage.kontent.ai/v2/projects/${bundle.authData.projectId}/items/${itemId}/variants/${languageId}/cancel-scheduled-publish`,
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${bundle.authData.cmApiKey}`
            },
            params: {},
        };

        const response = await z.request(options);
        handleErrors(response);
    }

    async function changeWorkflowStep(itemId, languageId, workflowStepId) {
        const options = {
            url: `https://manage.kontent.ai/v2/projects/${bundle.authData.projectId}/items/${itemId}/variants/${languageId}/workflow/${workflowStepId}`,
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${bundle.authData.cmApiKey}`
            },
            params: {},
        };

        const response = await z.request(options);
        handleErrors(response);
    }

    async function setWorkflowStep(itemId, languageId, workflowStepId) {
        const variant = await getVariant(z, bundle, itemId, languageId);
        const workflowSteps = await getWorkflowSteps(z, bundle);

        const targetIsScheduled = isScheduledWorkflowStep(workflowStepId, workflowSteps);

        const currentStepId = variant.workflow_step.id;
        if ((currentStepId === workflowStepId) && !targetIsScheduled) {
            // Already in that step (except for scheduled)
            return {message: "Content item is already in the requested workflow step"};
        }

        const targetIsFirst = isFirstWorkflowStep(workflowStepId, workflowSteps);

        const isPublished = isPublishedWorkflowStep(currentStepId, workflowSteps);
        if (isPublished) {
            // Create new version first
            await createNewVersion(itemId, languageId);
            if (targetIsFirst) {
                // New version ends up in first WF step
                return {message: "New Draft version has been created"};
            }
        } else {
            const isScheduled = isScheduledWorkflowStep(currentStepId, workflowSteps);
            if (isScheduled) {
                // Cancel scheduling first
                await cancelScheduling(itemId, languageId);
                if (targetIsFirst) {
                    // Cancelled scheduling ends up in first WF step
                    return {message: "Scheduling cancelled and content item has retuned to Draft"};
                }
            }
        }

        const targetIsPublished = isPublishedWorkflowStep(workflowStepId, workflowSteps);
        if (targetIsPublished) {
            await publish(itemId, languageId);

            return {message: "Content item has been published"};
        } else {
            if (targetIsScheduled) {
                const publishDate = bundle.inputData.publishDate;

                // If publish date is soon (within a minute from now) or in the past, we need to publish as scheduling may fail

                //const isInPast = moment(publishDate).add(-1, 'm').isBefore();
                const isInPast = new Date(publishDate).getTime() < new Date(new Date().toUTCString()).getTime()
                if (isInPast) {
                    await publish(itemId, languageId);

                    return {message: "Content item has been published instead of scheduling in a moment"};
                } else {
                    await schedulePublishing(itemId, languageId, publishDate);

                    return {message: "Content item has been scheduled to publishing"};
                }
            } else {
                await changeWorkflowStep(itemId, languageId, workflowStepId);

                return {message: "Content item workflow step has changed"};
            }
        }

        return { success: true };
    }

    // ID = "<item id>/<language id>"
    const fullItemId = bundle.inputData.fullItemId;
    if (!fullItemId) {
        throw Error('Missing full item ID');
    }

    const parsedId = fullItemId.split('/');
    const itemId = parsedId[0];
    const languageId = parsedId[1];

    if (!itemId || !languageId) {
        throw Error(`Full item ID has to be in format "[item id]/[language id]", found "${fullItemId}"`);
    }

    const workflowStepId = bundle.inputData.workflowStepIds;
    z.console.log(bundle.inputData.workflowStepIds);
    if (!workflowStepId) {
        throw Error('Missing target workflow step ID');
    }

    const result = await setWorkflowStep(itemId, languageId, workflowStepId);

    return result;
}

async function getScheduledPublishingFields(z, bundle) {
    const workflowSteps = await getWorkflowSteps(z, bundle);
    const stepId = bundle.inputData.workflowStepIds;

    const isScheduledSelected = isScheduledWorkflowStep(stepId, workflowSteps);
    if (isScheduledSelected) {
        // Only display the datetime field for Scheduled workflow step
        return [{
            type: 'datetime',
            key: 'publishDate',
            label: 'To be published on',
            helpText: 'In case the publishing time is in the past, the content item gets published immediately.',
            required: true
        }];
    }

    return [];
}

const changeContentItemWorkflow = {
    noun: "Language variant workflow change",
    display: {
        "hidden": false,
        "important": true,
        "description": "Changes a language variant's workflow.",
        "label": "Change Language Variant Workflow Step"
    },
    key: "change_item_workflow",
    operation: {
        perform: execute,
        inputFields: [
            getContentItemField({
                helpText: "Select the content item to update.\n\nFor a custom value use compound content item id in a form of \"[item id]/[language id]\"",
            }),
            getWorkflowStepField({
                required: true,
                helpText: "Select a workflow step to which the content item should move.\n\n[More about workflow in Kentico Kontent ...](https://docs.kontent.ai/tutorials/collaborate-with-your-team/workflows/setting-up-a-workflow-for-your-content)",
                search: "find_workflow_step.id",
            }),
            getScheduledPublishingFields
        ],
        sample: {
            success: true,
        },
    },
};

module.exports = changeContentItemWorkflow;
