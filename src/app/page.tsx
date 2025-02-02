"use client"
import { useEffect, useState } from "react";
import styles from "./page.module.css";
import FetchApiOnClient from "./fetch-api";

const Home = () => {
  const [images, setImages] = useState(null);

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
        <pre data-testid="picsum-result">{JSON.stringify(images, null, 2)}</pre>
      </main>
    </div>
  );
}

export default Home;
