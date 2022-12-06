import { KontentBundle } from '../../types/kontentBundle';
import { mockBundle } from './mockBundle';
import { ManagementClient } from '@kontent-ai/management-sdk';
import * as nock from 'nock';
import { WebhookModels } from '@kontent-ai/management-sdk/lib/models';
import { createUTCDate } from './date';

type ExpectedInputDataBase = Readonly<{
  languageId: string;
  name: string;
  contentTypeId: string;
  watchedEvents: ReadonlyArray<string>;
}>

type Params<InputData extends ExpectedInputDataBase> = Readonly<{
  watchedEvents: InputData['watchedEvents'];
  triggers: WebhookModels.IAddWebhookData['triggers'];
}>;

export const prepareMocksForWebhookSubscribeTest = <InputData extends ExpectedInputDataBase>(params: Params<InputData>) => {
  const bundle: KontentBundle<InputData> = {
    ...mockBundle,
    inputData: {
      ...mockBundle.inputData,
      languageId: "17bb2114-476a-43be-87cb-95fea70dce6e",
      name: "Simple test name for webhook",
      contentTypeId: "cd54f362-c532-4df8-be8c-969fc1db97ba",
      watchedEvents: params.watchedEvents,
    } as InputData,
    targetUrl: "https://test-url.test",
  };

  const expectedName = `${bundle.inputData.name} (Zapier)`;

  const expectedRequest = new ManagementClient({
    projectId: bundle.authData.projectId,
    apiKey: bundle.authData.cmApiKey,
  })
    .addWebhook()
    .withData({
      name: expectedName,
      url: bundle.targetUrl || "",
      secret: "sample_secret",
      triggers: params.triggers,
    });
  nock(expectedRequest.getUrl())
    .post(
      "",
      (body) => body.name === expectedName && body.url === bundle.targetUrl
    )
    .reply(201, {
      id: "404c8821-d3ba-4794-8cee-853f3952ca99",
      name: expectedRequest.data.name,
      url: expectedRequest.data.url,
      secret: expectedRequest.data.secret,
      triggers: {
        delivery_api_content_changes: [],
        workflow_step_changes: [],
        ...params.triggers,
      },
      last_modified: createUTCDate(1993, 1, 1).toISOString(),
    });

  return bundle;
}
