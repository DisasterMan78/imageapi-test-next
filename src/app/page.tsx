"use client"
import { useEffect, useState } from "react";
import styles from "./page.module.css";
import FetchApiOnClient from "./fetch-api";
import { Url } from "url";

type PicsumImage = {
  id: string,
  author: string,
  url: string,
  download_url: string,
  width: number,
  height: number,
}

const Home = () => {
  const [images, setImages] = useState<PicsumImage[]>([]);
  const thumbnailWidth = 300;
  const thumbnailHeight = 200;

  useEffect(() => {
    FetchApiOnClient('https://picsum.photos/v2/list')
      .then(response => {
        setImages(response);
      })
  }, []);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 role="heading" aria-level={1}>Snowplow test - Picsum API</h1>
        <ul data-testid="picsum-result">
          {images.map(image => (
            <li key={image.id}>
              <img width={thumbnailWidth} height={thumbnailHeight} role="image" src={image.download_url} />
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}

export default Home;
