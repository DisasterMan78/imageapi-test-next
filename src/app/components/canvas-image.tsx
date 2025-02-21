import { useEffect, useRef } from "react";

type CanvasProps = {
  imageData: ImageData;
  width: number;
  height: number;
};

const CanvasImage = (props: CanvasProps) => {
  const { width, height, imageData } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      canvas.width = width;
      canvas.height = height;
      context?.putImageData(imageData, 0, 0);
    }
  });
  return <canvas ref={canvasRef} width={width} height={height} />;
};


export default CanvasImage;
