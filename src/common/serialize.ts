const ENCODING: BufferEncoding = 'base64';
export type SerializedBuffer = string & { readonly _opaque: unique symbol };

export const serializeBuffer = (buffer: Buffer): SerializedBuffer => buffer.toString(ENCODING) as SerializedBuffer; // Opaque cast
export const deserializeBuffer = (buffer: SerializedBuffer): Buffer => Buffer.from(buffer, ENCODING);
