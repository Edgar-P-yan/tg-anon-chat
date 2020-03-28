import winston from 'winston';
import { Namespace } from 'cls-hooked';

export const addMetadataFromCls: AddMetadataFromClsFormatWrap = winston.format(
  (info, opts: AddMetadataFromClsOptions) => {
    info[opts.metadataProp] = opts.clsNs.get(opts.clsProp);
    return info;
  },
);

/**
 * winston does not export these internal types,
 * so we fetch them through ReturnType
 */
export type WinstonFormatWrap = ReturnType<typeof winston.format>;
export type WinstonFormat = ReturnType<WinstonFormatWrap>;

/**
 * after we got type Format we can create custom
 * FormatWrap type, with strongly typed opts argument
 */
export type AddMetadataFromClsFormatWrap = (
  opts: AddMetadataFromClsOptions,
) => WinstonFormat;

export interface AddMetadataFromClsOptions {
  clsNs: Namespace;
  clsProp: string;
  metadataProp: string;
}
