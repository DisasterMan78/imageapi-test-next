import { RawImageData } from "jpeg-js";
import { imageDataToPixelMatrix, PixelMatrix } from "./image-processing";
import { gaussianMapData } from "./make-gaussian-matrix";


const averageByWeight = (coreValue: number, secondaryValue: number, weight: number) => {
  const weightedValue = coreValue + (weight * (secondaryValue - coreValue));
  return weight !== 1 ? weightedValue : secondaryValue;
}


const neighboursAtDistance = (pixelMatrix: PixelMatrix, xIndex: number, yIndex: number, channelIndex: number, distance = 1, gaussianMatrix: null | number[][] = null) => {
  const size = (distance * 2) + 1;
  const coreValue = pixelMatrix[yIndex][xIndex][channelIndex];
  const initialX = xIndex - distance;
  const initialY = yIndex - distance;
  const firstRow = pixelMatrix[initialY];
  const lastRow = pixelMatrix[initialY + (distance * 2)];
  const values: number[] = [];
  // console.log('start')
  // console.log('row first 0')
  for (let column = 0; column < size; column++) {
    if (firstRow && firstRow[initialX + column]) {
      const weight = gaussianMatrix ? gaussianMatrix[0][column] : 1;
      // console.log("🚀 ~ neighboursAtDistance ~ weight:", weight, 0, column)
      const weightedValue = averageByWeight(coreValue, firstRow[initialX + column][channelIndex], weight);
      // console.log("🚀 ~ neighboursAtDistance ~ core, secondary, weightedValue:", coreValue, firstRow[initialX + column][channelIndex], weightedValue)
      values.push(weightedValue);
    }
  }

  for (let row = 1; row < size - 1; row++) {
    const currentRow = pixelMatrix[initialY + row];
    // console.log("row", row)
    if (currentRow) {
      if (currentRow[initialX]) {
        const weight = gaussianMatrix ? gaussianMatrix[row][0] : 1;
        // console.log("🚀 ~ neighboursAtDistance ~ weight:", weight, row, 0)
        values.push(averageByWeight(coreValue, currentRow[initialX][channelIndex], weight));
      }
      if (currentRow[initialX + (distance * 2)]) {
        const weight = gaussianMatrix ? gaussianMatrix[row][size - 1] : 1;
        // console.log("🚀 ~ neighboursAtDistance ~ weight:", weight, row, size - 1)
        values.push(averageByWeight(coreValue, currentRow[initialX + (size - 1)][channelIndex], weight));
      }
    }
  }

  // console.log('row last', size - 1)
  for (let column = 0; column < size; column++) {
    if (lastRow && lastRow[initialX + column]) {
      const weight = gaussianMatrix ? gaussianMatrix[size - 1][column] : 1;
      // console.log("🚀 ~ neighboursAtDistance ~ weight:", weight, size - 1, column)
      values.push(averageByWeight(coreValue, lastRow[initialX + column][channelIndex], weight));
    } else {
      // console.log('no last row')
    }
  }
  // console.log('end')
  return values;
}


export const averageNeighbourByChannel = (pixelMatrix: PixelMatrix, yIndex: number, xIndex: number, channelIndex: number, {
  blurRadius = 1,
  gaussianMatrix = null,
}: {
    blurRadius?: number;
    gaussianMatrix?: null | number[][];
}) => {
  let neighbours: number[] = [];

  for (let distanceFromPixel = 1; distanceFromPixel <= blurRadius; distanceFromPixel++) {
    // console.log("🚀 ~ distanceFromPixel/weight:", distanceFromPixel)
    neighbours = neighbours.concat(neighboursAtDistance(pixelMatrix, xIndex, yIndex, channelIndex, distanceFromPixel, gaussianMatrix))
  }

  neighbours.push(pixelMatrix[yIndex][xIndex][channelIndex]);

  const sum = neighbours.reduce((accumulator, value) => accumulator + value, 0);

  return Math.round(sum / neighbours.length);
}


export const gaussianBlur = (imageData: RawImageData<Buffer>, blurRadius = 1) => {
  const { width, height } = imageData;
  const pixelMatrix = imageDataToPixelMatrix(imageData);
  const buffer = new ArrayBuffer(
    4 * width * height
  );
  const newUint8CData = new Uint8ClampedArray(buffer);
  const blurDiameter = (blurRadius * 2) + 1;
  const gaussianMatrix = gaussianMapData(blurDiameter, blurDiameter, 1)
  // console.log("🚀 ~ gaussianBlur ~ gaussianMatrix:", gaussianMatrix)

  for (let yIndex = 0; yIndex < height; yIndex++) {
    for (let xIndex = 0; xIndex < width; xIndex++) {
      const arrayOffset = (yIndex * (width * 4)) + (xIndex * 4);

      newUint8CData[arrayOffset + 0] = averageNeighbourByChannel(pixelMatrix, yIndex, xIndex, 0, { blurRadius, gaussianMatrix  });
      newUint8CData[arrayOffset + 1] = averageNeighbourByChannel(pixelMatrix, yIndex, xIndex, 1, { blurRadius, gaussianMatrix });
      newUint8CData[arrayOffset + 2] = newUint8CData[arrayOffset + 3] = averageNeighbourByChannel(pixelMatrix, yIndex, xIndex, 2, { blurRadius, gaussianMatrix });
      newUint8CData[arrayOffset + 3] = 255;
    }
  }

  return newUint8CData;
}