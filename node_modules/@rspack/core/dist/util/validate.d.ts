import type { z } from "../../compiled/zod";
export declare class ValidationError extends Error {
    constructor(message: string);
}
export declare function validate<T extends z.ZodType>(opts: any, schema: T, options?: {
    output?: boolean;
    strategy?: "strict" | "loose-unrecognized-keys" | "loose-silent" | "loose";
}): string | null;
export declare function isValidate<T extends z.ZodType>(opts: any, schema: T): boolean;
