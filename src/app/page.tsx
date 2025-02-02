"use client"
import { useEffect, useState } from "react";
import styles from "./page.module.css";
import FetchApiOnClient from "./fetch-api";

import LoadingSpinner from "./components/loading-spinner";
import ImageGrid from './components/image-grid';
import { PicsumImage } from "./components/image-grid";

type APIError = false | string;

const Home = () => {
  const [images, setImages] = useState<PicsumImage[]>([]);
  const [dataIsLoading, setDataIsLoading] = useState(true);
  const [hasDataError, setHasDataError] = useState<APIError>(false);

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

  const imageGridProps = {
    imageData: images,
    thumbnailWidth,
    thumbnailHeight,
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
              (<ImageGrid { ...imageGridProps } />)
        }
      </main>
    </div>
  );
}

export default Home;
