// https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html#tail-recursion-elimination-on-conditional-types
type Enumerate<N extends number, Acc extends number[] = []> = Acc['length'] extends N
  ? Acc[number]
  : Enumerate<N, [...Acc, Acc['length']]>

type IntRange<F extends number, T extends number> = Exclude<Enumerate<T>, Enumerate<F>>

type hexValueInDecimal = IntRange<0, 255>;

export type rgbaArray = [hexValueInDecimal, hexValueInDecimal, hexValueInDecimal, hexValueInDecimal];


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
export const locateSOSinJPEG = (imageData: Uint8Array) => {
  // The Start of Scan segment of a JPEG is marked with
  // a byte pair of [FF, DA] or [255, 218] in decimal
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

export const convertToGrayscale = (rgba: rgbaArray) => {
  const grayScale = Math.round((rgba[0] * 0.299) + (rgba[1] * 0.587) + (rgba[2] * 0.114));

  return [grayScale, grayScale, grayScale, rgba[3]];
}


const invertHexValue = (hexValue: hexValueInDecimal) => 255 - hexValue;

export const invertPixelColour = (rgba: rgbaArray) => [invertHexValue(rgba[0]), invertHexValue(rgba[1]), invertHexValue(rgba[2]), rgba[3]]

export const getImageDataBuffer = async (imageData: Blob) => new Uint8Array(await imageData.arrayBuffer());
