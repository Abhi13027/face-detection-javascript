import React, { useRef, useEffect } from "react";
import * as faceapi from "face-api.js";

import "./App.css";

function App() {
  const videoRef = useRef();
  const canvasRef = useRef();

  useEffect(() => {
    const loadAllModels = async () => {
      Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
        faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
        faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
        faceapi.nets.faceExpressionNet.loadFromUri("/models"),
      ])
        .then(startVideo)
        .catch((err) => console.log(err));
    };
    loadAllModels();
  }, []);

  const startVideo = () => {
    navigator.getUserMedia(
      {
        video: {},
      },
      (stream) => (videoRef.current.srcObject = stream),
      (err) => console.error(err)
    );
  };

  const onVideoPlayListener = () => {
    setInterval(async () => {
      canvasRef.current.innerHTML = faceapi.createCanvasFromMedia(
        videoRef.current
      );
      const displaySize = {
        width: videoRef.current.width,
        height: videoRef.current.height,
      };
      faceapi.matchDimensions(canvasRef.current, displaySize);
      const detections = await faceapi
        .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();
      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      canvasRef.current
        .getContext("2d")
        .clearRect(0, 0, videoRef.current.width, videoRef.current.height);
      faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
      faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetections);
      faceapi.draw.drawFaceExpressions(canvasRef.current, resizedDetections);
    }, 100);
  };

  return (
    <div className="app">
      <div className="app__container">
        <video
          id="video"
          width="720"
          height="560"
          autoPlay
          muted
          onPlay={onVideoPlayListener}
          ref={videoRef}
        ></video>
        <canvas className="app__container--canvas" ref={canvasRef}></canvas>
      </div>
    </div>
  );
}

export default App;
