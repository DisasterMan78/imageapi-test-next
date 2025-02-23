import { RawImageData } from "jpeg-js";
import { gaussianMapData } from "./make-gaussian-matrix";

// https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html#tail-recursion-elimination-on-conditional-types
type Enumerate<N extends number, Acc extends number[] = []> = Acc['length'] extends N
  ? Acc[number]
  : Enumerate<N, [...Acc, Acc['length']]>

type IntRange<F extends number, T extends number> = Exclude<Enumerate<T>, Enumerate<F>>

type HexValueInDecimal = IntRange<0, 255>;

export type RGBAArray = [HexValueInDecimal, HexValueInDecimal, HexValueInDecimal, HexValueInDecimal];


export const getImageDataBuffer = async (imageData: Blob) => new Uint8Array(await imageData.arrayBuffer());


export const checkImageDataIsJPEG = (imageData: Uint8Array) => {
  // JPGs have a file signature of [0xFF, 0xD8,..., 0xFF, 0xD9] - i.e. the first two
  // elements of the image data array are (in decimal) 255 and 216
  // and the last two are 255 and 217
  const firstTwoBits = imageData.slice(0, 2);
  const lastTwoBits = imageData.slice(imageData.length - 2, imageData.length)

  if (
    (firstTwoBits[0] !== 255 || firstTwoBits[1] !== 216)
    ||
    (lastTwoBits[0] !== 255 || lastTwoBits[1] !== 217)
  ) {
    return false;
  }
  return true;
}


/*
This is a unused function from when I was trying to read and write a JPEG
*/
export const locateSOSinImage = (imageData: Uint8Array) => {
  // The Start of Scan segment of a JPEG is marked with
  // a byte pair of [FF, DA], or [255, 218] in decimal
  // It seems to be the same in a PNG, but I haven't found confirmation
  // Not sure about other image formats, but I'm not dealing with them yet
  // and possibly never will!
  let SOSIndex = 0;
  const pairBuffer = [0, 0];
  imageData.forEach((byte, index) => {
    if (index % 2 === 0) {
      pairBuffer[0] = byte;
    } else {
      pairBuffer[1] = byte;
      if (pairBuffer[0] === 255 && pairBuffer[1] === 218) {
        SOSIndex = index + 1;
        return;
      }
    }
  })
  return SOSIndex;
}


export const convertToGrayscale = (rgba: RGBAArray) => {
  const grayScale = Math.round((rgba[0] * 0.299) + (rgba[1] * 0.587) + (rgba[2] * 0.114));

  return [grayScale, grayScale, grayScale, rgba[3]];
}


export const convertImageDataToGrayscale = (rawImageData: RawImageData<Buffer>) => {
  const pixelData = rawImageData.data;
  const buffer = new ArrayBuffer(
    4 * rawImageData.width * rawImageData.height
  );
  const newUint8CData = new Uint8ClampedArray(buffer);

  for (let index = 0; index < pixelData.length; index = index + 4) {
    const RBGA = [
      pixelData[index],
      pixelData[index + 1],
      pixelData[index + 2],
      pixelData[index + 3],
    ];

    const processedPixel = convertToGrayscale(RBGA as RGBAArray);

    newUint8CData[index] = processedPixel[0];
    newUint8CData[index + 1] = processedPixel[1];
    newUint8CData[index + 2] = processedPixel[2];
    newUint8CData[index + 3] = processedPixel[3];
  }

  return newUint8CData;
}


export const invertPixelColour = (rgba: RGBAArray) => [255 - rgba[0], 255 - rgba[1], 255 - rgba[2], rgba[3]];


export const invertImageData = (rawImageData: RawImageData<Buffer>) => {
  const pixelData = rawImageData.data;
  const buffer = new ArrayBuffer(
    4 * rawImageData.width * rawImageData.height
  );
  const newUint8CData = new Uint8ClampedArray(buffer);

  for (let index = 0; index < pixelData.length; index = index + 4) {
    const RBGA = [
      pixelData[index],
      pixelData[index + 1],
      pixelData[index + 2],
      pixelData[index + 3],
    ];

    const processedPixel = invertPixelColour(RBGA as RGBAArray);

    newUint8CData[index] = processedPixel[0];
    newUint8CData[index + 1] = processedPixel[1];
    newUint8CData[index + 2] = processedPixel[2];
    newUint8CData[index + 3] = processedPixel[3];
  }

  return newUint8CData;
}


type PixelMatrixRow = RGBAArray[]
export type PixelMatrix = PixelMatrixRow[]

export const imageDataToPixelMatrix = (imageData: RawImageData<Buffer>) => {
  const { width, height, data } = imageData;
  const matrix: PixelMatrix = [];

  // Rows
  for (let yIndex = 0; yIndex < height; yIndex++) {
    const row: PixelMatrixRow = [];
    // Columns
    for (let xIndex = 0; xIndex < width; xIndex++) {
      const arrayOffset = (yIndex * (width * 4))  + (xIndex * 4);
      row[(xIndex)] = [
        data[arrayOffset + 0] as HexValueInDecimal,
        data[arrayOffset + 1] as HexValueInDecimal,
        data[arrayOffset + 2] as HexValueInDecimal,
        data[arrayOffset + 3] as HexValueInDecimal,
      ];
    }
    matrix[yIndex] = row;
  }
  return matrix;
}


export const imageDataToDecimalArry = (data: Buffer<ArrayBufferLike>) => {
  // This seems a bit daft, but JS auto-typecasts the hex to decimal
  // You'd think data.map(datum => parseInt(`${datum}`), 16)
  // would work, but that returns the original buffer
  const array: number[] = [];
  data.forEach(datum => array.push(datum))
  return array;
}


export const gaussianMapImageData = (width: number, height: number) => {
  // One element per channel, RGBA
  const buffer = new ArrayBuffer(4 * width * height);
  const newUint8CData = new Uint8ClampedArray(buffer);
  const gaussianData = gaussianMapData(width, height);

  for (let yIndex = 0; yIndex < height; yIndex++) {
    for (let xIndex = 0; xIndex < width; xIndex++) {
      const arrayOffset = (yIndex * (width * 4))  + (xIndex * 4);
      const gValue = gaussianData[yIndex][xIndex]
      newUint8CData[arrayOffset + 0] = gValue; //R
      newUint8CData[arrayOffset + 1] = gValue; //G
      newUint8CData[arrayOffset + 2] = gValue; //B
      newUint8CData[arrayOffset + 3] = 255;    //A
    }
  }
  return newUint8CData;
}
