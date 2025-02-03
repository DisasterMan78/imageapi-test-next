"use client"
import { useEffect, useState } from "react";
import { useParams } from 'next/navigation'
import Image from "next/image";

import homeStyles from "../../page.module.css";
import FetchApiOnClient from "../../fetch-api";

import LoadingSpinner from "../../components/loading-spinner";
import { PicsumImage } from "../../components/image-grid";

type APIError = false | string;

const ImageEditor = () => {
  const params = useParams();
  const [image, setImage] = useState<PicsumImage>();
  const [dataIsLoading, setDataIsLoading] = useState(true);
  const [hasDataError, setHasDataError] = useState<APIError>(false);

  const thumbnailWidth = 300;
  const thumbnailHeight = 200;
  const imageSizeFactor = 2.5;
  const imageWidth = thumbnailWidth * imageSizeFactor;
  const imageHeight = thumbnailHeight * imageSizeFactor;

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
              (<Image
                data-testid="image-original"
                alt={`Image ${image?.id} by ${image?.author}`}
                src={image?.download_url as string}
                width={imageWidth}
                height={imageHeight}
              />)
        }
      </main>
    </div>
  );
}

export default ImageEditor;
