import { binaryToString } from "@/app/utils/binary-to-string"
import { stringToBinaryArray } from '../../src/app/utils/string-to-binary';
import FetchImageOnClient from "@/app/utils/fetch-image"
import { testTinyJPGURL } from "../mocks/msw.mock"
import { convertImageDataToBinaryString } from "@/app/utils/stego"


const testString = 'this iz top secrit! do not reveeel.'
const expectedBinaryArray = [
  "01110100", "01101000", "01101001", "01110011", "00100000", "01101001", "01111010", "00100000",
  "01110100", "01101111", "01110000", "00100000", "01110011", "01100101", "01100011", "01110010",
  "01101001", "01110100", "00100001", "00100000", "01100100", "01101111", "00100000", "01101110",
  "01101111", "01110100", "00100000", "01110010", "01100101", "01110110", "01100101", "01100101",
  "01100101", "01101100", "00101110"
]


describe('Steganography helpers', () => {
  it('encodes a string as an array of binary values', () => {
    const binaryArray = stringToBinaryArray(testString)

    expect(binaryArray).toEqual(expectedBinaryArray)
  })

  it('decodes an array of binary values back to the original string', () => {
    const decodedString = binaryToString(expectedBinaryArray)

    expect(decodedString).toEqual(testString)
  })

  it('reads the image data from a file, then converts it to binary string array', async () => {
    const expectedImageBinaryArray = [
  '00110010', '00110101', '00110100', '00101100', '00110000', '00101100', '00110000',
  '00101100', '00110010', '00110101', '00110101', '00101100', '00110010', '00110101',
  '00110100', '00101100', '00110001', '00110010', '00110111', '00101100', '00110000',
  '00101100', '00110010', '00110101', '00110101', '00101100', '00110010', '00110101',
  '00110100', '00101100', '00110010', '00110101', '00110101', '00101100', '00110000',
  '00101100', '00110010', '00110101', '00110101', '00101100', '00110001', '00110010',
  '00110111', '00101100', '00110000', '00101100', '00110010', '00110101', '00110100',
  '00101100', '00110010', '00110101', '00110101', '00101100', '00110010', '00110101',
  '00110100', '00101100', '00110000', '00101100', '00110000', '00101100', '00110010',
  '00110101', '00110101', '00101100', '00110010', '00110101', '00110100', '00101100',
  '00110001', '00110010', '00110111', '00101100', '00110000', '00101100', '00110010',
  '00110101', '00110101', '00101100', '00110000', '00101100', '00110000', '00101100',
  '00110010', '00110101', '00110100', '00101100', '00110010', '00110101', '00110101',
  '00101100', '00110001', '00110010', '00110111', '00101100', '00110000', '00101100',
  '00110010', '00110101', '00110100', '00101100', '00110010', '00110101', '00110101',
  '00101100', '00110010', '00110101', '00110100', '00101100', '00110000', '00101100',
  '00110000', '00101100', '00110010', '00110101', '00110101'
]
    // Get image data
    const testImageData = await FetchImageOnClient(testTinyJPGURL) as Blob
    const dataString = await convertImageDataToBinaryString(testImageData)

    expect(dataString).toEqual(expectedImageBinaryArray)
  })
})