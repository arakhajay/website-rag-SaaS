# Run Application

**Goal**: Start the Next.js development server for the `sitebot` application.

**Inputs**:
- `sitebot/` directory (must have `package.json` and `node_modules` installed).

**Steps**:
1. Check if port 3000 is free (optional, but prevents locks).
2. Navigate to the `sitebot` directory.
3. Run the development server.

**Execution Command**:
- `cd sitebot && npm run dev`

**Troubleshooting**:
- **"Unable to acquire lock" / "Port 3000 in use"**: 
  - Represents an existing zombie process. 
  - Run `netstat -ano | findstr :3000` to find the PID.
  - Run `taskkill /PID <PID> /F` to kill it.
  - Then retry.
