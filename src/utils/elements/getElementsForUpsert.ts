import { getContentTypeElements } from '../../fields/elements/getContentTypeElements';
import { ZObject } from 'zapier-platform-core';
import { KontentBundle } from '../../types/kontentBundle';
import { ContentTypeElements, ElementModels } from '@kontent-ai/management-sdk';
import { ElementFields } from '../../fields/elements/getItemElementFields';

type ElementValue = ElementModels.ContentItemElement['value'];
type RawElementValue = string | string[] | number | undefined;

const getElementValue = (value: RawElementValue, element: ContentTypeElements.ContentTypeElementModel): ElementValue => {
  switch (element.type) {
    case 'rich_text': {
      if (typeof value === 'string' && value.trim().startsWith('<')) {
        return value;
      }
      return `<p>${value}</p>`;
    }

    case 'text':
    case 'custom':
    case 'number':
    case 'date_time':
    case 'url_slug': {
      if (Array.isArray(value)) {
        throw new Error(`Invalid value of type array for element of type ${element.type}.`);
      }

      return value;
    }

    case 'modular_content':
      if (!Array.isArray(value)) {
        return value;
      }
      return value.map(item => {
        //try to determine if it's an ID or external ID
        return item.length == 36 && (item.match(/-/g) || []).length === 4
          ? { id: item }
          : { external_id: item };
      });

    case 'multiple_choice':
    case 'asset':
    case 'taxonomy': {
      if (!Array.isArray(value)) {
        return value;
      }

      return value.map(item => {
        //try to determine if it's an ID or codename
        if (item.length == 36 && (item.match(/-/g) || []).length === 4) {
          return { id: item };
        }
        else {
          return { codename: item };
        }
      });
    }

    case 'guidelines':
    default:
      return undefined;
  }
};

type Element = Omit<ElementModels.ContentItemElement, '_raw'>;
export const getElementsForUpsert = (z: ZObject, bundle: KontentBundle<ExpectedInputData>, contentTypeId: string): Promise<ReadonlyArray<Element>> =>
  getContentTypeElements(z, bundle, contentTypeId)
    .then(typeElements => typeElements
      .map(element => {
        const value = getElementValue(bundle.inputData[`elements__${element.codename}`], element);
        if (!value) {
          return undefined;
        }

        const resultElement = {
          element: {
            id: element.id,
          },
          value: value,
        };

        switch (element.type) {
          case 'url_slug':
            return {
              ...resultElement,
              mode: value !== '' ? 'custom' as const : undefined,
            };
          default:
            return resultElement;
        }
      })
      .filter(notUndefined),
    );

export type ExpectedInputData = ElementFields;

const notUndefined = <T>(v: T | undefined): v is T =>
  v !== undefined;
