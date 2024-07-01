import { createAppTester } from 'zapier-platform-core';
import App from '../../../index';
import * as nock from 'nock';
import { mockBundle } from '../../utils/mockBundle';
import {
  ManagementClient,
  WorkflowContracts,
} from '@kontent-ai/management-sdk';
import getWorkflowSteps from '../../../triggers/dropdowns/getWorkflowSteps';

const appTester = createAppTester(App);
nock.disableNetConnect();

afterEach(() => nock.cleanAll());

describe('getWorkflowSteps', () => {
  it('returns all WF steps returned by the CM API', async () => {
    const bundle = mockBundle;

    const expectedRequest = new ManagementClient({
      environmentId: bundle.authData.projectId,
      apiKey: bundle.authData.cmApiKey,
    }).listWorkflowSteps();

    const expectedRawWFSteps: ReadonlyArray<WorkflowContracts.IWorkflowStepContract> =
      [
        {
          id: 'a9c516b9-58e2-4ca8-bc03-b14ad2108daf',
          name: 'Draft',
          codename: 'draft',
          transitions_to: ['2803ba8a-c578-4890-a372-51b319a91827'],
        },
        {
          id: '2803ba8a-c578-4890-a372-51b319a91827',
          name: 'Publish',
          codename: 'publish',
          transitions_to: ['c19bd5e5-94bf-4a29-b502-6e51adef2ce8'],
        },
        {
          id: 'c19bd5e5-94bf-4a29-b502-6e51adef2ce8',
          name: 'Archived',
          codename: 'archived',
          transitions_to: ['a9c516b9-58e2-4ca8-bc03-b14ad2108daf'],
        },
      ];

    nock(expectedRequest.getUrl()).get('').reply(200, expectedRawWFSteps);

    const trigger = App.triggers[getWorkflowSteps.key].operation.perform;
    const result = await appTester(trigger, bundle);

    expect(result).toMatchInlineSnapshot(`
      [
        {
          "id": "a9c516b9-58e2-4ca8-bc03-b14ad2108daf",
          "name": "Draft",
        },
        {
          "id": "2803ba8a-c578-4890-a372-51b319a91827",
          "name": "Publish",
        },
        {
          "id": "c19bd5e5-94bf-4a29-b502-6e51adef2ce8",
          "name": "Archived",
        },
      ]
    `);
  });
});
