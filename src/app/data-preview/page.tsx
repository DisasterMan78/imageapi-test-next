"use client";
import {
  ChangeEvent,
  ReactElement,
  useState,
} from 'react';

import homeStyles from '../page.module.css';
import styles from '../id/[image]/page.module.css';
import CanvasImage  from '../components/canvas-image';


export type ImageOptions = {
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

const sampleData = `[
  223,  32,  64, 255, 234,  85,  43, 255, 255, 127,   0, 255,
  170,  21, 127, 255, 198,  56,  85, 255, 234,  85,  43, 255,
  128,   0, 191, 255, 170,  21, 127, 255, 223,  32,  64, 255
]`;

export const editorDefaults = {
  width: imageWidth,
  height: imageHeight,
  imageData: sampleData.replace(/\n/g, ''),
};

const ImageDataPreviewer = () => {
  let itemStorage = null;

  const storageId = 'imageData-preview';
  if (typeof window !== 'undefined') {

    itemStorage = JSON.parse(localStorage.getItem(storageId) as string);

    if (itemStorage == null) {
      localStorage.setItem(storageId, JSON.stringify(editorDefaults));
      itemStorage = editorDefaults;
    }
  }
  const editorInitialValues: ImageOptions = itemStorage;
  const [previewValues, setPreviewValues] = useState<ImageOptions>({
    height: editorInitialValues.height,
    width: editorInitialValues.width,
    imageData: editorInitialValues.imageData
  });
  const [previewImage, setPreviewImage] = useState<null | ReactElement<HTMLCanvasElement>>(null);

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
    if (typeof window !== 'undefined') {
      const itemStorage = JSON.parse(localStorage.getItem(storageId) as string);

      itemStorage[inputName as string] = value;
      localStorage.setItem(storageId, JSON.stringify(itemStorage));
    }
  };

  const onPixeldataChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.currentTarget.value;

    setPreviewValues({
      height: previewValues.height,
      width: previewValues.width,
      imageData: value,
    });

    if (typeof window !== 'undefined') {
      const itemStorage = JSON.parse(localStorage.getItem(storageId) as string);

      itemStorage['imageData'] = value.replace("\n", '');
      localStorage.setItem(storageId, JSON.stringify(itemStorage));
    }
  }

  const createImagePreview = () => {
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

  return (
    <div className={homeStyles.page}>
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
                  <label htmlFor="edit-height">RGBA pixel data array:</label>
                <textarea
                    rows={10}
                    cols={100}
                    id="edit-pixeldata"
                    data-name="pixeldata"
                    onChange={(e) => onPixeldataChange(e)}
                    value={previewValues.imageData}
                />
              </div>
              <div>
                Sample data:
                <code><pre>{sampleData}</pre></code>
                </div>
              </div>
            </div>
            <div className={styles.experimental}>
              {previewImage && (
                <div className={styles.gaussianMap}>{previewImage}</div>
              )}
            </div>
            <div>
              <button onClick={() => createImagePreview()}>Generate preview image</button>
            </div>
          </div>
      </main>
    </div>
  );
};

export default ImageDataPreviewer;
