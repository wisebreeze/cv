import type { TransformOutput } from "@rspack/binding";
import type { JsMinifyOptions, Options as TransformOptions } from "../compiled/@swc/types";
export type { TransformOutput, TransformOptions, JsMinifyOptions };
export declare function minify(source: string, options?: JsMinifyOptions): Promise<TransformOutput>;
export declare function transform(source: string, options?: TransformOptions): Promise<TransformOutput>;
