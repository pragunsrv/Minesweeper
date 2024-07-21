# Minesweeper Game

## Overview

This project is an advanced version of the classic Minesweeper game, featuring a modern UI, various difficulty levels, custom settings, and additional game functionalities. The game provides a fully interactive Minesweeper experience, complete with saving/loading game states, hints, and a timer.

## Features

- **Difficulty Levels**: Easy, Medium, Hard, and Custom.
- **Custom Settings**: Configure grid size and bomb count.
- **Hints**: Reveal a random cell to assist in gameplay.
- **Undo/Redo**: Manage game moves.
- **Save/Load**: Save and load game states.
- **Timer**: Track time spent in the game.
- **Themes**: Switch between light and dark themes.
- **Responsive Design**: Adaptable to different screen sizes.
- **Game Over Handling**: Reveal all bombs and end the game when a bomb is clicked.

## Installation

1. Clone the repository:

    ```bash
    git clone <repository-url>
    ```

2. Navigate to the project directory:

    ```bash
    cd <project-directory>
    ```

3. Open `index.html` in your web browser to start playing the game.

## Usage

1. **Start a Game**: Choose a difficulty level or configure custom settings to start a new game.
2. **Gameplay**: Click on cells to reveal them. Right-click to flag cells you suspect contain bombs.
3. **Hints**: Click the Hint button to reveal a random cell (limited usage).
4. **Undo/Redo**: Use the Undo and Redo buttons to manage your moves.
5. **Save/Load**: Save your game progress and load it later using the respective buttons.
6. **Custom Settings**: Use the Custom Settings section to specify your own grid size and bomb count.
7. **Themes**: Change the game’s appearance using the theme selector.

## Files

- **`index.html`**: The main HTML file containing the structure of the game.
- **`style.css`**: The CSS file for styling the game and its elements.
- **`script.js`**: The JavaScript file implementing game logic and functionalities.

## Code Snippets

### JavaScript (`script.js`)

The core game logic, including:
- Initialization and board creation
- Bomb placement
- Cell revealing and flagging
- Game state management (win/loss)
- Timer and score tracking
- Save/load functionality

### CSS (`style.css`)

Styling for:
- Game grid
- Buttons
- Themes
- Responsive design

### HTML (`index.html`)

The layout of the game, including:
- Grid container
- Control buttons
- Status display
- Custom settings section

## Contributing

Feel free to fork the repository, make improvements, and submit pull requests. For any issues or feature requests, please open an issue on GitHub.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgements

- Inspired by the classic Minesweeper game.
- Contributions from the open-source community for advanced UI features and game mechanics.
