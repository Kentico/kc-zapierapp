import { getItem } from './getItem';
import { getItemResult } from './getItemResult';
import { getItemVariant } from './getItemVariant';
import { ZObject } from 'zapier-platform-core';
import { KontentBundle } from '../../../types/kontentBundle';

export const getContentItem = async (z: ZObject, bundle: KontentBundle<{}>, itemId: string, languageId: string) => {
    const item = await getItem(z, bundle, { type: 'id', value: itemId });
    if (!item) {
        return null;
    }

    const variant = await getItemVariant(z, bundle, itemId, languageId);
    if (!variant) {
        return null;
    }

    return await getItemResult(z, bundle, item, variant);
};
