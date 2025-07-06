import styles from "./forms.module.css";

const Atualizacoes = () => {
  return (
    <div className={styles.project_container}>
      <div className={styles.reports_title_container}>
        <h1 className={styles.reports_grand_title}>Em desenvolvimento</h1>
      </div>
      <div className={styles.reports_flex}>
        <div
          className={styles.reports_box}
          style={{
            minHeight: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.2rem",
            color: "#888",
          }}
        >
          Em desenvolvimento
        </div>
      </div>
    </div>
  );
};

export default Atualizacoes;
