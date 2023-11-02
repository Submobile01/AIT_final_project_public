(__TODO__: Minesweeper with Leaderboard)

# Minesweeper

## Overview

(__TODO__: a brief one or two paragraph, high-level description of your project)

Ever Had fun in your childhood playing Minesweeper? Then this web version is for you! Original Success page, sound effects, and even a help button and leaderboard features. Don't know how to play? No worries, a tutorial page is waiting to serve you! Everything you need for Minesweeper is Here!


## Data Model

(__TODO__: a description of your application's data and their relationships to each other) 

The application will store Users and Game statistics

* users can have multiple games played (via references)
* game statistics

(__TODO__: sample documents)

An Example User:

```javascript
{
  username: "shannonshopper",
  hash:  "an optional password hash",
  IdList: [1, 3, 5, 6]
}
```

An Example Game Statitic:

```javascript
{
  GameId: 1,
  Difficulty: "hard",
  BoardSize: {height:15, width:30}
  clicks: 79,
  timeCompleted: 06/02/2023// timestamp
}
```


## [Link to Commented First Draft Schema](db.mjs) 

(__TODO__: create a first draft of your Schemas in db.mjs and link to it)

## Wireframes

(__TODO__: wireframes for all of the pages on your site; they can be as simple as photos of drawings or you can use a tool like Balsamiq, Omnigraffle, etc.)

/minesweeper- page for the main game

![list create](documentation/minesweeper.JPG)

/minesweeper/tutorial - page for interactive tutorial

![list](documentation/minesweeper-tutorial.JPG)

/minesweeper/leaderboard - page for login/register and leaderboard table

![list](documentation/minesweeper-leaderboard.JPG)

## Site map

(__TODO__: draw out a site map that shows how pages are related to each other)

![list](documentation/path_graph.JPG)

## User Stories or Use Cases

(__TODO__: write out how your application will be used through [user stories](http://en.wikipedia.org/wiki/User_story#Format) and / or [use cases](https://en.wikipedia.org/wiki/Use_case))

1. as non-registered user, I can play the game normally
2. as a user, I can log in to the site
3. as a user, I can view my previous game statistics
4. as a user, I can view and play with the interactive tutorial
5. as a user, I can view the leaderboard containing the top n players

## Research Topics

(__TODO__: the research topics that you're planning on working on along with their point values... and the total points of research topics listed)

* (5 points) react/vue.js to make my frontend of my game look better
    * used one of these technologies as my frontend framework, it's challenging so I've assigned it 5 points
* (4 points) Perform client side form validation using a JavaScript library
    * see <code>cs.nyu.edu/~jversoza/ait-final/my-form</code>
    * if you put in a number that's greater than 5, an error message will appear in the dom
* (5 points) vue.js
    * used vue.js as the frontend framework; it's a challenging library to learn, so I've assigned it 5 points

10 points total out of 8 required points (___TODO__: addtional points will __not__ count for extra credit)


## [Link to Initial Main Project File](app.mjs) 

(__TODO__: create a skeleton Express application with a package.json, app.mjs, views folder, etc. ... and link to your initial app.mjs)

## Annotations / References Used

(__TODO__: list any tutorials/references/etc. that you've based your code off of)

1. [p5.js reference](https://p5js.org/reference/) - (add link to source code that was based on this)
2. [tutorial on vue.js](https://vuejs.org/v2/guide/) - (add link to source code that was based on this)

