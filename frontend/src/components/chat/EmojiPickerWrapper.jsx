import React, { useEffect, useRef } from 'react';
import EmojiPicker from 'emoji-picker-react';

export function EmojiPickerWrapper({ onEmojiClick, onClose, position }) {
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="emoji-picker-wrapper"
      style={position ? { bottom: position.bottom, right: position.right } : {}}
    >
      <EmojiPicker
        onEmojiClick={(emojiData) => {
          onEmojiClick(emojiData.emoji);
          onClose();
        }}
        height={350}
        width={300}
        searchPlaceholder="Search emoji…"
        previewConfig={{ showPreview: false }}
        lazyLoadEmojis
      />
    </div>
  );
}

export default EmojiPickerWrapper;
