import { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import styles from "./MentionInput.module.css";

const MentionInput = ({
  value,
  onChange,
  placeholder,
  rows = 4,
  disabled = false,
  users = [],
  onUserSearch,
  className,
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mentionQuery, setMentionQuery] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef(null);
  const suggestionListRef = useRef(null);

  // Buscar usuários quando há uma query de menção
  useEffect(() => {
    if (mentionQuery.length > 0 && onUserSearch) {
      onUserSearch(mentionQuery).then((results) => {
        setSuggestions(results || []);
      });
    } else {
      setSuggestions(users.slice(0, 5)); // Mostrar alguns usuários padrão
    }
  }, [mentionQuery, onUserSearch, users]);

  // Detectar menções no texto
  const detectMention = (text, position) => {
    const beforeCursor = text.substring(0, position);
    const lastAtIndex = beforeCursor.lastIndexOf("@");

    if (lastAtIndex === -1) return null;

    const afterAt = beforeCursor.substring(lastAtIndex + 1);
    const hasSpace = afterAt.includes(" ");

    if (hasSpace) return null;

    return {
      start: lastAtIndex,
      query: afterAt,
    };
  };

  const handleTextChange = (e) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart;

    onChange(newValue);
    setCursorPosition(cursorPos);

    const mention = detectMention(newValue, cursorPos);

    if (mention) {
      setMentionQuery(mention.query);
      setShowSuggestions(true);
      setSelectedIndex(0);
    } else {
      setShowSuggestions(false);
      setMentionQuery("");
    }
  };

  const insertMention = (user) => {
    const mention = detectMention(value, cursorPosition);
    if (!mention) return;

    const beforeMention = value.substring(0, mention.start);
    const afterCursor = value.substring(cursorPosition);
    const newValue = `${beforeMention}@${user.name} ${afterCursor}`;

    onChange(newValue);
    setShowSuggestions(false);
    setMentionQuery("");

    // Refocar no textarea
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newPosition = mention.start + user.name.length + 2;
        textareaRef.current.setSelectionRange(newPosition, newPosition);
      }
    }, 0);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case "Enter":
      case "Tab":
        e.preventDefault();
        if (suggestions[selectedIndex]) {
          insertMention(suggestions[selectedIndex]);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        break;
    }
  };

  const handleSuggestionClick = (user) => {
    insertMention(user);
  };

  return (
    <div className={`${styles.mentionInputContainer} ${className || ""}`}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className={styles.textarea}
      />

      {showSuggestions && suggestions.length > 0 && (
        <div className={styles.suggestionsContainer}>
          <ul ref={suggestionListRef} className={styles.suggestionsList}>
            {suggestions.map((user, index) => (
              <li
                key={user.id}
                className={`${styles.suggestionItem} ${
                  index === selectedIndex ? styles.selected : ""
                }`}
                onClick={() => handleSuggestionClick(user)}
              >
                <div className={styles.userInfo}>
                  <span className={styles.userName}>@{user.name}</span>
                  {user.email && (
                    <span className={styles.userEmail}>{user.email}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

MentionInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  rows: PropTypes.number,
  disabled: PropTypes.bool,
  users: PropTypes.array,
  onUserSearch: PropTypes.func,
  className: PropTypes.string,
};

export default MentionInput;
