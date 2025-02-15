"use client";
import {
  ChangeEvent,
  MouseEvent,
  ReactElement,
  useEffect,
  useRef,
  useState,
} from "react";
import { useParams } from "next/navigation";
import Image from "next/image";

import homeStyles from "../../page.module.css";
import styles from "./page.module.css";

import FetchApiOnClient from "../../fetch-api";
import LoadingSpinner from "../../components/loading-spinner";
import { PicsumImage } from "../../components/image-grid";
import Link from "next/link";
import FetchImageOnClient from "@/app/fetch-image";
import { decode, RawImageData } from "jpeg-js";
import {
  convertToGrayscale,
  getImageDataBuffer,
  invertPixelColour,
  rgbaArray,
} from "@/app/utils/image-processing";

type APIError = false | string;
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
  grayscale: false,
  blur: 0,
};

type CanvasProps = {
  imagedata: ImageData;
  width: number;
  height: number;
};

const getDownloadURL = (
  url: string,
  editedSize: EditedSize,
  grayscale: boolean,
  blur: number
) =>
  url.replace(
    /\d*\/\d*$/,
    `${editedSize.width}/${editedSize.height}?${grayscale ? "grayscale" : ""}${
      blur > 0 ? `&blur=${blur}` : ""
    }`
  );

