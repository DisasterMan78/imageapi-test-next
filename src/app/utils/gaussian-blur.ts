import { RawImageData } from "jpeg-js";
import { HexValueInDecimal, imageDataToPixelMatrix, PixelMatrix } from "./image-processing";
import { gaussianMapData } from "./make-gaussian-matrix";


const averageByWeight = (coreValue: number, secondaryValue: number, weight: number) => {
  const weightedValue = coreValue + (weight * (secondaryValue - coreValue));
  return weight !== 1 ? weightedValue : secondaryValue;
}

export const averageNeighbourByChannel = (pixelMatrix: PixelMatrix, yIndex: number, xIndex: number, channelIndex: number, blurRadius: number, gaussianMatrix: number[][]) => {
  const size = (blurRadius * 2) + 1;
  const initialX = xIndex - blurRadius;
  const initialY = yIndex - blurRadius;

  let newValue = pixelMatrix[yIndex][xIndex][channelIndex];

  for (let row = 0; row < size; row++) {
    const currentRow = pixelMatrix[initialY + row];
    if (currentRow) {
      for (let column = 0; column < size; column++) {
        const currentColumn = initialX + column;
        if (currentRow[currentColumn]) {
          const weight = gaussianMatrix ? gaussianMatrix[row][column] : 1;

          newValue = averageByWeight(newValue, currentRow[currentColumn][channelIndex], weight) as HexValueInDecimal;
        }
      }
    }
  }
  return newValue;
}


const gaussianBlur = (imageData: RawImageData<Buffer>, blurRadius = 1) => {
  const { width, height } = imageData;
  const pixelMatrix = imageDataToPixelMatrix(imageData);
  const buffer = new ArrayBuffer(
    4 * width * height
  );
  const newUint8CData = new Uint8ClampedArray(buffer);
  const blurDiameter = (blurRadius * 2) + 1;
  const gaussianMatrix = gaussianMapData(blurDiameter, blurDiameter, 1);
  // console.log("🚀 ~ gaussianBlur ~ gaussianMatrix:", gaussianMatrix);

  for (let yIndex = 0; yIndex < height; yIndex++) {
    for (let xIndex = 0; xIndex < width; xIndex++) {
      const arrayOffset = (yIndex * (width * 4)) + (xIndex * 4);

      // Red channel
      newUint8CData[arrayOffset + 0] = averageNeighbourByChannel(pixelMatrix, yIndex, xIndex, 0, blurRadius, gaussianMatrix);
      // Green channel
      newUint8CData[arrayOffset + 1] = averageNeighbourByChannel(pixelMatrix, yIndex, xIndex, 1, blurRadius, gaussianMatrix);
      // Blue channel
      newUint8CData[arrayOffset + 2] = averageNeighbourByChannel(pixelMatrix, yIndex, xIndex, 2, blurRadius, gaussianMatrix);
      // Alpha channel
      newUint8CData[arrayOffset + 3] = 255;
    }
  }

  return newUint8CData;
}

export default gaussianBlur;
