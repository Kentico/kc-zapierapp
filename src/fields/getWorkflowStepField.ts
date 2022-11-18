import { Field } from './field';

export const getWorkflowStepField = (extras?: Partial<Field>): Field => ({
  list: false,
  dynamic: "get_workflow_steps.id.name",
  label: "Workflow steps",
  key: "workflowStepIds",
  type: "string",
  ...extras,
});
