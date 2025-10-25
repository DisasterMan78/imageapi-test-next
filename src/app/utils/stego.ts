import { RawImageData } from "jpeg-js";
import { stringToBinaryArray } from "./string-to-binary";
import { binaryToString } from '@/app/utils/binary-to-string';

export const convertImageDataToBinaryString = async (rawImageData: RawImageData<Buffer>): Promise<string[]> => {
  const data = new Uint8ClampedArray(rawImageData.data);
  const dataString = data.join(',');
  const binaryString = stringToBinaryArray(dataString);

  return binaryString;
}

export const unencryptedImageDataWithKeys = (rawImageData: RawImageData<Buffer>): Uint8ClampedArray<ArrayBuffer> => {
  const pixelData = rawImageData.data;
  const unencryptedImageData = new Uint8ClampedArray(pixelData);

  for (let index = 0; index < pixelData.length; index++) {
    unencryptedImageData[index] = pixelData[index]
  }

  return unencryptedImageData;
}

export const encryptStringInImageAlpha = (rawImageData: RawImageData<Buffer>, messageString: string): Uint8ClampedArray<ArrayBuffer> => {
  const pixelData = rawImageData.data;
  const encryptedImageData = new Uint8ClampedArray(pixelData);

  const binaryString = stringToBinaryArray(messageString).join('');

  for (let index = 0; index < pixelData.length; index = index + 4) {
    const binaryIndex = Math.floor((index + 3) / 4);

    encryptedImageData[index + 3] = binaryIndex < binaryString.length ?
      binaryString[binaryIndex] === '0' ?
        253 : 254
      : 255;
  }

  return encryptedImageData;
}

export const encryptStringInImageRGB = (rawImageData: RawImageData<Buffer>, messageString: string): Uint8ClampedArray<ArrayBuffer> => {
  const pixelData = rawImageData.data;
  const encryptedImageData = new Uint8ClampedArray(pixelData);

  const binaryString = stringToBinaryArray(messageString).join('');

  const shiftChannelValue = (value: number) => {
    const shift = () => Math.random() < 0.5 ? -1 : 1;

    return value < 255
      ? value > 0
        ? value + shift()
        : 1
      : 254;
  }

  let binaryIndex = 0;

  for (let index = 0; index < pixelData.length; index = index + 4) {

    encryptedImageData[index] = binaryIndex < binaryString.length ?
      binaryString[binaryIndex++] === '0' ?
        pixelData[index] : shiftChannelValue(pixelData[index])
      : pixelData[index];

    encryptedImageData[index + 1] = binaryIndex < binaryString.length ?
      binaryString[binaryIndex++] === '0' ?
        pixelData[index + 1] : shiftChannelValue(pixelData[index + 1])
      : pixelData[index + 1];

    encryptedImageData[index + 2] = binaryIndex < binaryString.length ?
      binaryString[binaryIndex++] === '0' ?
        pixelData[index + 2] : shiftChannelValue(pixelData[index + 2])
      : pixelData[index + 2];
  }

  return encryptedImageData;
}

export const extractBinaryDataFromImageAlpha = (pixelData: {[key: number]: number}) => {
  const hiddenAlphaToBinaryDigit = (data: number) => data === 253 ? 0 : 1;
  const pixelArray = Object.values(pixelData);
  const alphaData = [];
  const binaryArray = [];

  for (let i = 3; i < pixelArray.length; i = i + 4) {
    alphaData.push(pixelArray[i]);
  }

  for (let i = 0; i < alphaData.length; i = i + 8) {
    const binaryByte = `${hiddenAlphaToBinaryDigit(alphaData[i])}${hiddenAlphaToBinaryDigit(alphaData[i + 1])}${hiddenAlphaToBinaryDigit(alphaData[i + 2])}${hiddenAlphaToBinaryDigit(alphaData[i + 3])}${hiddenAlphaToBinaryDigit(alphaData[i + 4])}${hiddenAlphaToBinaryDigit(alphaData[i + 5])}${hiddenAlphaToBinaryDigit(alphaData[i + 6])}${hiddenAlphaToBinaryDigit(alphaData[i + 7])}`;

    if(binaryByte !== '11111111') {
      binaryArray.push(binaryByte);
    }
  }
  return binaryArray;
}

export const decryptAlphaChannel = (pixelData: { [key: number]: number }): string => binaryToString(extractBinaryDataFromImageAlpha(pixelData));



export const extractBinaryDataFromImageRGBWithKey = (encryptedImageData: {[key: number]: number}, keyImageData: {[key: number]: number}) => {
  const valueToBinaryDigit = (data: number, reference: number) => data === reference ? 0 : 1;
  const RGBData = [];
  const binaryByteArray: string[] = [];

  for (let i = 0; i < Object.values(encryptedImageData).length; i = i + 4) {
    RGBData.push(valueToBinaryDigit(encryptedImageData[i], keyImageData[i]));
    RGBData.push(valueToBinaryDigit(encryptedImageData[i + 1], keyImageData[i + 1]));
    RGBData.push(valueToBinaryDigit(encryptedImageData[i + 2], keyImageData[i + 2]))
  }

  for (let i = 0; i < RGBData.length; i = i + 8) {
    const binaryByte = `${RGBData[i]}${RGBData[i + 1]}${RGBData[i + 2]}${RGBData[i + 3]}${RGBData[i + 4]}${RGBData[i + 5]}${RGBData[i + 6]}${RGBData[i + 7]}`;
    console.log("🚀 ~ extractBinaryDataFromImageRGBWithKey ~ binaryByte:", binaryByte)

    if(binaryByte !== '00000000') {
      binaryByteArray.push(binaryByte);
    }
  }
  return binaryByteArray;
}

export const decryptRGBChannelsWithKey = (encryptedImageData: { [key: number]: number }, keyImageData: { [key: number]: number }): string => {
  const binaryArray = extractBinaryDataFromImageRGBWithKey(encryptedImageData, keyImageData);
  return binaryToString(binaryArray)
}

export const validateRGBEncodedDataAgainstKey = (encryptedImageData: { [key: number]: number }, keyImageData: { [key: number]: number }): boolean => {
  const isValid = Object.keys(Array).every((index) => {
    const testValue = encryptedImageData[index as unknown as number];
    const keyValue = keyImageData[index as unknown as number];

    return (testValue > keyValue + 1 || testValue < keyValue - 1) ? false :  true;
  })

  return isValid;
}
