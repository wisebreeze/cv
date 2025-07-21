import { z } from "../../../compiled/zod";
type RawStyleConfig = {
    styleLibraryDirectory?: string;
    custom?: string;
    css?: string;
    bool?: boolean;
};
type RawPluginImportConfig = {
    libraryName: string;
    libraryDirectory?: string;
    customName?: string;
    customStyleName?: string;
    style?: RawStyleConfig;
    camelToDashComponentName?: boolean;
    transformToDefaultImport?: boolean;
    ignoreEsComponent?: Array<string>;
    ignoreStyleComponent?: Array<string>;
};
type PluginImportConfig = {
    libraryName: string;
    libraryDirectory?: string;
    customName?: string;
    customStyleName?: string;
    style?: string | boolean;
    styleLibraryDirectory?: string;
    camelToDashComponentName?: boolean;
    transformToDefaultImport?: boolean;
    ignoreEsComponent?: string[];
    ignoreStyleComponent?: string[];
};
type PluginImportOptions = PluginImportConfig[] | undefined;
export declare const ZodSwcPluginImportConfig: z.ZodOptional<z.ZodArray<z.ZodObject<{
    libraryName: z.ZodString;
    libraryDirectory: z.ZodOptional<z.ZodString>;
    customName: z.ZodOptional<z.ZodString>;
    customStyleName: z.ZodOptional<z.ZodString>;
    style: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodBoolean]>>;
    styleLibraryDirectory: z.ZodOptional<z.ZodString>;
    camelToDashComponentName: z.ZodOptional<z.ZodBoolean>;
    transformToDefaultImport: z.ZodOptional<z.ZodBoolean>;
    ignoreEsComponent: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    ignoreStyleComponent: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strict", z.ZodTypeAny, {
    libraryName: string;
    libraryDirectory?: string | undefined;
    customName?: string | undefined;
    customStyleName?: string | undefined;
    style?: string | boolean | undefined;
    styleLibraryDirectory?: string | undefined;
    camelToDashComponentName?: boolean | undefined;
    transformToDefaultImport?: boolean | undefined;
    ignoreEsComponent?: string[] | undefined;
    ignoreStyleComponent?: string[] | undefined;
}, {
    libraryName: string;
    libraryDirectory?: string | undefined;
    customName?: string | undefined;
    customStyleName?: string | undefined;
    style?: string | boolean | undefined;
    styleLibraryDirectory?: string | undefined;
    camelToDashComponentName?: boolean | undefined;
    transformToDefaultImport?: boolean | undefined;
    ignoreEsComponent?: string[] | undefined;
    ignoreStyleComponent?: string[] | undefined;
}>, "many">>;
declare function resolvePluginImport(pluginImport: PluginImportOptions): RawPluginImportConfig[] | undefined;
export { resolvePluginImport };
export type { PluginImportOptions };
