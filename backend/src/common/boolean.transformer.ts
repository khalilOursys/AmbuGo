// src/common/transformers/boolean.transformer.ts
import { Transform } from 'class-transformer';

export const ToBoolean = () => {
  return Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  });
};
