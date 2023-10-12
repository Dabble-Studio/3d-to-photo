import React, { useState } from 'react';
import styles from "./textinput.module.css";

function TextInput({ onTextChange }) {
  const [text, setText] = useState('');

  function handleTextChange(event) {
    const newText = event.target.value;
    setText(newText);
    onTextChange(newText);
  }

  return (
    <div className={styles.textInputContainer}>
      
      <textarea id="text-input" wrap="soft" type="text" value={text} onChange={handleTextChange} className={styles.textInput} placeholder='Describe where the item should be placed. e.g. "in the grass", or "on the moon"'/>
    </div>
  );
}

export default TextInput;