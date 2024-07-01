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
      label: 'Environment ID',
      key: 'projectId',
      type: 'string',
      required: true,
      helpText: 'Your project\'s environment ID is available in [Kontent.ai](https://app.kontent.ai) > Environment settings > General > Environment ID.',
    },
    {
      label: 'Management API Key',
      key: 'cmApiKey',
      type: 'string',
      required: true,
      helpText: 'Create a [Management API key](https://kontent.ai/learn/docs/apis/api-keys#a-create-management-api-keys) in [Kontent.ai](https://app.kontent.ai) > Project settings > API Keys > Management API keys.',
    },
    {
      label: 'Delivery API key for content preview',
      key: 'previewApiKey',
      type: 'string',
      required: true,
      helpText: 'Create a [Delivery API key](https://kontent.ai/learn/docs/apis/api-keys#a-create-delivery-api-keys) for content preview in [Kontent.ai](https://app.kontent.ai) > Project settings > API Keys > Delivery API keys.',
    },
    {
      label: 'Delivery API key for secure access',
      key: 'secureApiKey',
      type: 'string',
      required: false,
      helpText: 'This is required for taxonomy steps if [secure access](https://kontent.ai/learn/docs/security/secure-access/javascript) is enabled in your project. Create a [Delivery API key](https://kontent.ai/learn/docs/apis/api-keys#a-create-delivery-api-keys) for secure access in [Kontent.ai](https://app.kontent.ai) > Project settings > API Keys > Delivery API keys.',
    },
  ],
  connectionLabel: '{{projectName}} - {{bundle.authData.projectId}}',
};

const checkCmApi = (z: ZObject, bundle: KontentBundle<{}>) =>
  createManagementClient(z, bundle)
    .environmentInformation()
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
