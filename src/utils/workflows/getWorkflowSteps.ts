import { ZObject } from 'zapier-platform-core';
import { KontentBundle } from '../../types/kontentBundle';
import { createManagementClient } from '../kontentServices/managementClient';

export const getWorkflowSteps = async (z: ZObject, bundle: KontentBundle<{}>) =>
  createManagementClient(z, bundle)
    .listWorkflowSteps()
    .toPromise()
    .then(res => res.data);
