# Visualisation Timelord

Integrates URY's Node-Timelord into Roses-Graphics to create a automated and interactive holding card for Live Streaming. Very much a "bodge" ish.

## Features
- Displays current URY show (or custom with forced epoch time): title, description, credits and image
- Shows currently playing music, where available
- Ability to play video background
- Custom message options for "Coming soon...", "Thanks for watching", etc...)

## Improvements to be made
- Everything pretty much works, bar the date/time force box being epoch time, rather than a nice popup.

- Chrome gets a bit annoying with autoplaying video, you may have to right click in the graphics window to show video controls and play manually before hiding controls again.

## Launching Graphics

### Installation
Install node.js (anything 7-11 seems to work at time of writing)

Run ```npm update``` followed by ```npm install```.

### Windows
Double click
```
./startup.bat
```

For the [admin](http://127.0.0.1:3000/admin) page, navigate to http://127.0.0.1:3000/admin

For the [graphics](http://127.0.0.1:3000) output, navigate to http://127.0.0.1:3000

### Linux / Mac
Run from the directory this readme is in:
```
node server.js
```

For the [admin](http://127.0.0.1:3000/admin) page, navigate to http://127.0.0.1:3000/admin

For the [graphics](http://127.0.0.1:3000) output, navigate to http://127.0.0.1:3000
