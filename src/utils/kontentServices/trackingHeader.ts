const sourceTrackingHeaderName = 'X-KC-SOURCE';

const packageInfo = require('../../../package.json');

export const trackingHeader = {
  header: sourceTrackingHeaderName,
  value: `${packageInfo.name};${packageInfo.version}`,
};
