import PropTypes from "prop-types";
import styles from "./TextWithMentions.module.css";

const TextWithMentions = ({ text, className }) => {
  if (!text) return null;

  // Regex para encontrar menções no formato @username
  const mentionRegex = /@(\w+)/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  // Procurar todas as menções no texto
  while ((match = mentionRegex.exec(text)) !== null) {
    // Adicionar texto antes da menção
    if (match.index > lastIndex) {
      parts.push({
        type: "text",
        content: text.slice(lastIndex, match.index),
        key: `text-${lastIndex}`,
      });
    }

    // Adicionar a menção
    parts.push({
      type: "mention",
      content: match[0], // @username
      username: match[1], // username sem @
      key: `mention-${match.index}`,
    });

    lastIndex = match.index + match[0].length;
  }

  // Adicionar texto restante após a última menção
  if (lastIndex < text.length) {
    parts.push({
      type: "text",
      content: text.slice(lastIndex),
      key: `text-${lastIndex}`,
    });
  }

  // Se não há menções, retornar texto simples
  if (parts.length === 0) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={className}>
      {parts.map((part) => {
        if (part.type === "mention") {
          return (
            <span
              key={part.key}
              className={styles.mention}
              title={`Menção para @${part.username}`}
            >
              {part.content}
            </span>
          );
        }
        return <span key={part.key}>{part.content}</span>;
      })}
    </span>
  );
};

TextWithMentions.propTypes = {
  text: PropTypes.string,
  className: PropTypes.string,
};

export default TextWithMentions;
