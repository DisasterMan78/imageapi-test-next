"use client"
import { ChangeEvent, useEffect, useState } from "react";
import { useParams } from 'next/navigation'
import Image from "next/image";

import homeStyles from "../../page.module.css";
import styles from "./page.module.css";

import FetchApiOnClient from "../../fetch-api";
import LoadingSpinner from "../../components/loading-spinner";
import { PicsumImage } from "../../components/image-grid";
import Link from "next/link";


type APIError = false | string;
type EditedSize = {
  width: number,
  height: number,
}

export type ImageOptions = {
  width: number,
  height: number,
  grayscale: boolean,
  blur: number,
}

export type LocalStorageImages = {
  [key: string]: string,
}

const thumbnailWidth = 300;
const thumbnailHeight = 200;
const imageSizeFactor = 2.5;
const imageWidth = thumbnailWidth * imageSizeFactor;
const imageHeight = thumbnailHeight * imageSizeFactor;

export const editorDefaults = {
  width: imageWidth,
  height: imageHeight,
  grayscale: false,
  blur: 0,
};

const ImageEditor = () => {
  const params = useParams();
  let itemStorage = null;

  if (typeof window !== "undefined") {
    const storageId = `image-id-${params.image}`;

    itemStorage = JSON.parse(localStorage.getItem(storageId) as string);

    if (itemStorage == null) {
      localStorage.setItem(storageId, JSON.stringify(editorDefaults));
      itemStorage = editorDefaults;
    }
  }
  const editorInitialValues: ImageOptions = itemStorage;

  const [image, setImage] = useState<PicsumImage>();
  const [dataIsLoading, setDataIsLoading] = useState(true);
  const [hasDataError, setHasDataError] = useState<APIError>(false);
  const [editedSize, setEditedSize] = useState<EditedSize>({ height: editorInitialValues.height, width: editorInitialValues.width });
  const [grayscale, setGrayscale] = useState(editorInitialValues.grayscale);
  const [blur, setBlur] = useState(editorInitialValues.blur);

  useEffect(() => {
    setDataIsLoading(true);
    FetchApiOnClient(`https://picsum.photos/id/${params.image}/info`)
      .then(response => {
        if (response instanceof Error === true) {
          setHasDataError(response.message);
        } else {
          setImage(response);
        }
        setDataIsLoading(false);
      })
  }, [params.image]);

  const Thumbnail = (imageData: PicsumImage) => {
    const thumbnailURL = (url: string) => url.replace(/\d*\/\d*$/, `${thumbnailWidth}/${thumbnailHeight}?${grayscale ? 'grayscale' : ''}${blur > 0 ? `&blur=${blur}` : ''}`);

    return (
      <Image
        className={styles.imagePreview}
        width={thumbnailWidth}
        height={thumbnailHeight}
        src={thumbnailURL(imageData.download_url)}
        alt={'Edited image preview'}
      />
    )
  }

  const getDownloadURL = (url: string, editedSize: EditedSize, grayscale: boolean, blur: number) => url.replace(/\d*\/\d*$/, `${editedSize.width}/${editedSize.height}?${grayscale ? 'grayscale' : ''}${blur > 0 ? `&blur=${blur}` : ''}`);

  const onHeightChange = (e: ChangeEvent<HTMLInputElement>) => {
    const height = parseInt(e.currentTarget.value);
    setEditedSize({
      height,
      width: editedSize.width,
    });

    if (typeof window !== "undefined") {
      const storageId = `image-id-${e.currentTarget.getAttribute('data-imageid')}`;
      const itemStorage = JSON.parse(localStorage.getItem(storageId) as string);

      itemStorage.height = height;
      localStorage.setItem(storageId, JSON.stringify(itemStorage))
    }
  }

  const onWidthChange = (e: ChangeEvent<HTMLInputElement>) => {
    const width = parseInt(e.currentTarget.value);
    setEditedSize({
      height: editedSize.height,
      width,
    });

    if (typeof window !== "undefined") {
      const storageId = `image-id-${e.currentTarget.getAttribute('data-imageid')}`;
      const itemStorage = JSON.parse(localStorage.getItem(storageId) as string);

      itemStorage.width = width;
      localStorage.setItem(storageId, JSON.stringify(itemStorage))
    }
  }

  const onGrayscaleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const grayscale = e.currentTarget.checked;
    setGrayscale(grayscale)

    if (typeof window !== "undefined") {
      const storageId = `image-id-${e.currentTarget.getAttribute('data-imageid')}`;
      const itemStorage = JSON.parse(localStorage.getItem(storageId) as string);

      itemStorage.grayscale = grayscale;
      localStorage.setItem(storageId, JSON.stringify(itemStorage))
    }
  }

  const onBlurChange = (e: ChangeEvent<HTMLInputElement>) => {
    const blur = parseInt(e.currentTarget.value);
    setBlur(blur)

    if (typeof window !== "undefined") {
      const storageId = `image-id-${e.currentTarget.getAttribute('data-imageid')}`;
      const itemStorage = JSON.parse(localStorage.getItem(storageId) as string);

      itemStorage.blur = blur;
      localStorage.setItem(storageId, JSON.stringify(itemStorage))
    }
  }

  return (
    <div className={homeStyles.page}>
      <main className={homeStyles.main}>
        <h1 role="heading" aria-level={1}>Snowplow test - Edit Image</h1>
        {
          dataIsLoading === true ?
            (<div className={homeStyles.loadingIndicator} role="progressbar">
              <div role="alert" aria-live="assertive">Loading image</div>
              <LoadingSpinner />
            </div>)
            :
            hasDataError !== false ?
              (<div role="alert" aria-live="assertive">{hasDataError}</div>)
              :
              (<div className={styles.editImage} data-testid="edit-image">
                <div data-testid="editor">
                  <div data-testid="edit-options">
                    <div className={styles.editControl}>
                      <label
                        htmlFor="edit-width"
                      >
                        Width:
                      </label>
                      <input
                        autoFocus
                        type="text"
                        id="edit-width"
                        data-imageid={image?.id}
                        value={editedSize.width}
                        onChange={(e) => onWidthChange(e)}
                      />
                    </div>
                    <div className={styles.editControl}>
                      <label
                        htmlFor="edit-height"
                      >
                        Height:
                      </label>
                      <input
                        type="text"
                        id="edit-height"
                        data-imageid={image?.id}
                        value={editedSize.height}
                        onChange={(e) => onHeightChange(e)}
                      />
                    </div>
                    <div className={styles.editControl}>
                      <label
                        htmlFor="edit-grayscale"
                      >Grayscale:</label>
                      <input
                        type="checkbox"
                        id="edit-grayscale"
                        data-imageid={image?.id}
                        data-testid="edit-grayscale"
                        checked={grayscale}
                        onChange={(e) => onGrayscaleChange(e)}
                      />
                    </div>
                    <div className={styles.editControl}>
                      <label
                        htmlFor="edit-blur"
                      >
                        Blur:
                      </label>
                      <input
                        type="number"
                        id="edit-blur"
                        data-imageid={image?.id}
                        min="0"
                        max="10"
                        step="1"
                        value={blur}
                        onChange={(e) => onBlurChange(e)}
                      />
                    </div>
                  </div>
                  <div data-testid="edit-preview">
                    Image preview:
                    <div>
                      <Thumbnail
                        data-testid="preview-image"
                        {...image as PicsumImage}
                      />
                    </div>
                  </div>
                  <div>
                    <Link
                      data-testid="get-image-link"
                      href={getDownloadURL(image?.download_url as string, editedSize, grayscale, blur)}
                      target="_blank"
                    >
                      <div
                        className="sizeNote"
                      >
                        Changing height and width will affect the visible area of the downloaded image
                      </div>
                      <button>Get edited image in new tab</button>
                    </Link>
                  </div>
                </div>
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
              </div>)
        }
      </main>
    </div>
  );
}

export default ImageEditor;
