import { ZObject } from 'zapier-platform-core';
import { KontentBundle } from './types/kontentBundle';
import { createManagementClient } from './utils/kontentServices/managementClient';
import { createDeliveryClient } from './utils/kontentServices/deliverClient';

const execute = (z: ZObject, bundle: KontentBundle<{}>) =>
  Promise.all([
    checkCmApi(z, bundle),
    checkPublicDeliveryApi(z, bundle),
    checkPreviewDeliveryApi(z, bundle),
  ])
    .then(([{ name }]) => ({ projectName: name }));

export const Authentication = {
  type: 'custom',
  test: execute,
  fields: [
    {
      label: 'Delivery API Project ID',
      key: 'projectId',
      type: 'string',
      required: true,
      helpText: 'Your project ID is available in the [Kontent.ai admin UI](https://app.kontent.ai) in Project Settings > API Keys.',
    },
    {
      label: 'Management API Key',
      key: 'cmApiKey',
      type: 'string',
      required: true,
      helpText: 'The Management API key is available in the [Kontent.ai admin UI](https://app.kontent.ai) in Project Settings > API Keys.',
    },
    {
      label: 'Preview API Key',
      key: 'previewApiKey',
      type: 'string',
      required: true,
      helpText: 'The Preview API key is available in the [Kontent.ai admin UI](https://app.kontent.ai) in Project Settings > API Keys. You can use the Primary or Secondary key.',
    },
    {
      label: 'Secure Access Key',
      key: 'secureApiKey',
      type: 'string',
      required: false,
      helpText: 'This is required for taxonomy steps if [Secure Access](https://kontent.ai/learn/tutorials/develop-apps/build-strong-foundation/restrict-public-access/) is enabled in your project and is available in the [Kontent.ai admin UI](https://app.kontent.ai) in Project Settings > API Keys.',
    },
  ],
  connectionLabel: '{{projectName}} - {{bundle.authData.projectId}}',
};

const checkCmApi = (z: ZObject, bundle: KontentBundle<{}>) =>
  createManagementClient(z, bundle)
    .projectInformation()
    .toPromise()
    .then(res => res.data.project);

const checkPublicDeliveryApi = (z: ZObject, bundle: KontentBundle<{}>) =>
  createDeliveryClient(z, bundle)
    .types()
    .toPromise();

const checkPreviewDeliveryApi = (z: ZObject, bundle: KontentBundle<{}>) =>
  createDeliveryClient(z, bundle)
    .types()
    .queryConfig({
      usePreviewMode: true,
      useSecuredMode: false,
    })
    .toPromise();
