/* globals describe, expect, test */

import { createAppTester, tools } from 'zapier-platform-core';
import App from '../index';

const appTester = createAppTester(App);

describe('My App', () => {

  it('template test', (done) => {
    const x = 1;

    expect(x).toBe(1);
    done();
  });

});
