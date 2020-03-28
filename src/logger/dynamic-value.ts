import { createLogger } from './index';
import _ from 'lodash';
import * as inversify from 'inversify';
import { getLabelFromServiceId } from './lib/get-label-from-service-id'
import { Logger } from 'winston'

export function loggerDynamicValueFactory(ctx: inversify.interfaces.Context): Logger {
  const loggerLabel = getLabelFromServiceId(
    _.get(ctx, ['currentRequest', 'parentRequest', 'serviceIdentifier']),
  );

  return createLogger(loggerLabel);
}
