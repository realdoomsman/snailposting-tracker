# 🐌 Snailposting to $10M

A live snailposting tracker that grows based on your token's marketcap, inspired by the legendary 4chan /biz/ tradition.

## Features

- **Live Growing Snail** - Automatically scales based on real-time marketcap from Dexscreener
- **Milestone Tracking** - Visual milestones from $10k to $10M
- **Snailposting Lore** - Explains the 4chan tradition
- **Token Info** - Contract address with copy button
- **Twitter Integration** - Pre-filled tweet button
- **Dark Theme** - Premium crypto aesthetic

## Setup

1. Open `script.js`
2. Update the `CONFIG` object with your token's contract address:

```javascript
const CONFIG = {
    contractAddress: 'YOUR_CONTRACT_ADDRESS_HERE',
    // ...
};
```

3. Deploy to any static hosting (GitHub Pages, Vercel, Netlify)

## How It Works

The site fetches your token's marketcap from Dexscreener's public API every 45 seconds. The snail grows logarithmically - fast at low MC, slower at high MC.

## Live Demo

Deploy to GitHub Pages or any static host.

## Credits

Inspired by the legendary 4chan /biz/ snailposting tradition.

🐌 Snailposting until we hit $10M MC 🐌
