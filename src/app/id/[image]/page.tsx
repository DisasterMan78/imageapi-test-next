"use client"
import { useEffect, useState } from "react";
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

const ImageEditor = () => {
  const thumbnailWidth = 300;
  const thumbnailHeight = 200;
  const imageSizeFactor = 2.5;
  const imageWidth = thumbnailWidth * imageSizeFactor;
  const imageHeight = thumbnailHeight * imageSizeFactor;

  const params = useParams();
  const [image, setImage] = useState<PicsumImage>();
  const [dataIsLoading, setDataIsLoading] = useState(true);
  const [hasDataError, setHasDataError] = useState<APIError>(false);
  const [editedSize, setEditedSize] = useState<EditedSize>({ height: imageHeight, width: imageWidth });
  const [grayscale, setGrayscale] = useState(false);
  const [blur, setBlur] = useState(0);

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


  const getDownloadURL = (url: string, editedSize: EditedSize, graysclae: boolean, blur: number) => url.replace(/\d*\/\d*$/, `${editedSize.width}/${editedSize.height}?${grayscale ? 'grayscale' : ''}${blur > 0 ? `&blur=${blur}`: ''}`);

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
                        value={editedSize.width ?? ""}
                        onChange={(e) => setEditedSize({
                          width: parseInt(e.currentTarget.value),
                          height: editedSize.height,
                        })}
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
                        value={editedSize.height ?? ""}
                        onChange={(e) => setEditedSize({
                          width: editedSize.width,
                          height: parseInt(e.currentTarget.value),
                        })}
                      />
                    </div>
                    <div className={styles.editControl}>
                      <label
                        htmlFor="edit-grayscale"
                      >Grayscale:</label>
                      <input
                        type="checkbox"
                        id="edit-grayscale"
                        data-testid="edit-grayscale"
                        checked={grayscale}
                        onChange={() => setGrayscale(!grayscale)}
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
                        min="0"
                        max="10"
                        step="1"
                        value={blur ?? 0}
                        onChange={(e) => setBlur(parseInt(e.currentTarget.value))}
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
                      data-testid="get-image-button"
                      href={getDownloadURL(image?.download_url as string, editedSize, grayscale, blur)}
                      target="_blank"
                    >
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
              </div>)
        }
      </main>
    </div>
  );
}

export default ImageEditor;
