import { createAppTester } from 'zapier-platform-core';
import * as nock from 'nock';
import App from '../../index';
import triggerItemExistenceChanged from '../../triggers/triggerItemExistenceChanged';
import { prepareMocksForWebhookSubscribeTest } from '../utils/prepareMocksForWebhookSubscribeTest';

const appTester = createAppTester(App);
nock.disableNetConnect();

afterEach(() => nock.cleanAll());

describe("triggerItemExistenceChanged", () => {
  it("creates new webhook upon through CM API upon subscribe", async () => {
    const expectedWatchedEvents = [
      "create" as const,
      "archive" as const,
      "restore" as const,
    ];

    const bundle = prepareMocksForWebhookSubscribeTest({
      triggers: {
        management_api_content_changes: [
          {
            type: "content_item_variant",
            operations: expectedWatchedEvents,
          } as const,
        ],
      },
      watchedEvents: expectedWatchedEvents,
    });

    const subscribe = App.triggers[triggerItemExistenceChanged.key].operation.performSubscribe;

    const result = await appTester(subscribe, bundle);

    expect(result).toMatchInlineSnapshot(`
      Webhook {
        "id": "404c8821-d3ba-4794-8cee-853f3952ca99",
        "lastModified": 1993-01-31T23:00:00.000Z,
        "name": "Simple test name for webhook (Zapier)",
        "secret": "sample_secret",
        "triggers": {
          "deliveryApiContentChanges": [],
          "workflowStepChanges": [],
        },
        "url": "https://test-url.test",
      }
    `);
  });
});
