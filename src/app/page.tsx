'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

import styles from '@/app/page.module.css';

import { FetchApiOnClient } from '@/app/utils/fetch-api';
import LoadingSpinner from '@/app/components/loading-spinner';
import ImageGrid, { ImageGridProps } from '@/app/components/image-grid';
import { PicsumImage } from '@/app/components/image-grid';
import {default as ErrorUI} from '@/app/error';

const Home = () => {
  const params = useParams();
  const router = useRouter()
  const [error, setError] = useState<null | Error>(null)
  const [images, setImages] = useState<PicsumImage[]>([]);
  const [dataIsLoading, setDataIsLoading] = useState(true);
  const [imagePage, setImagePage] = useState(parseInt(params.page as string) || 1);

  const thumbnailWidth = 300;
  const thumbnailHeight = 200;
  const APILimit = 30;

  useEffect(() => {
    setDataIsLoading(true);
    FetchApiOnClient(`https://picsum.photos/v2/list?page=${imagePage}&limit=${APILimit}`)
      .catch(error => {
        setError(error as Error)
      })
      .then(response => {
        console.log("🚀 ~ Home ~ response instanceof Error === true:", response instanceof Error === true)
        setImages(response);
        setDataIsLoading(false);
      })
  }, [imagePage]);

  if (error) {
    return (<ErrorUI error={error} reset={() => { }} />)
  }

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
        <h1 role="heading" aria-level={1}>Picsum API test - Browse Images</h1>
        {
          dataIsLoading === true ? (
            <div>
              <label id='loading-label' htmlFor='loading-indicator' role="alert" aria-live="assertive">
                Loading images
              </label>
              <div id='loading-indicator' className={styles.loadingIndicator} role="progressbar" aria-labelledby='loading-label'>
                <LoadingSpinner />
              </div>
            </div>
          ) : (
            <ImageGrid {...imageGridProps} />
          )
        }
      </main>
    </div>
  );
}

export default Home;
