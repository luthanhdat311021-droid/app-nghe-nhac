"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const env_1 = require("./config/env");
const PORT = env_1.env.PORT || 5000;
app_1.app.listen(PORT, () => {
    console.log(`🎵 MusicWave Backend Server running on http://localhost:${PORT}`);
});
