import { getWorkflowSteps } from '../utils/workflows/getWorkflowSteps';
import { ZObject } from 'zapier-platform-core';
import { KontentBundle } from '../types/kontentBundle';
import { OutputField } from '../fields/output/outputField';
import { OutputFromOutputFields } from '../fields/output/outputFromOutputFields';
import { WorkflowModels } from '@kontent-ai/management-sdk';

async function execute(z: ZObject, bundle: KontentBundle<InputData>): Promise<Output> {
  const stepName = bundle.inputData.stepName;
  if (!stepName) {
    return [];
  }

  const workflowSteps = await getWorkflowSteps(z, bundle);
  const search = stepName.toLowerCase();

  const fullMatch = workflowSteps
    .filter(step => step.name.toLowerCase() === search)
    .map(prepareWorkflowStepOutput);

  if (fullMatch.length) {
    return fullMatch;
  }

  return workflowSteps
    .filter(step => step.name.toLowerCase().includes(search))
    .map(prepareWorkflowStepOutput);
}

const outputFields = [
  {
    key: 'id',
    label: 'Workflow step ID',
    type: 'string',
    required: true,
  },
  {
    key: 'name',
    label: 'Name',
    type: 'string',
    required: true,
  },
  {
    key: 'transitionsTo',
    label: 'Can transition to steps',
    type: 'string',
    required: true,
    list: true,
  }
] as const satisfies ReadonlyArray<OutputField>;

type Output = ReadonlyArray<OutputFromOutputFields<typeof outputFields>>;

export default {
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
        helpText: 'Name of the workflow step, the search is case insensitive. If an exact match is not found, searches as a substring.',
        type: 'string',
        required: true,
      },
    ],
    sample: {
      id: '88ac5e6e-1c5c-4638-96e1-0d61221ad5bf',
      name: 'Draft',
      transitionsTo: [],
    },
    outputFields,
  },
} as const;

export type InputData = Readonly<{
  stepName: string;
}>;

const prepareWorkflowStepOutput = (step: WorkflowModels.WorkflowStep): Output[number] => ({
  name: step.name,
  id: step.id,
  transitionsTo: step.transitionsTo
});
