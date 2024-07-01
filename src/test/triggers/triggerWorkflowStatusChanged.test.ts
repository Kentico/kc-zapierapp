import { createAppTester } from "zapier-platform-core";
import * as nock from "nock";
import App from "../../index";
import { prepareMocksForWebhookSubscribeTest } from "../utils/prepareMocksForWebhookSubscribeTest";
import triggerWorkflowStatusChanged from "../../triggers/triggerWorkflowStatusChanged";
import { addInputData } from "../utils/mockBundle";

const appTester = createAppTester(App);
nock.disableNetConnect();

afterEach(() => nock.cleanAll());

describe("triggerWorkflowStatusChanged", () => {
  it("creates new webhook upon through CM API upon subscribe", async () => {
    const stepIds = [
      "c2296c80-1ea1-444d-89a8-78118b41836a",
      "30298e49-f273-432f-90b2-cc383cd6ecd9",
    ];

    const bundle = prepareMocksForWebhookSubscribeTest({
      triggers: {
        workflow_step_changes: [
          {
            type: "content_item_variant",
            transitions_to: stepIds.map((id) => ({ id })),
          },
        ],
      },
      watchedEvents: [],
    });

    const subscribe =
      App.triggers[triggerWorkflowStatusChanged.key].operation.performSubscribe;

    const result = await appTester(
      subscribe,
      addInputData(bundle, { workflowStepIds: stepIds })
    );

    expect(result).toMatchInlineSnapshot(`
      {
        "healthStatus": undefined,
        "id": "404c8821-d3ba-4794-8cee-853f3952ca99",
        "lastModified": 1993-01-01T00:00:00.000Z,
        "name": "Simple test name for webhook (Zapier)",
        "secret": "sample_secret",
        "triggers": {
          "deliveryApiContentChanges": [],
          "managementApiContentChanges": [],
          "previewDeliveryContentChanges": [],
          "workflowStepChanges": [
            LegacyWebhookWorkflowStepChanges {
              "transitionsTo": [
                WebhookTransitionsTo {
                  "id": "c2296c80-1ea1-444d-89a8-78118b41836a",
                },
                WebhookTransitionsTo {
                  "id": "30298e49-f273-432f-90b2-cc383cd6ecd9",
                },
              ],
              "type": "content_item_variant",
            },
          ],
        },
        "url": "https://test-url.test",
      }
    `);
  });
});
