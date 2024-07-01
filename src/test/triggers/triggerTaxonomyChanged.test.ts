import { createAppTester } from "zapier-platform-core";
import * as nock from "nock";
import App from "../../index";
import { prepareMocksForWebhookSubscribeTest } from "../utils/prepareMocksForWebhookSubscribeTest";
import triggerTaxonomyChanged from "../../triggers/triggerTaxonomyChanged";

const appTester = createAppTester(App);
nock.disableNetConnect();

afterEach(() => nock.cleanAll());

describe("triggerTaxonomyChanged", () => {
  it("creates new webhook upon through CM API upon subscribe", async () => {
    const expectedWatchedEvents = [
      "archive" as const,
      "restore" as const,
      "upsert" as const,
    ];

    const bundle = prepareMocksForWebhookSubscribeTest({
      triggers: {
        delivery_api_content_changes: [
          {
            type: "taxonomy",
            operations: expectedWatchedEvents,
          },
        ],
      },
      watchedEvents: expectedWatchedEvents,
    });

    const subscribe =
      App.triggers[triggerTaxonomyChanged.key].operation.performSubscribe;

    const result = await appTester(subscribe, bundle);

    expect(result).toMatchInlineSnapshot(`
      LegacyWebhook {
        "healthStatus": undefined,
        "id": "404c8821-d3ba-4794-8cee-853f3952ca99",
        "lastModified": 1993-01-01T00:00:00.000Z,
        "name": "Simple test name for webhook (Zapier)",
        "secret": "sample_secret",
        "triggers": {
          "deliveryApiContentChanges": [
            LegacyWebhookDeliveryApiContentChanges {
              "operations": [
                "archive",
                "restore",
                "upsert",
              ],
              "type": "taxonomy",
            },
          ],
          "managementApiContentChanges": [],
          "previewDeliveryContentChanges": [],
          "workflowStepChanges": [],
        },
        "url": "https://test-url.test",
      }
    `);
  });
});
