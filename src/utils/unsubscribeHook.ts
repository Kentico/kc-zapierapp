import { ZObject } from 'zapier-platform-core';
import { KontentBundle } from '../types/kontentBundle';
import { createManagementClient } from './kontentServices/managementClient';

export function unsubscribeHook(z: ZObject, bundle: KontentBundle<{}>): Promise<void> {
  // bundle.subscribeData contains the parsed response JSON from the subscribe
  // request made initially.
  const webhook = bundle.subscribeData;

  return createManagementClient(z, bundle)
    .deleteWebhook()
    .byId(webhook?.id ?? '')
    .toPromise()
    .then(() => {
    });
}
