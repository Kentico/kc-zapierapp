import { createAppTester } from 'zapier-platform-core';
import * as nock from 'nock';
import { addInputData, mockBundle } from '../utils/mockBundle';
import { LanguageVariantContracts, ManagementClient, WorkflowContracts } from '@kontent-ai/management-sdk';
import App from '../../index';
import { KontentBundle } from '../../types/kontentBundle';
import { changeContentItemWorkflow, InputData } from '../../actions/changeContentItemWorkflow';
import { createUTCDate } from '../utils/date';

const appTester = createAppTester(App);
nock.disableNetConnect();

afterEach(() => nock.cleanAll());

describe("changeContentItemWorkflow", () => {
  it("changes WF step", async () => {
    const bundle: KontentBundle<InputData> = addInputData(mockBundle, {
      fullItemId: `${rawVariant.item.id}/${rawVariant.language.id}`,
      workflowStepIds: rawWfSteps[1]?.id || "",
    });

    const client = new ManagementClient({
      environmentId: bundle.authData.projectId,
      apiKey: bundle.authData.cmApiKey,
    });

    const expectedWfRequest = client.listWorkflowSteps();
    nock(expectedWfRequest.getUrl()).get("").reply(200, rawWfSteps);

    const expectedVariantRequest = client
      .viewLanguageVariant()
      .byItemId(rawVariant.item.id || "")
      .byLanguageId(rawVariant.language.id || "");
    nock(expectedVariantRequest.getUrl()).get("").reply(200, rawVariant);

    const expectedChangeWfRequest = client
      .changeWorkflowStepOfLanguageVariant()
      .byItemId(rawVariant.item.id || "")
      .byLanguageId(rawVariant.language.id || "")
      .byWorkflowStepId(rawWfSteps[1]?.id || "");
    nock(expectedChangeWfRequest.getUrl()).put("").reply(204);

    const search = App.creates[changeContentItemWorkflow.key].operation.perform;

    const result = await appTester(search, bundle);

    expect(result).toMatchInlineSnapshot(`
      {
        "message": "Content item workflow step has changed",
      }
    `);
  });
});

const rawWfSteps: ReadonlyArray<WorkflowContracts.IWorkflowStepContract> = [
  {
    id: "50fc24bd-0fc1-426e-b9c3-572de7cd179a",
    name: "Draft",
    codename: "draft",
    transitions_to: ["792ea977-4fc1-49c8-9950-4c245576f423"],
  },
  {
    id: "792ea977-4fc1-49c8-9950-4c245576f423",
    name: "Review",
    codename: "review",
    transitions_to: ["4cf052e1-13a3-4649-9eb7-65e07a7cfc49"],
  },
  {
    id: "4cf052e1-13a3-4649-9eb7-65e07a7cfc49",
    name: "Publish",
    codename: "publish",
    transitions_to: [],
  },
];

const rawVariant: LanguageVariantContracts.ILanguageVariantModelContract = {
  item: { id: "db2dcddc-62c5-41a7-81f5-9f958f69b0bd" },
  language: { id: "984efe5c-6898-4d51-8afa-a66b9de51cc0" },
  elements: [],
  last_modified: createUTCDate(1316, 5, 14).toISOString(),
  workflow: {
    workflow_identifier: { codename: "default" },
    step_identifier: { id: rawWfSteps[0]?.id },
  },
  workflow_step: { id: rawWfSteps[0]?.id },
};
