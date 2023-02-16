import { ZObject } from "zapier-platform-core";
import { KontentBundle } from "../../types/kontentBundle";
import { createManagementClient } from "../kontentServices/managementClient";

export const getContentTypeSnippets = (z: ZObject, bundle: KontentBundle<{}>) =>
  createManagementClient(z, bundle)
    .listContentTypeSnippets()
    .toPromise()
    .then(res => res.data.items);