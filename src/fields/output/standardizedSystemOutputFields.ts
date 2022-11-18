import { OutputFromOutputFields } from './outputFromOutputFields';
import { OutputField } from './outputField';

export const standardizedSystemOutputFields = [
  {
    key: 'system__name',
    label: 'Item name',
    type: 'string',
  },
  {
    key: 'system__language',
    label: 'Language codename',
    type: 'string',
  },
  {
    key: 'system__lastModified',
    label: 'Last modified',
    type: 'datetime',
  },
  {
    key: 'system__codename',
    label: 'Item codename',
    type: 'string',
  },
  {
    key: 'system__type',
    label: 'Content type codename',
    type: 'string',
  },
  {
    key: 'system__id',
    label: 'Item ID',
    type: 'string',
  },
  {
    key: 'system__externalId',
    label: 'Item external ID',
    type: 'string',
  },
  {
    key: 'system__projectId',
    label: 'Project ID',
    type: 'string',
  },
  {
    key: 'system__fullId',
    label: 'Full item ID',
    type: 'string',
  },
  {
    key: 'system__languageId',
    label: 'Language ID',
    type: 'string',
  },
  {
    key: 'system__workflowStepId',
    label: 'Workflow step ID',
    type: 'string',
  },
  {
    key: 'system__contentTypeId',
    label: 'Content type ID',
    type: 'string',
  },
] as const satisfies ReadonlyArray<OutputField>;

export type StandardizedSystemOutputFields = OutputFromOutputFields<typeof standardizedSystemOutputFields>;
