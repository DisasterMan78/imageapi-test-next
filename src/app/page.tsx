import styles from "./page.module.css";

 const Home = () => (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 role="heading" aria-level={1}>Snowplow test - Picsum API</h1>
      </main>
    </div>
  );

export default Home;