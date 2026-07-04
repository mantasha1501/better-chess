# 🃏 CHESS // PSYCHEDELIC EDITION

An arcade-inspired chess engine utilizing an advanced positional matrix system paired with an Alpha-Beta Minimax structural lookahead pipeline. The visual interface heavily honors retro tactical deckbuilding simulators, embedding high-contrast telemetry inside a responsive CRT cabinet wrapper.

## 🕹️ Live Demo
Deploy your custom live page link here: **https://mantasha1501.github.io/better-chess/**

---

## 🎨 Layout Specifications & Theme Architecture

The visual layout maps cleanly onto a 3-column tactical telemetry arrangement built strictly around structural boundaries.

### 1. Grid Canvas Box (The Table Well)
* **Dimensions:** Contained within a `480px` maximum width boundary locked to a rigid `1 / 1` proportional square aspect ratio.
* **Cell Matrix:** Uses native `grid-template-columns: repeat(8, 1fr)` to form an uncompromised 64-square layout canvas.
* **Aesthetics:** Styled with deep `#1b3322` felt values and `#2c4c38` alignment tiles, wrapped inside an explicit 6px structural bezel box (`#2d2d38`).

### 2. Left Sidebar (Modifiers & Controls)
* **Brand Plate:** Tilted at a precise `-1deg` structural rotatory vector to echo handheld trading card layouts. Uses heavy-impact uppercase headers with severe offsets drop shadows.
* **Modifier Switches:** Includes custom state anchors (`#modePVP` and `#modeCPU`) powered by dedicated interactive style layers (`--btn-blue` / `--btn-dark`).
* **Deck Control:** Features a bright `#f0932b` emergency setup restoration utility for cold structural match rerolls.

### 3. Right Sidebar (Terminal & Feed Logs)
* **Telemetry Core:** Monitors overall system match metrics. Dynamically shifts states into strict high-contrast warning fields during active alerts (`.status-red` / `.status-green`).
* **Run Log Stream:** A micro-terminal logging window restricted to a clean vertical overflow scroll. Collects all real-time FIDE operational notations.

---

## ⚙️ Core Mechanics & Engine Specifications

This build fully implements standard FIDE constraints seamlessly wrapped into a lightweight single-file state machine:
* **Castling Protection Matrix:** Validates structural clearing across empty spaces while ensuring king vector points are completely clear of enemy lines of attack.
* **En Passant Vectors:** Dynamically sets active target coordinates immediately following any double-step pawn initialization.
* **Pawn Promotion Logic:** Automatically converts advanced rank pawns to queens upon hitting row limits.
* **Position Matrix Evaluators:** Utilizes specialized Piece-Square Tables (PST) that assign positional weights depending on tactical positioning on the board.
* **Alpha-Beta Search Algorithm:** Features a deep computer assistant with multi-ply search vectors, offering scaling processing filters from Lvl 01 up to Lvl 03 search horizons.
