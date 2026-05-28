# QueryBot
A very aggressive Anti-Deleo Discord bot for a very Toxic Community
A powerful, modular Discord bot built with `discord.js` v14. It is designed for strict server moderation, persistent user state tracking, and strict anti-abuse enforcement. The system automatically monitors member actions in real time and ensures that penalties or restrictions cannot be bypassed.

## Features

### 1. Persistent Backup System (`backupSystem.js`)
* Automatically backs up member metadata (nicknames, roles, and tags) to a local storage file (`backups.json`) upon joining, updating, or leaving.
* **Leaver Protection:** If a restricted or penalized user leaves the guild and rejoins, the bot instantly restores their exact nicknames and roles, preventing penalty evasion via rejoining.

### 2. Strict Anti-Abuse Tracking (`antiAbuse.js`)
* **Edit-Spam Detection:** Tracks message edits. If an user with the target role changes more than 50% of their message content within 15 seconds of sending, a global timeout is applied. If edited after 15 seconds, specific channel permissions are revoked via overwrites.
* **Delete Protection:** Instant global timeout if a message is deleted within 10 seconds of sending. Tracks mass-deletions using a threshold over a rolling two-minute window to isolate disruptive users from channels completely.

## Setup & Installation

### Prerequisites

* Node.js v18.17.0 or higher
* npm (Node Package Manager)

### Installation

Clone the repository and install the required dependencies:

```bash
npm install

```

### Configuration

Configure your `config.json` in the root directory before launching:

```json
{
  "token": "YOUR_DISCORD_BOT_TOKEN",
  "guildId": "YOUR_TARGET_GUILD_ID",
  "roles": {
    "target": "ROLE_ID_TO_MONITOR",
    "admin": "ADMIN_ROLE_ID_FOR_ALERTS"
  },
  "settings": {
    "deleteThreshold": 5,
    "timeoutDuration": 3600000
  }
}

```

### Gateway Intents

Ensure that your application has the following **Privileged Gateway Intents** toggled **ON** in the Discord Developer Portal:

* `Server Members Intent`
* `Message Content Intent`

### Running the Bot

Start the application using Node.js:

```bash
node index.js

```
