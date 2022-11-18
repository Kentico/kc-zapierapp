import { getContentTypeElements } from '../elements/getContentTypeElements';
import { getElementFieldProps } from '../elements/getElementFieldProps';
import { ZObject } from 'zapier-platform-core';
import { KontentBundle } from '../../types/kontentBundle';
import { isElementWithName } from '../../utils/elements/isElementWithName';

export async function getElementOutputFields(z: ZObject, bundle: KontentBundle<{}>, contentTypeId: string) {
  if (!contentTypeId) {
    return Promise.resolve([]);
  }

  return getContentTypeElements(z, bundle, contentTypeId)
    .then(elements => elements
      .filter(el => el.type !== 'guidelines')
      .map(element => ({
        label: isElementWithName(element) ? element.name : undefined,
        key: `elements__${element.codename}`,
        ...getElementFieldProps(element),
      })));
}

export type ElementsOutputFields = Readonly<{ elements: Readonly<Record<string, string | string[] | number | undefined>> }>;
