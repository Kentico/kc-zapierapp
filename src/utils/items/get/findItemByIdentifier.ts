import { getItem } from './getItem';
import { KontentBundle } from '../../../types/kontentBundle';
import { ZObject } from 'zapier-platform-core';

const createIdentifier = (searchField: string, searchValue: string) => {
  if (!searchValue) {
    throw new Error(`Missing search value for ${searchField}`);
  }
  const value = searchValue;

  switch (searchField) {
    case 'externalId':
      return {
        type: 'externalId' as const,
        value,
      };
    case 'id':
      return {
        type: 'id' as const,
        value,
      };
    case 'system.codename':
      return {
        type: 'codename' as const,
        value,
      };
    default:
      return null;
  }
};

export async function findItemByIdentifier(z: ZObject, bundle: KontentBundle<{}>, searchField: string, searchValue: string) {
  const identifier = createIdentifier(searchField, searchValue);
  if (!identifier) {
    return null;
  }

  const item = await getItem(z, bundle, identifier);

  return item || null;
}
