import { binaryToString } from "@/app/utils/binary-to-string"
import { stringToBinaryArray } from '../../src/app/utils/string-to-binary'
import { testMedJPGURL, testTinyJPGURL } from "../mocks/msw.mock"
import { convertImageDataToBinaryString, encryptStringInImageAlpha, extractBinaryDataFromImageAlpha, decryptAlphaChannel, encryptStringInImageRGB, unencryptedImageDataWithKeys, decryptRGBChannelsWithKey, validateRGBEncodedDataAgainstKey, extractBinaryDataFromImageRGBWithKey } from "@/app/utils/stego"
import { fetchAndDecodeToImageData } from "@/app/utils/image-processing"
import { RawImageData } from "jpeg-js"
import alphaStegoMedJPGData from "./alphaStegoMedJPGData"
import RGBStegoMedJPGData from "./RGBStegoMedJPGData"


const testString = 'this iz top secrit! do not reveeel.'
const expectedBinaryArray = [
  "01110100", "01101000", "01101001", "01110011", "00100000", "01101001", "01111010", "00100000",
  "01110100", "01101111", "01110000", "00100000", "01110011", "01100101", "01100011", "01110010",
  "01101001", "01110100", "00100001", "00100000", "01100100", "01101111", "00100000", "01101110",
  "01101111", "01110100", "00100000", "01110010", "01100101", "01110110", "01100101", "01100101",
  "01100101", "01101100", "00101110"
]

const secretMsgInBinary = [ '01110011', '01100101', '01100011', '01110010', '01100101', '01110100', '00100000', '01101101', '01110011', '01100111','00100001']


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
    const testImageData = await fetchAndDecodeToImageData(testTinyJPGURL) as RawImageData<Buffer>

    const dataString = await convertImageDataToBinaryString(testImageData)

    expect(dataString).toEqual(expectedImageBinaryArray)
  })

  it('encrypts a string in an image\'s alpha channel', async () => {
    const secretString = 'secret msg!';
    const rawImageData = await fetchAndDecodeToImageData(testMedJPGURL) as RawImageData<Buffer>
    const encryptedImageData = encryptStringInImageAlpha(rawImageData, secretString)

    expect(JSON.stringify(encryptedImageData)).toEqual(JSON.stringify(alphaStegoMedJPGData))
  })

  it('extracts binary values from an image alpha channel', () => {
    const binaryValues = extractBinaryDataFromImageAlpha(alphaStegoMedJPGData)

    expect(binaryValues).toEqual(secretMsgInBinary)
  })

  it('decrypts a string encoded in an image alpha channel', () => {
    const decryptedString = decryptAlphaChannel(alphaStegoMedJPGData)

    expect(decryptedString).toEqual('secret msg!')
  })

  it('encrypts a string in an image\'s RGB channels', async () => {
    const secretString = 'secret msg!';
    const rawImageData = await fetchAndDecodeToImageData(testMedJPGURL) as RawImageData<Buffer>

    const encryptedImageData = encryptStringInImageRGB(rawImageData, secretString)

    expect(validateRGBEncodedDataAgainstKey(encryptedImageData, RGBStegoMedJPGData)).toBeTruthy()
  })

  it('extracts binary data from an image using a key', async () => {
    const secretString = 'secret msg!';
    const rawImageData = await fetchAndDecodeToImageData(testMedJPGURL) as RawImageData<Buffer>
    const encryptedImageData = encryptStringInImageRGB(rawImageData, secretString)
    const unencryptedImageData = unencryptedImageDataWithKeys(rawImageData)
    const binaryArray = extractBinaryDataFromImageRGBWithKey(encryptedImageData, unencryptedImageData)

    expect(binaryArray).toEqual(secretMsgInBinary)
  })

  it('decrypts a string encoded in an image RGB channels', async () => {
    const secretString = 'secret msg!';
    const rawImageData = await fetchAndDecodeToImageData(testMedJPGURL) as RawImageData<Buffer>

    const encryptedImageData = encryptStringInImageRGB(rawImageData, secretString)
    const unencryptedImageData = unencryptedImageDataWithKeys(rawImageData)
    const decryptedString = decryptRGBChannelsWithKey(encryptedImageData, unencryptedImageData)

    expect(decryptedString).toEqual('secret msg!')
  })
})
