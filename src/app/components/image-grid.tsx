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
  APILimit: number,
  resultCount: number,
  onNavClick: (event: MouseEvent) => void,
}

export type ImageGridProps = {
  imageData: PicsumImage[],
  thumbnailWidth: number,
  thumbnailHeight: number,
  onImageClick: (event: MouseEvent) => void,
} & Omit<NavigationProps, "resultCount">;

const Navigation = ({ page, APILimit, resultCount, onNavClick }: NavigationProps) => (
  <div role="navigation" className={styles.navContainer}>
    <div>
      {(page !== 1) && (
        <button
          onClick={e => onNavClick(e as unknown as MouseEvent)}
          value={page - 1}
          rel="prev"
        >Prev page</button>
      )}
    </div>
    <div>Page {page}</div>
    <div>
      {
        (resultCount >= APILimit) && (
          <button
            onClick={e => onNavClick(e as unknown as MouseEvent)}
            value={page + 1}
            rel="next"
          >Next page</button>
        )
      }
    </div>
  </div>
)

const ImageGrid = ({imageData, APILimit, thumbnailWidth, thumbnailHeight, page, onNavClick, onImageClick}: ImageGridProps) => {
  const thumbnailURL = (url: string) => url.replace(/\d*\/\d*$/, `${thumbnailWidth}/${thumbnailHeight}`);

  const navProps = {
    page,
    APILimit,
    resultCount: imageData.length,
    onNavClick,
  }

  return (
    <div data-testid="image-grid">
      <Navigation { ...navProps } />
      <ul className={styles.thumbnailGrid}>
        {
          imageData.length > 0 && imageData.map(image => (
            <li key={image.id}>
              <figure>
                <button
                  onClick={e => onImageClick(e as unknown as MouseEvent)}
                  value={image.id}
                >
                  <Image
                    width={thumbnailWidth}
                    height={thumbnailHeight}
                    src={thumbnailURL(image.download_url)}
                    alt={`Image by ${image.author}`}
                  />
                </button>
                <figcaption>{image.author}</figcaption>
              </figure>
            </li>
          ))
        }
        {
          // On the off chance the last page has exactly {APILimit}
          // number of images or user modifies url param > # pages
          // This is useful as there is no obvious data from Picsum
          // on the number of images it provides
          // API responses do containe a 'link' header but it's a
          // PITA to access and pass through, and it returns a link
          // even on invalid pages so I'll leave that for now. It is
          // a solvable problem, but perfection is the enemy of good
          // enough.
          imageData.length === 0 && (
          <li key="no-data" role="alert" aria-live="assertive">
              No more images to display
          </li>
          )
        }
      </ul>
      <Navigation { ...navProps } />
    </div>
  );
}

export default ImageGrid;
