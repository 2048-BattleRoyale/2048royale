# Phases of command to move the board

1. Can the tiles be scooted in that direction?
  a. For all tiles owned by the player, move them as far as possible
2. Are there adjacent tiles that can be merged?
  a. For all tiles owned by the player, merge adjacent tiles, working backwards through the "collision front"

Function will return the change list (*moves and mergers*) to the function that communicates back with the client
