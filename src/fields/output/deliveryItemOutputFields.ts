import { OutputField } from './outputField';
import { OutputFromOutputFields } from './outputFromOutputFields';
import { LanguageModels } from '@kontent-ai/management-sdk';
import { IContentItem } from '@kontent-ai/delivery-sdk';

export const deliveryItemOutputFields = [
  {
    key: 'name',
    label: 'Item name',
    type: 'string',
  },
  {
    key: 'language',
    label: 'Language codename',
    type: 'string',
  },
  {
    key: 'lastModified',
    label: 'Last modified',
    type: 'datetime',
  },
  {
    key: 'codename',
    label: 'Item codename',
    type: 'string',
  },
  {
    key: 'type',
    label: 'Content type codename',
    type: 'string',
  },
  {
    key: 'workflowStep',
    label: 'Workflow step codename',
    type: 'string',
  },
  {
    key: 'id',
    label: 'Item ID',
    type: 'string',
  },
  {
    key: 'fullId',
    label: 'Full item ID',
    type: 'string',
  },
  {
    key: 'languageId',
    label: 'Language ID',
    type: 'string',
  },
] as const satisfies ReadonlyArray<OutputField>;

export type DeliveryItemOutputFields = OutputFromOutputFields<typeof deliveryItemOutputFields>;

export const prepareDeliveryItemForOutput = (allLanguages: ReadonlyArray<LanguageModels.LanguageModel>) =>
  (item: IContentItem): DeliveryItemOutputFields => ({
    language: item.system.language,
    type: item.system.type,
    codename: item.system.codename,
    id: item.system.id,
    name: item.system.name,
    lastModified: item.system.lastModified,
    workflowStep: item.system.workflowStep || '',
    languageId: allLanguages.find(l => l.codename === item.system.language)?.id ?? '',
    fullId: `${item.system.id}/${allLanguages.find(l => l.codename === item.system.language)?.id}`,
  });

export const deliveryItemOutputFieldsSample: DeliveryItemOutputFields = {
  id: 'cf106f4e-30a4-42ef-b313-b8ea3fd3e5c5',
  name: 'Coffee Beverages Explained',
  codename: 'coffee_beverages_explained',
  workflowStep: 'draft',
  type: 'article',
  language: 'en-US',
  lastModified: '2020-03-25T19:59:26.8076754Z',
  fullId: 'cf106f4e-30a4-42ef-b313-b8ea3fd3e5c5/00000000-0000-0000-0000-000000000000',
  languageId: '00000000-0000-0000-0000-000000000000'
};
