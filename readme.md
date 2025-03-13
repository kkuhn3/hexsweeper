# Hexsweeper

An implementation of [Minesweeper](https://en.wikipedia.org/wiki/Minesweeper_(video_game)), with hexes and some personal experiements. Also hooked up to [Archipelago](https://archipelago.gg/) as a hint game.

## Logistics

Detirmine the counts of things in the game. Including Width, Height, Bombs, and Lifes. Yes, this implementation allows multiple lives.

## "Quality of Life"

I added some additional options that I was curious about. 

### Death Flags

Placed flags will automatically reveal nearby cells if the cell's count is met. For instance:

\[\_\]\[\_\]\[\_\]  
\[\_\]\[3\]\[\_\]  
\[ :triangular_flag_on_post: \]\[ :triangular_flag_on_post: \]\[ \]

Placeing a Flag(:triangular_flag_on_post:) on the bottom right cell will reveal all other cells. As the "3" then has 3 flags around it. 

\[0\]\[0\]\[0\]  
\[2\]\[3\]\[2\]  
\[ :triangular_flag_on_post: \]\[ :triangular_flag_on_post: \]\[ :triangular_flag_on_post: \]

This can cause the player to explode. If this flag was misplaced, the bomb would be revealed. 

### Can't Count

Cells around a number will be flagged automatically if only those cells remain. For instance:

\[0\]\[0\]\[0\]  
\[2\]\[3\]\[2\]  
\[\_\]\[\_\]\[\_\]

The bottom 3 cells would all have a flag added, as the "3" has no other neighbors where those flags can be. Resulting in:

\[0\]\[0\]\[0\]  
\[2\]\[3\]\[2\]  
\[ :triangular_flag_on_post: \]\[ :triangular_flag_on_post: \]\[ :triangular_flag_on_post: \]

This cannot cause the player to explode, but may cause a chain reaction with `Death Flags`.

## Shape

Detiremines the shape of the cells. More neighbors is generally easier. Triangles, Squares, and Hexagons are the only `Regular` shapes that `Tessellate`. 

## Archipelago

### Name

The slot's name.

### Port

The port of the room. 

### Password

Optionally, the password of the room

### DeathLink

Optionally, send and recieve `DeathLink`s. This may result in the player losing due to annother game, and vice versa.
