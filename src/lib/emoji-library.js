export const EMOJI_LIBRARY = Object.freeze({
  common: ["😀", "😂", "🙏", "🔥", "🎉", "🚀", "💬", "❤️"],
  work: ["✅", "📌", "🧠", "📎", "🛠️", "📊"],
});

export function getEmojiSet(kind = "common") {
  return EMOJI_LIBRARY[kind] || EMOJI_LIBRARY.common;
}
