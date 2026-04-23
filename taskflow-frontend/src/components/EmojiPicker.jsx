import { useState } from 'react';
import { Smile } from 'lucide-react';

const EMOJIS = [
  '😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛',
  '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔',
  '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐', '😕',
  '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓',
  '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '👾', '🤖', '❤️',
  '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '👍', '👎', '👌',
  '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🤝', '🙏', '✍️', '💪', '🦾'
];

const EmojiPicker = ({ onEmojiSelect, position = 'bottom' }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleEmojiClick = (emoji) => {
    onEmojiSelect(emoji);
    setIsOpen(false);
  };

  const pickerClasses = `
    emoji-picker
    emoji-picker--${position}
    ${isOpen ? 'emoji-picker--open' : ''}
  `;

  return (
    <div className="emoji-picker-container">
      <button
        className="emoji-picker-trigger"
        onClick={() => setIsOpen(!isOpen)}
        title="Add emoji reaction"
      >
        <Smile size={16} />
      </button>
      
      {isOpen && (
        <div className={pickerClasses}>
          <div className="emoji-picker-grid">
            {EMOJIS.map((emoji, index) => (
              <button
                key={index}
                className="emoji-picker-item"
                onClick={() => handleEmojiClick(emoji)}
                title={emoji}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {isOpen && (
        <div 
          className="emoji-picker-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default EmojiPicker;
