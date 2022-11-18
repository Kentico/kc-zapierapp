import { ZObject } from 'zapier-platform-core';
import { KontentBundle } from '../../types/kontentBundle';
import { getContentTypeElements } from './getContentTypeElements';
import { ContentTypeElements } from '@kontent-ai/management-sdk';
import { Field } from '../field';
import { getLinkedItemField } from '../getLinkedItemField';

export const getItemElementFields = async (z: ZObject, bundle: KontentBundle<{}>, contentTypeId: string) =>
  getContentTypeElements(z, bundle, contentTypeId)
    .then(elements => elements.map(getSimpleElementField));

export type ElementFields = Readonly<{
  [key: `elements_${string}`]: string | string[] | number | undefined;
}>;

function getSimpleElementField(element: ContentTypeElements.ContentTypeElementModel) {
  switch (element.type) {
    case 'text':
    case 'rich_text':
    case 'custom':
      return getField(element, { type: 'text' });

    case 'number':
      return getField(element, { type: 'float' });

    case 'date_time':
      return getField(element, { type: 'datetime' });

    case 'modular_content':
      return getLinkedItemField(getField(element));

    case 'multiple_choice':
    case 'asset':
    case 'taxonomy':
      return getField(element, { type: 'unicode', list: true });

    case 'url_slug':
      return getField(element, { type: 'unicode' });

    case 'guidelines':
      return getField(element, { type: 'copy' });
    default:
      return undefined;
  }
}

function getField(element: ElementWithoutSnippets, extra?: Partial<Field>) {
  const base = {
    key: `elements__${element.codename}`,
    label: getElementName(element),
    helpText: createElementHelpText(element),
    required: element.type !== 'guidelines' && !!element.is_required,
  };

  const choices = element.type === 'multiple_choice'
    ? element.options.map(o => ({ label: o.name, value: o.codename || '', sample: '' }))
    : undefined;

  const list = element.type === 'multiple_choice' ? false : undefined;

  return {
    ...base,
    choices,
    list,
    ...extra,
  };
}

type ElementWithoutSnippets = Exclude<ContentTypeElements.ContentTypeElementModel, ContentTypeElements.ISnippetElement>;

const getElementName = (element: ElementWithoutSnippets): string => {
  switch (element.type) {
    case 'guidelines':
    case 'taxonomy':
      return element.codename || '';
    default:
      return element.name || element.codename || '';
  }
};

const createElementHelpText = (element: ElementWithoutSnippets): string | undefined => {
  switch (element.type) {
    case 'modular_content':
      return element.guidelines + ' The value of this field should be a comma-separated list of content item IDs or [external IDs](https://docs.kontent.ai/reference/management-api-v2#section/External-IDs-for-imported-content), or a single value on each line.';
    case 'multiple_choice':
    case 'asset':
    case 'taxonomy':
      return element.guidelines + ' The value of this field should be a comma-separated list of IDs or codenames, or a single value on each line.';
    default:
      return element.guidelines;
  }
};
