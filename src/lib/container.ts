import { Container } from 'inversify';
import getDecorators from 'inversify-inject-decorators';

export const container = new Container();

export const decorators = getDecorators(container);
