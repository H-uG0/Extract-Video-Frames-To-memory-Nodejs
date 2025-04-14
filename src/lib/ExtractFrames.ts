import { Transform, type TransformCallback } from "stream";

class ExtractFrames extends Transform {
  private delimiter: Buffer;
  private buffer: Buffer;
  private frameCount: number;
  private fps: number; // Frames per second

  constructor(delimiter: string, fps: number) {
    super({ readableObjectMode: true });
    this.delimiter = Buffer.from(delimiter, "hex");
    this.buffer = Buffer.alloc(0);
    this.frameCount = 0;
    this.fps = fps;
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

      const frameData = this.buffer.subarray(start, end);
      const timestamp = Math.round((this.frameCount / this.fps) * 1000); // Calculate timestamp
      this.push({ timestamp, frame: frameData }); // emit a frame with timestamp

      this.buffer = this.buffer.subarray(end); // remove frame data from buffer
      this.frameCount++;

      if (start > 0) console.error(`Discarded ${start} bytes of invalid data`);
    }
    callback();
  }
}

export default ExtractFrames;
