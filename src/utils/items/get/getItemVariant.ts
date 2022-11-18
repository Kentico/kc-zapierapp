import { ZObject } from 'zapier-platform-core';
import { KontentBundle } from '../../../types/kontentBundle';
import { createManagementClient } from '../../kontentServices/managementClient';

const defaultLanguageId = '00000000-0000-0000-0000-000000000000';

export const getItemVariant = (z: ZObject, bundle: KontentBundle<{}>, itemId: string, languageId: string | null) =>
  createManagementClient(z, bundle)
    .listLanguageVariantsOfItem()
    .byItemId(itemId)
    .toPromise()
    .then(res => res.data.items)
    .then(variants => {
      const variantId = languageId || defaultLanguageId;

      return variants.find(v => v.language.id === variantId) ||
        variants.find(v => v.language.id === defaultLanguageId) ||
        variants[0] ||
        null;
    });
