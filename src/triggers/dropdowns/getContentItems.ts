import { ZObject } from 'zapier-platform-core';
import { KontentBundle } from '../../types/kontentBundle';
import { createDeliveryClient } from '../../utils/kontentServices/deliverClient';
import { getLanguages } from '../../utils/languages/getLanguages';
import {
  deliveryItemOutputFields,
  DeliveryItemOutputFields,
  deliveryItemOutputFieldsSample,
  prepareDeliveryItemForOutput,
} from '../../fields/output/deliveryItemOutputFields';

const execute = async (z: ZObject, bundle: KontentBundle<{}>): Promise<Output> => {
  const languages = await getLanguages(z, bundle);

  return createDeliveryClient(z, bundle)
    .items()
    .queryConfig({ usePreviewMode: true, useSecuredMode: false })
    .limitParameter(10)
    .skipParameter(10 * bundle.meta.page)
    .depthParameter(0)
    .orderByAscending('system.name')
    .toAllPromise()
    .then(res => res.data.items.map(prepareDeliveryItemForOutput(languages)));
};

type Output = ReadonlyArray<DeliveryItemOutputFields>;

export default {
  noun: 'Content item',
  display: {
    hidden: true,
    important: false,
    description: 'Gets content items for the input dropdown ordered by name.',
    label: 'Get Content Items',
  },
  key: 'get_content_items',
  operation: {
    perform: execute,
    sample: deliveryItemOutputFieldsSample,
    canPaginate: true,
    outputFields: deliveryItemOutputFields,
  },
} as const;
