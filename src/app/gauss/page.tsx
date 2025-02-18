"use client";
import {
  ChangeEvent,
  ReactElement,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useParams } from 'next/navigation';

import homeStyles from '../page.module.css';
import styles from '../id/[image]/page.module.css';

import {
  gaussianMapImageData,
} from '@/app/utils/image-processing';

type EditedSize = {
  width: number;
  height: number;
};

export type ImageOptions = {
  width: number;
  height: number;
  grayscale: boolean;
  blur: number;
};

export type LocalStorageImages = {
  [key: string]: string;
};

const thumbnailWidth = 300;
const thumbnailHeight = 200;
const imageSizeFactor = 2.5;
const imageWidth = thumbnailWidth * imageSizeFactor;
const imageHeight = thumbnailHeight * imageSizeFactor;

export const editorDefaults = {
  width: imageWidth,
  height: imageHeight,
};

type CanvasProps = {
  imagedata: ImageData;
  width: number;
  height: number;
};

const CanvasImage = (props: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      canvas.width = props.width;
      canvas.height = props.height;
      context?.putImageData(props.imagedata, 0, 0);
    }
  });
  return <canvas ref={canvasRef} {...props} />;
};

const ImageEditor = () => {
  let itemStorage = null;

  if (typeof window !== 'undefined') {
    const storageId = `gauss`;

    itemStorage = JSON.parse(localStorage.getItem(storageId) as string);

    if (itemStorage == null) {
      localStorage.setItem(storageId, JSON.stringify(editorDefaults));
      itemStorage = editorDefaults;
    }
  }
  const editorInitialValues: ImageOptions = itemStorage;
  const [editedSize, setEditedSize] = useState<EditedSize>({
    height: editorInitialValues.height,
    width: editorInitialValues.width,
  });
  const [gaussianMapImage, setGaussianMapImage] = useState<null | ReactElement<HTMLCanvasElement>>(null);

  useEffect(() => {
    const gaussianMapData = gaussianMapImageData(editedSize.width, editedSize.height)
    const newCanvasImage = (
      <CanvasImage
        imagedata={
          new ImageData(gaussianMapData, editedSize.width, editedSize.height)
        }
        width={editedSize.width}
        height={editedSize.height}
      />
    );
    setGaussianMapImage(newCanvasImage);
  }, [editedSize])

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputName = e.currentTarget.getAttribute('data-name');
    const value =
      inputName === 'grayscale'
        ? e.currentTarget.checked
        : parseInt(e.currentTarget.value);
    switch (inputName) {
      case 'height':
        setEditedSize({
          height: value as number,
          width: editedSize.width,
        });

        break;
      case 'width':
        setEditedSize({
          height: editedSize.height,
          width: value as number,
        });

        break;

      default:
        break;
    }
    if (typeof window !== 'undefined') {
      const itemStorage = JSON.parse(localStorage.getItem('gauss') as string);

      itemStorage[inputName as string] = value;
      localStorage.setItem('gauss', JSON.stringify(itemStorage));
    }
  };

  return (
    <div className={homeStyles.page}>
      <main className={homeStyles.main}>
        <h1 role="heading" aria-level={1}>
          Gaussian Blur - image map generator
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
                    value={editedSize.width}
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
                    value={editedSize.height}
                    onChange={(e) => onInputChange(e)}
                  />
                </div>
              </div>
            </div>
            <div className={styles.experimental}>
              {gaussianMapImage && (
                <div className={styles.gaussianMap}>{gaussianMapImage}</div>
              )}
            </div>
          </div>
      </main>
    </div>
  );
};

export default ImageEditor;
