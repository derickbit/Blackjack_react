import styles from "./Select.module.css";
import PropTypes from "prop-types";

function Select({ text, name, options, handleOnChange, value }) {
  return (
    <div className={styles.form_control}>
      <label htmlFor={name}>{text}:</label>
      <select
        name={name}
        id={name}
        onChange={handleOnChange}
        value={value || ""}
      >
        <option key="default" value="">
          Selecione uma opção
        </option>
        {options.map((options) => (
          <option value={options.id} key={options.id}>
            {options.name}
          </option>
        ))}
      </select>
    </div>
  );
}
Select.propTypes = {
  text: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired, // Add this line
  options: PropTypes.arrayOf(PropTypes.object).isRequired,
  handleOnChange: PropTypes.func.isRequired,
  value: PropTypes.string,
};
export default Select;
