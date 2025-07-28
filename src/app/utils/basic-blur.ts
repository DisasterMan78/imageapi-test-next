import { RawImageData } from "jpeg-js";
import { imageDataToPixelMatrix, PixelMatrix } from "./image-processing";


export const averageNeighbourByChannel = (pixelMatrix: PixelMatrix, yIndex: number, xIndex: number, channelIndex: number, blurRadius: number) => {
  const size = (blurRadius * 2) + 1;
  const initialX = xIndex - blurRadius;
  const initialY = yIndex - (2 * blurRadius);
  const neighbours: number[] = [];

  for (let row = 0; row < size; row++) {
    const currentRow = pixelMatrix[initialY + row];
    if (currentRow) {
      for (let column = 0; column < size; column++) {
        const currentColumn = initialX + column;
        if (currentRow[currentColumn]) {

          neighbours.push(currentRow[currentColumn][channelIndex]);
        }
      }
    }
  }

  const sum = neighbours.reduce((accumulator, value) => accumulator + value, 0);

  return Math.round(sum / neighbours.length);
}


const basicBlur = (imageData: RawImageData<Buffer>, blurRadius = 1) => {
  const { width, height } = imageData;
  const pixelMatrix = imageDataToPixelMatrix(imageData);
  const buffer = new ArrayBuffer(
    4 * width * height
  );
  const newUint8CData = new Uint8ClampedArray(buffer);

  for (let yIndex = 0; yIndex < height; yIndex++) {
    for (let xIndex = 0; xIndex < width; xIndex++) {
      const arrayOffset = (yIndex * (width * 4))  + (xIndex * 4);

      newUint8CData[arrayOffset + 0] = averageNeighbourByChannel(pixelMatrix, yIndex, xIndex, 0, blurRadius);
      newUint8CData[arrayOffset + 1] = averageNeighbourByChannel(pixelMatrix, yIndex, xIndex, 1, blurRadius);
      newUint8CData[arrayOffset + 2] = newUint8CData[arrayOffset + 3] = averageNeighbourByChannel(pixelMatrix, yIndex, xIndex, 2, blurRadius);
      newUint8CData[arrayOffset + 3] = 255;
    }
  }

  return newUint8CData;
}

export default basicBlur;
