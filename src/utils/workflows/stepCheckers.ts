import { WorkflowModels } from '@kontent-ai/management-sdk';

export const isPublishedWorkflowStep = (stepId: string, workflowSteps: ReadonlyArray<WorkflowModels.WorkflowStep>) => {
  const nextToLastStep = workflowSteps[workflowSteps.length - 2];

  return nextToLastStep &&
    nextToLastStep.id === stepId &&
    nextToLastStep.name === 'Published';
};

export const isScheduledWorkflowStep = (workflowStepId: string, workflowSteps: ReadonlyArray<WorkflowModels.WorkflowStep>) => {
  const stepBeforePublish = workflowSteps[workflowSteps.length - 3];

  return stepBeforePublish &&
    stepBeforePublish.id === workflowStepId &&
    stepBeforePublish.name === 'Scheduled';
};
