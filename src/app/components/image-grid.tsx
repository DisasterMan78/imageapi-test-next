"use client"
import styles from "./image-grid.module.css";
import Image from 'next/image'

export type PicsumImage = {
  id: string,
  author: string,
  url: string,
  download_url: string,
  width: number,
  height: number,
}

export type ImageGridProps = {
  imageData: PicsumImage[],
  thumbnailWidth: number,
  thumbnailHeight: number,
}

const ImageGrid = ({imageData, thumbnailWidth, thumbnailHeight}: ImageGridProps) => {
  const thumbnailURL = (url: string) => url.replace(/\d*\/\d*$/, `${thumbnailWidth}/${thumbnailHeight}`);

  return (
    <ul className={styles.thumbnailGrid} data-testid="image-grid">
      {
        imageData.map(image => (
          <li key={image.id}>
            <figure>
              <Image
                width={thumbnailWidth}
                height={thumbnailHeight}
                src={thumbnailURL(image.download_url)}
                alt={`Image by ${image.author}`}
              />
              <figcaption>{image.author}</figcaption>
            </figure>
          </li>
        ))
      }
    </ul>
  );
}

export default ImageGrid;
