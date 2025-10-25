'use client';
import {
  ChangeEvent,
  MouseEvent,
  ReactElement,
  useEffect,
  useState,
} from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Image from 'next/image';

import homeStyles from '@/app/page.module.css';
import styles from '@/app/id/[image]/page.module.css';


import FetchImageOnClient from '@/app/utils/fetch-image';
import FetchApiOnClient from '@/app/utils/fetch-api';

import LoadingSpinner from '@/app/components/loading-spinner';
import { PicsumImage } from '@/app/components/image-grid';
import {default as ErrorUI} from '@/app/error';
import { fetchAndDecodeToImageData, getImageDataBuffer } from '@/app/utils/image-processing';
import { decode, RawImageData } from 'jpeg-js';
import CanvasImage from '@/app/components/canvas-image';
import { encryptStringInImageAlpha } from '@/app/utils/stego';

type EditedSize = {
  width: number;
  height: number;
};

type ImageOptions = {
  width: number;
  height: number;
  grayscale: boolean;
  blurRadius: number;
  localBlur: number;
};



const thumbnailWidth = 300;
const thumbnailHeight = 200;
const imageSizeFactor = 2.5;
const imageWidth = thumbnailWidth * imageSizeFactor;
const imageHeight = thumbnailHeight * imageSizeFactor;

export const editorDefaults: ImageOptions = {
  width: imageWidth,
  height: imageHeight,
  grayscale: false,
  blurRadius: 0,
  localBlur: 1,
};


const getDownloadURL = (
  url: string,
  editedSize: EditedSize,
) =>
  url.replace(
    /\d*\/\d*$/,
    `${editedSize.width}/${editedSize.height}`
  );

