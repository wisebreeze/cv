/**
 * The following code is modified based on
 * https://github.com/webpack/webpack/blob/4b4ca3b/lib/util/hash/BatchedHash.js
 *
 * MIT Licensed
 * Author Tobias Koppers @sokra
 * Copyright (c) JS Foundation and other contributors
 * https://github.com/webpack/webpack/blob/main/LICENSE
 */
import Hash from ".";
export default class BatchedHash extends Hash {
    string: string | undefined;
    encoding: string | undefined;
    hash: Hash;
    constructor(hash: Hash);
    /**
     * Update hash {@link https://nodejs.org/api/crypto.html#crypto_hash_update_data_inputencoding}
     * @param data data
     * @param inputEncoding data encoding
     * @returns updated hash
     */
    update(data: string | Buffer, inputEncoding?: string): this;
    digest(): Buffer;
    digest(encoding: string): string;
}
