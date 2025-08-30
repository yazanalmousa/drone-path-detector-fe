# Drone Path Detector - Frontend

## How to Run the Application

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation & Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/yazanalmousa/drone-path-detector-fe.git
   cd drone-path-detector-fe
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create environment file**

   Create a `.env` file in the root directory and add the following variables:

   ```env
   VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
   VITE_BE_URL=ws://localhost:9013
   ```

4. **Run the application**

   ```bash
   npm run dev
   ```

5. **Open your browser**

   Navigate to `http://localhost:5173` (or the port shown in your terminal)

### Environment Variables

| Variable                   | Description                             | Example               |
| -------------------------- | --------------------------------------- | --------------------- |
| `VITE_MAPBOX_ACCESS_TOKEN` | Mapbox API token for map rendering      | `pk.ey...`            |
| `VITE_BE_URL`              | WebSocket URL for drone data connection | `ws://localhost:9013` |

### Notes

- Make sure your backend server is running on the specified WebSocket URL
- The application will connect to the WebSocket server automatically on startup
- Drone data will be displayed in real-time once the connection is established
