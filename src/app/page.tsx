"use client"
import { useEffect, useState } from "react";
import styles from "./page.module.css";
import FetchApiOnClient from "./fetch-api";

import LoadingSpinner from "./components/loading-spinner.tsx";

type PicsumImage = {
  id: string,
  author: string,
  url: string,
  download_url: string,
  width: number,
  height: number,
}

type APIError = false | string;

const Home = () => {
  const [images, setImages] = useState<PicsumImage[]>([]);
  const [dataIsLoading, setDataIsLoading] = useState(true);
  const [hasDataError, setHasDataError] = useState<ApiError>(false);

  const thumbnailWidth = 300;
  const thumbnailHeight = 200;

  useEffect(() => {
    FetchApiOnClient('https://picsum.photos/v2/list')
      .then(response => {
        if (response instanceof Error === true) {
          setHasDataError(response.message);
        } else {
          setImages(response);
        }
        setDataIsLoading(false);
      })
  }, []);

  const thumbnailURL = (url: string) => url.replace(/\d*\/\d*$/, `${thumbnailWidth}/${thumbnailHeight}`);

  const renderImages = (data: PicsumImage[]) => {
    return data.map(image => (
      <li key={image.id}>
        <figure>
          <img width={thumbnailWidth} height={thumbnailHeight} src={thumbnailURL(image.download_url)} />
          <figcaption>{image.author}</figcaption>
        </figure>
      </li>
    ));
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 role="heading" aria-level={1}>Snowplow test - Picsum API</h1>
        {
          dataIsLoading === true ?
            (<div className={styles.loadingIndicator} role="progressbar">
              <div role="alert" aria-live="assertive">Loading images</div>
              <LoadingSpinner />
            </div>)
          :
            hasDataError !== false ?
              (<div role="alert" aria-live="assertive">{hasDataError}</div>)
            :
              (<ul className={styles.thumbnailGrid} data-testid="picsum-result">
                { renderImages(images) }
              </ul>)
        }
      </main>
    </div>
  );
}

export default Home;