const CanvasImage = (props: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      canvas.width = props.width;
      canvas.height = props.height;
      context?.putImageData(props.imagedata, 0, 0);
    }
  });
  return <canvas ref={canvasRef} {...props} />;
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
  const [editedSize, setEditedSize] = useState<EditedSize>({
    height: editorInitialValues.height,
    width: editorInitialValues.width,
  });
  const [grayscale, setGrayscale] = useState(editorInitialValues.grayscale);
  const [blur, setBlur] = useState(editorInitialValues.blur);
  const [convertWithJS, setConvertWithJS] = useState(false);
  const [convertedImage, setConvertedImage] =
    useState<null | ReactElement<HTMLCanvasElement>>(null);
  const [conversionInProgress, setConversionInProgress] = useState(false);

  useEffect(() => {
    setDataIsLoading(true);
    FetchApiOnClient(`https://picsum.photos/id/${params.image}/info`).then(
      (response) => {
        if (response instanceof Error === true) {
          setHasDataError(response.message);
        } else {
          setImage(response);
        }
        setDataIsLoading(false);
      }
    );
  }, [params.image]);

  const Thumbnail = (imageData: PicsumImage) => {
    const thumbnailURL = (url: string) =>
      url.replace(
        /\d*\/\d*$/,
        `${thumbnailWidth}/${thumbnailHeight}?${grayscale ? "grayscale" : ""}${
          blur > 0 ? `&blur=${blur}` : ""
        }`
      );

    return (
      <Image
        className={styles.imagePreview}
        width={thumbnailWidth}
        height={thumbnailHeight}
        src={thumbnailURL(imageData.download_url)}
        alt={"Edited image preview"}
      />
    );
  };

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputName = e.currentTarget.getAttribute("data-name");
    const value =
      inputName === "grayscale"
        ? e.currentTarget.checked
        : parseInt(e.currentTarget.value);
    switch (inputName) {
      case "height":
        setEditedSize({
          height: value as number,
          width: editedSize.width,
        });

        break;
      case "width":
        setEditedSize({
          height: editedSize.height,
          width: value as number,
        });

        break;
      case "grayscale":
        setGrayscale(value as boolean);

        break;
      case "blur":
        setBlur(value as number);

        break;

      default:
        break;
    }
    if (typeof window !== "undefined") {
      const storageId = `image-id-${e.currentTarget.getAttribute(
        "data-imageid"
      )}`;
      const itemStorage = JSON.parse(localStorage.getItem(storageId) as string);

      itemStorage[inputName as string] = value;
      localStorage.setItem(storageId, JSON.stringify(itemStorage));
    }
  };

  const onJSConvertClick = async (e: MouseEvent<HTMLButtonElement>) => {
    setConvertWithJS(true);
    setConversionInProgress(true);
    setConvertedImage(null);
    const url = e.currentTarget.getAttribute("data-image-url") as string;
    const functionName = e.currentTarget.getAttribute('data-processing-fn');
    const imageData = (await FetchImageOnClient(url)) as Blob;
    const imageDataBuffer = (await getImageDataBuffer(
      imageData
    )) as Uint8Array<ArrayBuffer>;

    /* So I got to this point in the process then gave myself a good slap.
    JPEG data is, of course, compressed, and does NOT resemble RGBA values.
    Not being a total masochist, I do not want to write my own JPEG
    decompression algorithm, so I am enlisting `jpeg-js` to handle that.
    Everything up to this point has been a total waste of time for my goals,
    but it has been highly educational. And irrelevant. But educational.
    */
    const rawImageData = decode(imageDataBuffer) as RawImageData<Buffer>;
    const pixelData = rawImageData.data;

    /*
    I started attempting to write PNG data from scratch. It is quite
    complicated! We need to walk an arraybuffer, read chunks, write chunks,
    write CRC checksum values and deal with Adler compression.
    So sod that.
    https://medium.com/the-guardian-mobile-innovation-lab/generating-images-in-javascript-without-using-the-canvas-api-77f3f4355fad

    As much as I REALLY wanted to avoid using canvas at all, it is the simplest way to write raw image data to the DOM.
    */
    // const pngSignature = [137, 80, 78, 71, 13, 10, 26, 10];
    /* buffer size is incorrect - doesn't allow for all the PNG header data */
    // const PNGBuffer = new ArrayBuffer(4 * rawImageData.width * rawImageData.height);
    // const PNGUint8CData = new Uint8ClampedArray(PNGBuffer)

    const buffer = new ArrayBuffer(
      4 * rawImageData.width * rawImageData.height
    );
    const newUint8CData = new Uint8ClampedArray(buffer);

    for (let index = 0; index < pixelData.length; index = index + 4) {
      const RBGA = [
        pixelData[index],
        pixelData[index + 1],
        pixelData[index + 2],
        pixelData[index + 3],
      ];

      let processingFunction = (rgba: rgbaArray) => { return rgba as number[] };
      switch (functionName) {
        case 'convertToGrayscale':
          processingFunction = convertToGrayscale;
          break;

        case 'invertPixelColour':
          processingFunction = invertPixelColour;
          break;

        default:
          break;
      }
      const grayscale = processingFunction(RBGA as rgbaArray);

      newUint8CData[index] = grayscale[0];
      newUint8CData[index + 1] = grayscale[1];
      newUint8CData[index + 2] = grayscale[2];
      newUint8CData[index + 3] = grayscale[3];
    }

    const newCanvasImage = (
      <CanvasImage
        imagedata={
          new ImageData(newUint8CData, rawImageData.width, rawImageData.height)
        }
        width={rawImageData.width}
        height={rawImageData.height}
      />
    );
    setConvertedImage(newCanvasImage);
    setConversionInProgress(false);
  };

  return (
    <div className={homeStyles.page}>
      <main className={homeStyles.main}>
        <h1 role="heading" aria-level={1}>
          Picsum Api test - Edit Image
        </h1>
        {dataIsLoading === true ? (
          <div className={homeStyles.loadingIndicator} role="progressbar">
            <div role="alert" aria-live="assertive">
              Loading image
            </div>
            <LoadingSpinner />
          </div>
        ) : hasDataError !== false ? (
          <div role="alert" aria-live="assertive">
            {hasDataError}
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
                  <label htmlFor="edit-grayscale">Grayscale:</label>
                  <input
                    type="checkbox"
                    id="edit-grayscale"
                    data-name="grayscale"
                    data-imageid={image?.id}
                    data-testid="edit-grayscale"
                    checked={grayscale}
                    onChange={(e) => onInputChange(e)}
                  />
                </div>
                <div className={styles.editControl}>
                  <label htmlFor="edit-blur">Blur:</label>
                  <input
                    type="number"
                    id="edit-blur"
                    data-name="blur"
                    data-imageid={image?.id}
                    min="0"
                    max="10"
                    step="1"
                    value={blur}
                    onChange={(e) => onInputChange(e)}
                  />
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
                    editedSize,
                    grayscale,
                    blur
                  )}
                  target="_blank"
                >
                  <div className="sizeNote">
                    Changing height and width will affect the visible area of
                    the downloaded image
                  </div>
                  <button>Get edited image in new tab</button>
                </Link>
              </div>
            </div>
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
            <div className={styles.experimental}>
              <h3>Experimental:</h3>
              <p>These functions process image data in pure Javascript in the browser</p>
              <br />
              <button
                data-image-url={getDownloadURL(
                  image?.download_url as string,
                  editedSize,
                  grayscale,
                  blur
                )}
                data-processing-fn={'invertPixelColour'}
                onClick={(e) => onJSConvertClick(e)}
              >
                Invert
              </button>
              <button
                data-image-url={getDownloadURL(
                  image?.download_url as string,
                  editedSize,
                  grayscale,
                  blur
                    )}
                data-processing-fn={'convertToGrayscale'}
                onClick={(e) => onJSConvertClick(e)}
              >
                -&gt; grayscale
              </button>
              <br />
              {convertWithJS && convertedImage ? (
                <div>{convertedImage}</div>
              ) : (
                <div>{conversionInProgress && <LoadingSpinner />}</div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ImageEditor;
