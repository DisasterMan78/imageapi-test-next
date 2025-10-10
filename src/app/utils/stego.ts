import { decode } from "jpeg-js";
import { getImageDataBuffer } from "./image-processing";
import { stringToBinaryArray } from "./string-to-binary";

export const convertImageDataToBinaryString = async (imageData: Blob): Promise<string[]> => {
  const imageDataArray = await getImageDataBuffer(imageData)
  const rawImageData = decode(imageDataArray)
  const data = new Uint8ClampedArray(rawImageData.data);
  const dataString = data.join(',');
  const binaryString = stringToBinaryArray(dataString);

  return binaryString;
}

