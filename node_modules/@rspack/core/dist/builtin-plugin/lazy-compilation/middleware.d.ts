import type { Compiler, LazyCompilationOptions } from "../..";
import type { Middleware } from "../../config/devServer";
export declare const LAZY_COMPILATION_PREFIX = "/lazy-compilation-using-";
export declare const lazyCompilationMiddleware: (compiler: Compiler, userOptions?: LazyCompilationOptions | boolean) => Middleware;
