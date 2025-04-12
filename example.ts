import readVideo from "./src/index.ts";

const videoPath = "./public/video.mp4";
// return Frames in array of buffers [buffer<> , buffer<> ,.....]
const frames = readVideo(videoPath).then((data) => console.log(data.length));
