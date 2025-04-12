import fluentFfmpeg from "fluent-ffmpeg";

interface VideoDimensions {
  width: number;
  height: number;
}

const GetVideoWH = async (path: string): Promise<VideoDimensions> => {
  return new Promise((resolve, reject) => {
    fluentFfmpeg.ffprobe(
      path,
      (err: Error | null, data: fluentFfmpeg.FfprobeData) => {
        if (err) {
          reject(err);
          return;
        }

        // Find the first video stream with dimensions
        const videoStream = data.streams.find(
          (stream) =>
            stream.codec_type === "video" && stream.width && stream.height
        );

        if (!videoStream?.width || !videoStream?.height) {
          reject(new Error("Could not determine video dimensions"));
          return;
        }

        //console.log("Video dimensions:", videoStream.width, videoStream.height);
        resolve({
          width: videoStream.width,
          height: videoStream.height,
        });
      }
    );
  });
};

export default GetVideoWH;
