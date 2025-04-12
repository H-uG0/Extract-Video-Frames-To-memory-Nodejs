import { Transform, type TransformCallback } from "stream";

class ExtractFrames extends Transform {
  private delimiter: Buffer;
  private buffer: Buffer;

  constructor(delimiter: string) {
    super({ readableObjectMode: true });
    this.delimiter = Buffer.from(delimiter, "hex");
    this.buffer = Buffer.alloc(0);
  }

  _transform(
    data: Buffer,
    encoding: BufferEncoding,
    callback: TransformCallback
  ): void {
    // Add new data to buffer
    this.buffer = Buffer.concat([this.buffer, data]);
    while (true) {
      const start = this.buffer.indexOf(this.delimiter);
      if (start < 0) break; // there's no frame data at all
      const end = this.buffer.indexOf(
        this.delimiter,
        start + this.delimiter.length
      );
      if (end < 0) break; // we haven't got the whole frame yet
      this.push(this.buffer.subarray(start, end)); // emit a frame
      this.buffer = this.buffer.subarray(end); // remove frame data from buffer
      if (start > 0) console.error(`Discarded ${start} bytes of invalid data`);
    }
    callback();
  }
}

export default ExtractFrames;