const ImageEditor = () => {
  const params = useParams();
  let itemStorage = editorDefaults;

  if (typeof window !== 'undefined') {
    const storageId = `image-id-${params.image}`;

    itemStorage = JSON.parse(localStorage.getItem(storageId) as string);

    if (itemStorage == null) {
      localStorage.setItem(storageId, JSON.stringify(editorDefaults));
      // Removing this redundant line causes WallabyJS to shit the bed?
      itemStorage = editorDefaults;
    }
  }

  const [error, setError] = useState<null | Error>(null)
  const [image, setImage] = useState<PicsumImage>();
  const [dataIsLoading, setDataIsLoading] = useState(true);
  const [editedSize, setEditedSize] = useState<EditedSize>({
    height: itemStorage.height,
    width: itemStorage.width,
  });
  const [secretMessage, setSecretMessage] = useState<string>('');
  const [secretLength, setSecretLength] = useState<number>(0);
  const [encryptedImage, setEncryptedImage] =
      useState<null | ReactElement<HTMLCanvasElement>>(null);
    const [encryptionInProgress, setEncryptionInProgress] = useState(false);


  useEffect(() => {
    setDataIsLoading(true);
    FetchApiOnClient(`https://picsum.photos/id/${params.image}/info`)
      .catch(error => {
        setError(error as Error)
      })
      .then(response => {
        setImage(response);
        setDataIsLoading(false);
      });
  }, [params.image]);

  const Thumbnail = (imageData: PicsumImage) => {
    const thumbnailURL = (url: string) =>
      url.replace(
        /\d*\/\d*$/,
        `${thumbnailWidth}/${thumbnailHeight}`
      );

    return (
      <Image
        className={styles.imagePreview}
        width={thumbnailWidth}
        height={thumbnailHeight}
        src={thumbnailURL(imageData.download_url)}
        alt={'Edited image preview'}
      />
    );
  };

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputName = e.currentTarget.getAttribute('data-name');
    const value = parseInt(e.currentTarget.value);
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
      const storageId = `image-id-${e.currentTarget.getAttribute(
        'data-imageid'
      )}`;
      const itemStorage = JSON.parse(localStorage.getItem(storageId) as string);

      itemStorage[inputName as string] = value;
      localStorage.setItem(storageId, JSON.stringify(itemStorage));
    }
  };

  const onSecretInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    setSecretMessage(value);
    setSecretLength(value.length)
  };



  const onEncryptClick = async (e: MouseEvent<HTMLButtonElement>) => {
    console.log('onEncryptClick')
    setEncryptionInProgress(true);
    setEncryptedImage(null);
    const clickedButton = e.currentTarget;
    const url = clickedButton.getAttribute('data-image-url') as string;
    const secretMessage = clickedButton.getAttribute('data-secret-message') as string;

    const rawImageData = await fetchAndDecodeToImageData(url)
      .catch(error => {
        setError(error)
      }) as RawImageData<Buffer>;

    // let processedData: Uint8ClampedArray<ArrayBuffer> = new Uint8ClampedArray(new ArrayBuffer(
    //   4 * rawImageData.width * rawImageData.height
    // ));


    const processedData = encryptStringInImageAlpha(rawImageData, secretMessage);

    const newCanvasImage = (
      <CanvasImage
        imageData={
          new ImageData(processedData, rawImageData.width, rawImageData.height)
        }
        width={rawImageData.width}
        height={rawImageData.height}
      />
    );
    setEncryptedImage(newCanvasImage);
    setEncryptionInProgress(false);
  };


  if (error) {
    return (<ErrorUI error={error} reset={() => { }} />)
  }

  return (
    <div className={homeStyles.page}>
      <main className={homeStyles.main}>
        <h1 role="heading" aria-level={1}>
          Picsum API test - Edit Image
        </h1>
        {
          dataIsLoading === true ? (
            <div>
              <label id='loading-label' htmlFor='loading-indicator' role="alert" aria-live="assertive">
                Loading image
              </label>
              <div id='loading-indicator' className={homeStyles.loadingIndicator} role="progressbar" aria-labelledby='loading-label'>
                <LoadingSpinner />
              </div>
            </div>
          ) : (
            <div className={styles.editImage} data-testid="edit-image">
              <div className={styles.editorUI}>
                <div className={styles.editOptions} data-testid="edit-options">
                  <div className={styles.editControl}>
                    <label htmlFor="edit-width">Width:</label>
                    <input
                      autoFocus
                      type="text"
                      id="edit-width"
                      data-name="width"
                      data-imageid={image?.id}
                      value={editedSize.width}
                      onChange={(e) => onInputChange(e)}
                    />
                  </div>
                  <div className={styles.editControl}>
                    <label htmlFor="edit-height">Height:</label>
                    <input
                      type="text"
                      id="edit-height"
                      data-name="height"
                      data-imageid={image?.id}
                      value={editedSize.height}
                      onChange={(e) => onInputChange(e)}
                    />
                  </div>
                  <div className={styles.editControl}>
                    <label htmlFor="edit-secret-message">Message to encrypt:</label>
                    <input
                      type="text"
                      id="edit-secret-message"
                      data-name="secret-message"
                      data-imageid={image?.id}
                      value={secretMessage}
                      onChange={(e) => onSecretInputChange(e)}
                      maxLength={Math.floor((editedSize.width * editedSize.height) / 8)}
                    /><br />
                    <span className={styles.smallText}>
                      {secretLength} / {Math.floor((editedSize.width * editedSize.height) / 8)} characters available to encrypt
                  </span>
                  </div>
                  <div className={styles.editControl}>
                    <button
                      data-image-url={getDownloadURL(
                        image?.download_url as string,
                        editedSize
                      )}
                      data-secret-message={secretMessage}
                      onClick={(e) => onEncryptClick(e)}
                    >
                      Encrypt
                    </button>
                  </div>
                </div>
                <div data-testid="edit-preview">
                  Image preview:
                  <div>
                    <Thumbnail
                      data-testid="preview-image"
                      {...(image as PicsumImage)}
                    />
                  </div>
                </div>
                <div>
                  <Link
                    data-testid="get-image-link"
                    href={getDownloadURL(
                      image?.download_url as string,
                      editedSize
                    )}
                    target="_blank"
                  >
                    <div className="sizeNote">
                      Changing height and width will affect the visible area of
                      the downloaded image
                    </div>
                  </Link>
                </div>
              </div>
              { encryptedImage && (
              <div className={styles.editedDisplay}>
                <Image
                  className={styles.imageOriginal}
                  data-testid="image-original"
                  alt={`Image ${image?.id} by ${image?.author}`}
                  src={image?.download_url as string}
                  width={imageWidth}
                  height={imageHeight}
                />
                <style jsx>{`
                  .sizeNote {
                    width: ${thumbnailWidth}px;
                    font-size: 1rem;
                  }
                `}</style>
              </div>
              )}
            </div>
          )
        }
      </main>
    </div>
  );
};

export default ImageEditor;
