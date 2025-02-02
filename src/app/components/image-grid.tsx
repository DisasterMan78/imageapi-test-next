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

type NavigationProps = {
  page: number,
  onNavClick: (event: MouseEvent) => void,
}

export type ImageGridProps = {
  imageData: PicsumImage[],
  thumbnailWidth: number,
  thumbnailHeight: number,
} & NavigationProps;

const Navigation = ({ page, onNavClick }: NavigationProps) => (
  <div role="navigation" className={styles.navContainer}>
    <div>
      {(page !== 1) && (
        <button onClick={e => onNavClick(e)} value={page - 1}>Next page</button>
      )}
    </div>
    <div>Page {page}</div>
    <div>
      <button onClick={e => onNavClick(e)} value={page + 1}>Next page</button>
    </div>
  </div>
)

const ImageGrid = ({imageData, thumbnailWidth, thumbnailHeight, page, onNavClick}: ImageGridProps) => {
  const thumbnailURL = (url: string) => url.replace(/\d*\/\d*$/, `${thumbnailWidth}/${thumbnailHeight}`);

  const navProps = {
    page,
    onNavClick,
  }

  return (
    <div data-testid="image-grid">
      <Navigation { ...navProps } />
      <ul className={styles.thumbnailGrid}>
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
    </div>
  );
}

export default ImageGrid;
