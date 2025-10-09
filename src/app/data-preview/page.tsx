'use client';
import {
  ChangeEvent,
  ReactElement,
  useEffect,
  useState,
} from 'react';

import homeStyles from '@/app/page.module.css';
import styles from '@/app/id/[image]/page.module.css';
import CanvasImage  from '@/app/components/canvas-image';
import LoadingSpinner from '../components/loading-spinner';


type DataPreviewOptions = {
  width: number;
  height: number;
  imageData: string;
};

export type LocalStorageImages = {
  [key: string]: string;
};

const thumbnailWidth = 300;
const thumbnailHeight = 200;
const imageSizeFactor = 2.5;
const imageWidth = thumbnailWidth * imageSizeFactor;
const imageHeight = thumbnailHeight * imageSizeFactor;

const sampleData = [
  223,  32,  64, 255,
  234,  85,  43, 255,
  255, 127,   0, 255,
  170,  21, 127, 255,
  198,  56,  85, 255,
  234,  85,  43, 255,
  128,   0, 191, 255,
  170,  21, 127, 255,
  223,  32,  64, 255
];

export const editorDefaults = {
  width: imageWidth,
  height: imageHeight,
  imageData: JSON.stringify(sampleData),
};

const formatImageData = (imageDataString: string) => {
  let formattedData = imageDataString.replace(/(([^,]*,){4})/g, '$1\n');
  formattedData = formattedData.replace(/(\d{3})(?=[\D])/g, ' $1')
  formattedData = formattedData.replace(/([\D])(\d{2})(?=[\D])/g, '$1  $2')
  formattedData = formattedData.replace(/([\D])(\d)(?=[\D])/g, '$1   $2')
  formattedData = formattedData.replace(/\[/g, '[\n')
  formattedData = formattedData.replace(/]/g, '\n]')
  return formattedData;
}

const ImageDataPreviewer = () => {
  let itemStorage: DataPreviewOptions = editorDefaults;

  const storageId = 'imageData-preview';
  useEffect(() => {
    if (localStorage.getItem(storageId)) {
      itemStorage = JSON.parse(localStorage.getItem(storageId) as string);
    } else {
      itemStorage = editorDefaults;
      localStorage.setItem(storageId, JSON.stringify(editorDefaults));
    }
  }, []);

  console.log('itemStorage', itemStorage)
  const [previewValues, setPreviewValues] = useState<DataPreviewOptions>(itemStorage);
  const [previewImage, setPreviewImage] = useState<null | ReactElement<HTMLCanvasElement>>(null);
  const [previewButtonIsDisabled, setPreviewButtonIsDisabled] = useState<boolean>(false);

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputName = e.currentTarget.getAttribute('data-name');
    const value = parseInt(e.currentTarget.value);
    switch (inputName) {
      case 'height':
        setPreviewValues({
          height: value as number,
          width: previewValues.width,
          imageData: previewValues.imageData
        });

        break;
      case 'width':
        setPreviewValues({
          height: previewValues.height,
          width: value as number,
          imageData: previewValues.imageData
        });

        break;

      default:
        break;
    }

    const itemStorage = JSON.parse(localStorage.getItem(storageId) as string);

    itemStorage[inputName as string] = value;
    localStorage.setItem(storageId, JSON.stringify(itemStorage));
  };

  const onPixeldataChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.currentTarget.value;
    const sanitisedValue = sanitisePixelDataString(value);

    setPreviewButtonIsDisabled(isPreviewDisabled(sanitisedValue));
    setPreviewValues({
      height: previewValues.height,
      width: previewValues.width,
      imageData: sanitisedValue,
    });

    const itemStorage = JSON.parse(localStorage.getItem(storageId) as string);

    itemStorage.imageData = sanitisedValue.replace("\n", '');
    localStorage.setItem(storageId, JSON.stringify(itemStorage));
  }

  // TODO: Remove non numeric values
  // TODO: Flag unparseable array
  const sanitisePixelDataString = (data: string): string => data.replace(/,[\s\n]*]?$/, ']');

  const createImagePreview = (previewValues: DataPreviewOptions) => {
    console.log("🚀 ~ createImagePreview ~ previewValues:", previewValues)
    const imageDataArray = new Uint8ClampedArray(JSON.parse(previewValues.imageData));
    console.log("🚀 ~ createImagePreview ~ imageDataArray:", imageDataArray)

    const newCanvasImage = (
      <CanvasImage
        imageData={
          new ImageData(imageDataArray, previewValues.width, previewValues.height)
        }
        width={previewValues.width}
        height={previewValues.height}
      />
    );
    console.log("🚀 ~ createImagePreview ~ newCanvasImage:", newCanvasImage)
    setPreviewImage(newCanvasImage);
  }

  const isPreviewDisabled = (previewData: string): boolean => {
    // TODO: Disable if data length isn't divisible into width*4
    console.log('previewData: ', previewData)
    return JSON.parse(previewData).length % 4 != 0
  }

  return (
    <div className={homeStyles.page}>
      {itemStorage ? (
        <main className={homeStyles.main}>
          <h1 role="heading" aria-level={1}>
            Preview image data
          </h1>
          <div className={styles.editImage} data-testid="edit-image">
            <div className={styles.editorUI}>
              <div className={styles.editOptions} data-testid="edit-options">
                <div className={styles.editControl}>
                  <label htmlFor="edit-width">Width:</label>
                  <input
                    autoFocus
                    type="number"
                    pattern="[0-9]*"
                    min={1}
                    id="edit-width"
                    data-name="width"
                    value={previewValues.width}
                    onChange={(e) => onInputChange(e)}
                  />
                </div>
                {
                  // TODO: Remove height input - we'll work it out from the data
                }
                <div className={styles.editControl}>
                  <label htmlFor="edit-height">Height:</label>
                  <input
                    type="number"
                    pattern="[0-9]*"
                    min={1}
                    id="edit-height"
                    data-name="height"
                    value={previewValues.height}
                    onChange={(e) => onInputChange(e)}
                  />
                </div>
                <div className={styles.editControl}>
                  <label htmlFor="edit-height">RGBA pixel data array:</label><br />
                  <textarea
                    rows={11}
                    cols={21}
                    id="edit-pixeldata"
                    data-name="pixeldata"
                    onChange={(e) => onPixeldataChange(e)}
                    defaultValue={formatImageData(JSON.stringify(previewValues.imageData).replace(/"/g, ''))}
                  />
                </div>
                <div>
                  Sample data:<br />
                  <code>
                    <pre>
                      &nbsp; R &nbsp;&nbsp; G &nbsp;&nbsp; B &nbsp;&nbsp; A<br />
                      {formatImageData(JSON.stringify(sampleData))}
                    </pre>
                  </code>
                </div>
              </div>
            </div>
            <div className={styles.experimental}>
              {previewImage && (
                <div className={styles.gaussianMap}>{previewImage}</div>
              )}
            </div>
            <div>
              <button
                onClick={() => createImagePreview(previewValues)}
                disabled={previewButtonIsDisabled}
                title={JSON.parse(previewValues.imageData).length % 4 === 0 ? "Generate preview image" : "Data length must be divisible by 4 (RGBA)"}
              >
                Generate preview image
              </button>
            </div>
          </div>
        </main>
      ) : (
          LoadingSpinner()
      )}
    </div>
  );
};

export default ImageDataPreviewer;
