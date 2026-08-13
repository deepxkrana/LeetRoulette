# LeetRoulette

A sleek, minimalist tool to help you pick LeetCode problems at random, built with React and Vite. Say goodbye to decision fatigue and let the roulette decide your next coding challenge!

![LeetRoulette Screenshot](./public/screenshot.png) <!-- Note: Add a screenshot of the app here -->

## Features

- **Sleek Interface**: Ultra-minimalist, dark-mode aesthetic with satisfying animations powered by `framer-motion`.
- **All Questions Mode**: By default, it loads a comprehensive pool of 4,000+ public LeetCode questions.
- **Custom Data Mode**: Upload a JSON file of your own solved LeetCode problems to practice exactly what you need.
- **Smart Filtering**: Filter the question pool by specific **Difficulties** (Easy, Medium, Hard) or **Topics** (Arrays, Two Pointers, Dynamic Programming, etc.).
- **Prioritize Unseen**: Toggle an option in settings to heavily favor problems the roulette hasn't landed on yet during your current session.
- **Satisfying Sounds**: Features custom Web Audio API-generated percussive clicks and a chime when the wheel lands.

## How to use Custom Data

Want to practice only the problems you've actually solved or seen? You can extract your own data directly from LeetCode and upload it to LeetRoulette:

1. Go to [leetcode.com](https://leetcode.com) and log in to your account.
2. Open your browser's **Developer Tools** (usually `F12` or `Cmd+Option+J`).
3. Navigate to the **Console** tab.
4. Copy the entire contents of the [`public/extract_leetcode.js`](./public/extract_leetcode.js) script found in this repository.
5. Paste it into the console and hit Enter. This will extract your solved problems and automatically download a `solved_problems.json` file.
6. Open LeetRoulette, click the **Settings icon (⚙)** at the bottom, and upload your JSON file.

Your data is saved locally in your browser's `localStorage`, so you only need to upload it once!

## Development

This project is built using:
- **React 18**
- **Vite**
- **TypeScript**
- **Framer Motion** (for animations)

### Running Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/deepxkrana/LeetRoulette.git
   ```
2. Navigate into the directory:
   ```bash
   cd LeetRoulette
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Author

Made by [@deepxkrana](https://github.com/deepxkrana) | [Instagram](https://instagram.com/deepxkrana)
