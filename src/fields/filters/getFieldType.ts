import { ElementsPrefix, SystemPrefix } from '../constants';
import { getContentTypeElements } from '../elements/getContentTypeElements';
import { ZObject } from 'zapier-platform-core';
import { KontentBundle } from '../../types/kontentBundle';

export async function getFieldType(z: ZObject, bundle: KontentBundle<{}>, contentTypeId: string, field: string) {
  if (field.indexOf(ElementsPrefix) === 0) {
    const elementCodeName = field.slice(ElementsPrefix.length);
    const elements = await getContentTypeElements(z, bundle, contentTypeId);

    const element = elements.find(e => e.codename === elementCodeName);
    if (element) {
      return element.type;
    }
  }

  if (field.indexOf(SystemPrefix) === 0) {
    return 'text';
  }

  return 'id';
}
