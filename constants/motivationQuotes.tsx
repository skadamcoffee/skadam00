export const motivationQuotes = [
  "Every cup is a new beginning. ☕",
  "Life happens, coffee helps. ✨",
  "But first, coffee and dreams. 🌟",
  "Coffee: because adulting is hard. 💪",
  "Fuel your passion, one sip at a time. 🔥",
  "Great things never come from comfort zones. 🚀",
  "Today's good mood is sponsored by coffee. 😊",
  "Dream big, start with coffee. ☁️",
  "Coffee is a hug in a mug. 🤗",
  "Rise and grind, champion! 🏆",
  "Your potential is endless, just like our coffee. ♾️",
  "Make today amazing, one cup at a time. ⭐",
  "Coffee first, conquer the world second. 🌍",
  "Believe in yourself as much as you believe in coffee. 💫",
  "Success starts with a great cup of coffee. 🎯",
  "Life is too short for bad coffee and bad vibes. ✌️",
  "Coffee: the most important meal of the day. 🌅",
  "Stay grounded, but reach for the stars. 🌟",
  "Every expert was once a beginner with coffee. 📚",
  "Coffee is proof that good things take time. ⏰",
  "Start where you are, start with coffee. 🏁",
  "The best project you'll ever work on is yourself. 💎",
  "Coffee: turning 'I can't' into 'I can'. 💪",
  "Your only limit is your mind (and caffeine levels). 🧠",
  "Make it happen, make it strong. ⚡",
  "Coffee is the common man's gold. 🏅",
  "Opportunities don't happen, you create them. 🛠️",
  "Coffee: because Monday happens every week. 📅",
  "Be yourself, everyone else is taken (and caffeinated). 🎭",
  "Life begins after coffee. 🌱"
];

export const getRandomQuote = (): string => {
  const randomIndex = Math.floor(Math.random() * motivationQuotes.length);
  return motivationQuotes[randomIndex];
};