import iconv from "iconv-lite";
import { Buffer } from "buffer";

import { Int64LE } from "int64-buffer";
Buffer.prototype.readBigInt64LE = function (offset: number) {
  const buffer = this.slice(offset);
  return new Int64LE(buffer);
};

export default class Packet {
  public buffer: Buffer;

  private writePosition: number;

  private readPosition: number;

  constructor(buff?: number[] | Buffer) {
    this.buffer = Array.isArray(buff)
      ? Buffer.from(buff)
      : Buffer.isBuffer(buff)
      ? buff
      : Buffer.alloc(0);

    this.writePosition = this.length;
    this.readPosition = 0;

    if (typeof buff === "number") {
      this.writeUnsignedShort(buff);
    }
  }

  get length(): number {
    return this.buffer.length;
  }

  get available(): Buffer {
    return this.buffer.slice(this.readPosition);
  }

  get availableBytes(): number {
    return this.length - this.readPosition;
  }

  public expand(value: number): void {
    if (this.length - this.writePosition < value) {
      this.buffer = Buffer.concat([
        this.buffer,
        Buffer.alloc(value - (this.length - this.writePosition)),
      ]);
    }
  }

  public reset(): void {
    this.writePosition = 0;
    this.readPosition = 0;
    this.buffer = Buffer.alloc(0);
  }

  public position(pos: number): this {
    this.readPosition = pos;
    return this;
  }

  public skip(length: number): this {
    if (length <= this.availableBytes) {
      this.readPosition += length;
    } else {
      this.readPosition += this.availableBytes;
    }
    return this;
  }

  public fill(fill: number, size: number): this {
    this.write(Buffer.alloc(size).fill(fill, 0));
    return this;
  }

  public write(data: string | number[] | Buffer | Packet): this {
    let buffer: Buffer = Buffer.alloc(0);

    if (Buffer.isBuffer(data)) {
      buffer = data;
    } else if (Array.isArray(data) || typeof data === "string") {
      buffer = Buffer.from(data);
    } else if (data instanceof Packet) {
      buffer = data.buffer;
    } else {
      throw "The value type must be Buffer, Packet, string or number array.";
    }

    this.buffer = Buffer.concat([this.buffer, buffer]);
    this.writePosition += buffer.length;
    return this;
  }

  public writeBool(value: boolean): this {
    return this.writeByte(value ? 1 : 0);
  }

  public writeByte(value: number): this {
    this.expand(1);
    this.buffer.writeInt8(value, this.writePosition++);
    return this;
  }

  public writeUnsignedByte(value: number): this {
    this.expand(1);
    this.buffer.writeUInt8(value, this.writePosition++);
    return this;
  }

  public writeShort(value: number): this {
    this.expand(2);
    this.buffer.writeInt16LE(value, this.writePosition);
    this.writePosition += 2;
    return this;
  }

  public writeUnsignedShort(value: number): this {
    this.expand(2);
    this.buffer.writeUInt16LE(value, this.writePosition);
    this.writePosition += 2;
    return this;
  }

  public writeInt(value: number): this {
    this.expand(4);
    this.buffer.writeInt32LE(value, this.writePosition);
    this.writePosition += 4;
    return this;
  }

  public writeUnsignedInt(value: number): this {
    this.expand(4);
    this.buffer.writeUInt32LE(value, this.writePosition);
    this.writePosition += 4;
    return this;
  }

  public writeLong(value: bigint | number): this {
    this.expand(8);
    this.buffer.writeBigInt64LE(BigInt(value), this.writePosition);
    this.writePosition += 8;
    return this;
  }

  public writeUnsignedLong(value: bigint | number): this {
    this.expand(8);
    this.buffer.writeBigUInt64LE(BigInt(value), this.writePosition);
    this.writePosition += 8;
    return this;
  }

  public writeFloat(value: number): this {
    this.expand(4);
    this.buffer.writeFloatLE(value, this.writePosition);
    this.writePosition += 4;
    return this;
  }

  public writeString(value: string, length = 0, encode = "win1256"): this {
    const buff = iconv.encode(value, encode);
    this.write(buff);
    if (!length) {
      this.writeByte(0);
      return this;
    }
    this.write(Buffer.from("\x00".repeat(length - buff.length)));
    return this;
  }

  public writeGarbage(size = 4): this {
    for (let i = 0; i < size; ++i) {
      this.writeUnsignedByte(Math.floor(Math.random() * 255));
    }
    return this;
  }

  public readBuffer(length: number): Buffer {
    const value = this.buffer.slice(
      this.readPosition,
      this.readPosition + length
    );
    this.readPosition += length;
    return value;
  }

  public readBool(): boolean {
    return this.readByte() === 1;
  }

  public readByte(): number {
    return this.buffer.readInt8(this.readPosition++);
  }

  public readUnsignedByte(): number {
    return this.buffer.readUInt8(this.readPosition++);
  }

  public readShort(): number {
    const value = this.buffer.readInt16LE(this.readPosition);
    this.readPosition += 2;
    return value;
  }

  public readUnsignedShort(): number {
    const value = this.buffer.readUInt16LE(this.readPosition);
    this.readPosition += 2;
    return value;
  }

  public readInt(): number {
    const value = this.buffer.readInt32LE(this.readPosition);
    this.readPosition += 4;
    return value;
  }

  public readUnsignedInt(): number {
    const value = this.buffer.readUInt32LE(this.readPosition);
    this.readPosition += 4;
    return value;
  }

  public readLong(): bigint {
    const value = this.buffer.readBigInt64LE(this.readPosition);
    this.readPosition += 8;
    return value;
  }

  public readUnsignedLong(): bigint {
    const value = this.buffer.readBigUInt64LE(this.readPosition);
    this.readPosition += 8;
    return value;
  }

  public readFloat(): number {
    const value = this.buffer.readFloatLE(this.readPosition);
    this.readPosition += 4;
    return value;
  }

  private readRawString(encode = "win1256"): string {
    let end = this.readPosition + this.availableBytes;
    for (let i = 0; i < this.availableBytes; ++i) {
      if (this.buffer[this.readPosition + i] === 0) {
        end = this.readPosition + i;
        break;
      }
    }

    const buffer = this.buffer.subarray(this.readPosition, end);
    this.readPosition += end - this.readPosition;
    return iconv.decode(buffer, encode);
  }

  public readString(length = 0, encode = "win1256"): string {
    if (!length) {
      return this.readRawString(encode);
    }
    let end = this.readPosition + length;
    for (let i = 0; i < length; ++i) {
      if (this.buffer[this.readPosition + i] === 0) {
        end = this.readPosition + i;
        break;
      }
    }
    const buffer = this.buffer.slice(this.readPosition, end);
    this.readPosition += length;
    return iconv.decode(buffer, encode);
  }

  public toHex(): string {
    return (
      this.available
        .toString("hex")
        .toUpperCase()
        .match(/[0-9A-F]{2}/g)
        ?.join(" ") || ""
    );
  }

  public toString(): string {
    return this.available.toString("utf-8");
  }
}
