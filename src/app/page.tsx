"use client"
import { useEffect, useState } from "react";
import { useRouter, useParams } from 'next/navigation'

import styles from "./page.module.css";
import FetchApiOnClient from "./fetch-api";

import LoadingSpinner from "./components/loading-spinner";
import ImageGrid, { ImageGridProps } from './components/image-grid';
import { PicsumImage } from "./components/image-grid";

type APIError = false | string;

const Home = () => {
  const params = useParams();
  const router = useRouter()
  const [images, setImages] = useState<PicsumImage[]>([]);
  const [dataIsLoading, setDataIsLoading] = useState(true);
  const [hasDataError, setHasDataError] = useState<APIError>(false);
  const [imagePage, setImagePage] = useState(parseInt(params.page as string) || 1);

  const thumbnailWidth = 300;
  const thumbnailHeight = 200;
  const APILimit = 30;

  useEffect(() => {
    setDataIsLoading(true);
    FetchApiOnClient(`https://picsum.photos/v2/list?page=${imagePage}&limit=${APILimit}`)
      .then(response => {
        if (response instanceof Error === true) {
          setHasDataError(response.message);
        } else {
          setImages(response);
        }
        setDataIsLoading(false);
      })
  }, [imagePage]);

  const onNavClick = (event: MouseEvent) => {
    const page = (event.currentTarget as HTMLButtonElement).value;
    setImagePage(parseInt(page));
    // @ts-expect-error 'shallow' does not exist in type 'NavigateOptions'
    router.push(`/${page}`, {shallow:true})
  }

  const onImageClick = (event: MouseEvent) => {
    const imageId = (event.currentTarget as HTMLButtonElement).value;
    // setImagePage(parseInt(page));
    // @ts-expect-error 'shallow' does not exist in type 'NavigateOptions'
    router.push(`/id/${imageId}`, {shallow:true})
  }

  const imageGridProps: ImageGridProps = {
    imageData: images,
    thumbnailWidth,
    thumbnailHeight,
    page: imagePage,
    APILimit,
    onNavClick,
    onImageClick,
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
