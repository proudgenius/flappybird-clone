# Flappy Bird Clone

A simple Flappy Bird clone built with HTML5 Canvas and JavaScript. This game works on both desktop and mobile browsers.

![flappybirdclone-demo](https://github.com/user-attachments/assets/92588ab3-e109-4fe1-b814-2b370d9b6130)


## How to Play

1. Open `index.html` in your web browser
2. Click the "Start Game" button
3. Tap or click to make the bird flap
4. Navigate through the pipes without hitting them
5. Try to get the highest score possible!

## Controls

- **Flapping**:
  - **Desktop**: Click with mouse or press Space bar
  - **Mobile**: Tap the screen
- **Music**: Click the sound icon in the top-right corner to toggle music on/off
- **Restart**: Click "Play Again" button after game over
- **Reset Score**: Click "Reset Best Score" button on the game over screen

## Features

- High-resolution pixel art graphics with SVG-like rendering
- Responsive design (works on all screen sizes)
- Score tracking with high score saved to local storage
- Sound effects and background music with mute/unmute controls
- Game states (start, playing, game over)
- Multiple color schemes that change randomly on restart
- Day/night cycle with smooth transitions
- Parallax scrolling for clouds and ground
- Credits displayed on both start and game over screens
- Optimized for both desktop and mobile browsers

## Implementation Details

This game is built using:
- HTML5 Canvas for rendering with custom SVG-like drawing
- Vanilla JavaScript for game logic and animations
- CSS for responsive layout and UI elements
- Web Audio API for sound effects and background music
- Custom color interpolation for day/night cycle transitions
- Parallax scrolling for depth effect

No external libraries or frameworks were used.

## Project Structure

```
flappy-bird/
├── index.html         # Main HTML file
├── styles.css         # CSS for layout and responsive design
├── game.js            # Main game logic
└── README.md          # This file
```

## Future Improvements

Potential enhancements for the future:
- Add more detailed pixel art graphics and animations
- Implement different difficulty levels
- Add medals/achievements based on score
- Add power-ups and special abilities
- Implement a leaderboard system
- Add different bird characters to choose from
- Create additional obstacle types beyond pipes
- Add weather effects (rain, snow, fog)

## Credits

- **Original Game**: Flappy Bird by Dong Nguyen
- **Implementation**: Cristian Jimenez
- **Music System**: Custom implementation using Web Audio API
- **Graphics**: Custom pixel art with SVG-like rendering
- **Color Schemes**: Inspired by color theory principles (original, monochromatic, analogous, complementary, triadic, split-complementary, and tetradic)
