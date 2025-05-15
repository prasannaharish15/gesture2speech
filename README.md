# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# Hand Gesture Recognition

A real-time hand gesture recognition application that uses TensorFlow.js and the Handpose model to detect and interpret hand gestures through your webcam.

## Features

- Real-time hand gesture detection
- Speech feedback for recognized gestures
- History tracking of detected gestures
- Debug mode with confidence scores
- Support for two recognition methods: Direct comparison and Fingerpose library
- Admin interface for gesture management

## Technologies Used

- React.js
- TensorFlow.js
- Handpose model
- Fingerpose for gesture detection
- Styled-components for styling
- Web Speech API for voice feedback

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/hand-gesture-recognition.git
   cd hand-gesture-recognition
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

4. Open your browser and navigate to `http://localhost:3000`

## Usage

1. Allow webcam access when prompted
2. Position your hand in front of the webcam
3. Make gestures to see them recognized in real-time
4. Use the buttons to toggle speech feedback, debug mode, or change recognition methods

## License

MIT

## Acknowledgments

- TensorFlow.js team
- Fingerpose library creators
