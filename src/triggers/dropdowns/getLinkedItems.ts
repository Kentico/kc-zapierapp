import { contentItemSample } from '../../fields/samples/contentItemSample';
import { ZObject } from 'zapier-platform-core';
import { KontentBundle } from '../../types/kontentBundle';
import { createDeliveryClient } from '../../utils/kontentServices/deliverClient';
import { getLanguages } from '../../utils/languages/getLanguages';
import {
  DeliveryItemOutputFields,
  deliveryItemOutputFields,
  prepareDeliveryItemForOutput,
} from '../../fields/output/deliveryItemOutputFields';

const execute = async (z: ZObject, bundle: KontentBundle<{}>): Promise<Output> => {
  const languages = await getLanguages(z, bundle);

  return createDeliveryClient(z, bundle)
    .items()
    .queryConfig({ usePreviewMode: true })
    .depthParameter(0)
    .limitParameter(10)
    .skipParameter(10 * bundle.meta.page)
    .orderByAscending('system.name')
    .toAllPromise()
    .then(res => res.data.items.map(prepareDeliveryItemForOutput(languages)));
};

type Output = ReadonlyArray<DeliveryItemOutputFields>

export default {
  noun: 'Linked item',
  display: {
    hidden: true,
    important: false,
    description: 'Gets content items for a linked items element ordered by name.',
    label: 'Get Linked Items',
},
  key: 'get_linked_items',
  operation: {
    perform: execute,
    sample: contentItemSample,
    canPaginate: true,
    outputFields: deliveryItemOutputFields,
  },
};
