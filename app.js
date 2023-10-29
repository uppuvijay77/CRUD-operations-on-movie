const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

//API 1 get all books
app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `SELECT movie_name FROM movie ORDER BY movie_id;`;
  const booksArray = await db.all(getMoviesQuery);
  response.send(booksArray);
});

// API 2 add movie
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;

  const updateMoviesQuery = `
    INSERT INTO movie (director_id, movie_name, lead_actor)
    VALUES ( ${directorId}, '${movieName}', '${leadActor}' );`;

  await db.run(updateMoviesQuery);
  response.send("Movie Successfully Added");
});

// API 3 get one movie
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
  SELECT * 
  FROM movie 
  WHERE movie_id = ${movieId};`;
  const movie = await db.get(getMovieQuery);
  response.send(movie);
});

// API 4 UPDATE MOVIE
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;

  const updateMoviesQuery = `
    UPDATE movie 
    SET
     director_id = ${directorId},
     movie_name = '${movieName}',
     lead_actor = '${leadActor}'
    WHERE movie_id = ${movieId};`;

  await db.run(updateMoviesQuery);
  response.send("Movie Details Updated");
});

//API 5 DELETE FROM MOVIE
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteQuery = `
    DELETE FROM movie
    WHERE movie_id = ${movieId};`;
  await db.run(deleteQuery);
  response.send("Movie Removed");
});

//API 6 GET ALL DIRECTORS
app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
    SELECT * 
    FROM director
    ORDER BY director_id;`;
  const directorsArray = await db.all(getDirectorsQuery);
  response.send(directorsArray);
});

// API 7 GET ONE DIRECTOR MOVIES
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMoviesQuery = `
    SELECT *
    FROM movie
    WHERE director_id = ${directorId};`;
  const directorMovieArray = await db.all(getDirectorMoviesQuery);
  response.send(directorMovieArray);
});

module.exports = app;
