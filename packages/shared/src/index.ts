export const isObject = (value: unknown) => typeof value === 'object';

export const isFunction = (value: unknown) => typeof value === 'function';

export const isString = (value: unknown) => typeof value === 'string';

export const isNumber = (value: unknown) => typeof value === 'number';

export const isArray = Array.isArray;

export const assign = Object.assign;
