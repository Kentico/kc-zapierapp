import { Bundle } from 'zapier-platform-core';

export type KontentBundle<InputData extends Readonly<Record<string, unknown>>> =
  Omit<Bundle<InputData>, 'authData'> & Readonly<{ authData: AuthData }>;

type AuthData = Readonly<{
  projectId: string;
  cmApiKey: string;
  previewApiKey: string;
  secureApiKey?: string;
}>;
