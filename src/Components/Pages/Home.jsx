// ALTERADO: Removi 'Link' pois o jogo vai carregar aqui.
import styles from "./Home.module.css";
import HiLo from "./hiLo";

function Home() {
  return (
    <section className={styles.home_container}>
      <h1>Bem vindo(a)</h1>
      <h2>Apresentamos nosso jogo HiLo!</h2>
      <HiLo />
    </section>
  );
}

export default Home;
