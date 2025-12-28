# How to Start the Server

## Quick Start

1. **Open a terminal/command prompt in the project directory**

2. **Start the server:**
   ```bash
   npm run server
   ```

3. **You should see:**
   ```
   🚀 Sync Server running on http://0.0.0.0:3001
   📡 Accessible from network at http://10.177.156.54:3001
   📁 Data file: C:\Users\balaj\OneDrive\Desktop\sampu\PD1\server-data.json
   ```

4. **Keep this terminal open** - the server needs to keep running

5. **In another terminal, start the React app:**
   ```bash
   npm run dev
   ```

## Verify Server is Running

Open your browser and go to:
- `http://localhost:3001/api/health`

You should see:
```json
{"status":"ok","timestamp":"2025-11-23T..."}
```

## Troubleshooting

### If you see "ERR_CONNECTION_REFUSED":
1. Make sure the server is running (`npm run server`)
2. Check that port 3001 is not blocked by firewall
3. Try accessing `http://localhost:3001/api/health` in your browser

### If server won't start:
1. Make sure you installed dependencies: `npm install`
2. Check if port 3001 is already in use
3. Look for error messages in the terminal

### To stop the server:
Press `Ctrl+C` in the terminal where the server is running

