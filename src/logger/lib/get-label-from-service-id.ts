import inversify from 'inversify'
import _ from 'lodash'

export function getLabelFromServiceId(
  serviceIdentifier: inversify.interfaces.ServiceIdentifier<any>,
): string {
  if (_.isString(serviceIdentifier)) {
    return serviceIdentifier;
  }

  if (typeof serviceIdentifier === 'symbol') {
    return Symbol.keyFor(serviceIdentifier);
  }

  if (_.isFunction(serviceIdentifier)) {
    return serviceIdentifier.name;
  }

  return _.toString(serviceIdentifier);
}