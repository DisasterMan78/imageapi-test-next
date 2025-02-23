import { RawImageData } from "jpeg-js";
import { imageDataToPixelMatrix, PixelMatrix } from "./image-processing";


const neighboursAtDistance = (pixelMatrix: PixelMatrix, xIndex: number, yIndex: number, channelIndex: number, distance = 1) => {
  const size = (distance * 2) + 1;
  const initialX = xIndex - distance;
  const initialY = yIndex - distance;
  const firstRow = pixelMatrix[initialY];
  const lastRow = pixelMatrix[initialY + (distance * 2)];
  const values: number[] = [];

  for (let column = 0; column < size; column++) {
    if (firstRow && firstRow[initialX + column]) {
      values.push(firstRow[initialX + column][channelIndex]);
    }

    if (lastRow && lastRow[initialX + column]) {
      values.push(lastRow[initialX + column][channelIndex]);
    }
  }

  for (let row = 1; row < size - 1; row++) {
    const currentRow = pixelMatrix[initialY + row];
    if (currentRow && currentRow[initialX]) {
      values.push(currentRow[initialX][channelIndex]);
    }
    if (currentRow && currentRow[initialX + (distance * 2)]) {
      values.push(currentRow[initialX + (size - 1)][channelIndex]);
    }
  }
  return values;
}


export const averageNeighbourByChannel = (pixelMatrix: PixelMatrix, yIndex: number, xIndex: number, channelIndex: number, {
  blurRadius = 1,
}: {
    blurRadius?: number;
    gaussianMatrix?: null | number[][];
}) => {
  let neighbours: number[] = [];

  for (let distanceFromPixel = 1; distanceFromPixel < blurRadius + 1; distanceFromPixel++) {
    neighbours = neighbours.concat(neighboursAtDistance(pixelMatrix, xIndex, yIndex, channelIndex, distanceFromPixel))
  }

  neighbours.push(pixelMatrix[yIndex][xIndex][channelIndex]);

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

      newUint8CData[arrayOffset + 0] = averageNeighbourByChannel(pixelMatrix, yIndex, xIndex, 0, { blurRadius });
      newUint8CData[arrayOffset + 1] = averageNeighbourByChannel(pixelMatrix, yIndex, xIndex, 1, { blurRadius });
      newUint8CData[arrayOffset + 2] = newUint8CData[arrayOffset + 3] = averageNeighbourByChannel(pixelMatrix, yIndex, xIndex, 2, { blurRadius });
      newUint8CData[arrayOffset + 3] = 255;
    }
  }

  return newUint8CData;
}

export default basicBlur;
