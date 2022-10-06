const express = require("express");
const app = express();
app.use(express.json());

const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const path = require("path");
const dbpath = path.join(__dirname, "moviesData.db");

let db = null;


// Initialization
const initializeDBAndServer = async() => {
    try {
        db = await open({
            filename: dbpath,
            driver: sqlite3.Database,
        });
        app.listen(3000, () => {
            console.log("Server Running at htt://localhotst:3000");
        });
    } catch(e) {
        console.log(`DBError: ${e.message}`);
    };
};

initializeDBAndServer();


// Convert Movie Id Movie Name, Lead Actor DB Object to Response Object
const convertMovieDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

const convertDirectorDbObjectToResponseObject = (dbObject) => {
    return {
        directorId: dbObject.director_id,
        directorName: dbObject.director_name,
    };
};


// Get All Movies API
app.get("/movies/", async(request, response) => {
    const getmovieNamesQuery = `
    SELECT
      movie_name
    FROM
      movie;`;
    
    const moviesArray = await db.all(getmovieNamesQuery);

    let resultArray = [];
    for (let object of moviesArray){
        let result = convertMovieDbObjectToResponseObject(object);
        resultArray.push(result);
    };

    response.send(resultArray);

});


// Post New Movie API
app.post("/movies/", async(request, response) => {
    const movieDetails = request.body;

    const { directorId, movieName, leadActor } = movieDetails;

    const addMovieQuery = `
    INSERT INTO
      movie (director_id, movie_name, lead_actor)
    VALUES
      ('${directorId}', '${movieName}', '${leadActor}');`;

    const dbResponse = await db.run(addMovieQuery);

    response.send("Movie Successfully Added");
});


// Get Movie by Movie Id API
app.get("/movies/:movieId/", async(request, response) => {
    const { movieId } = request.params;

    const getMovieQuery = `
    SELECT
      *
    FROM
      movie
    WHERE
      movie_id = ${movieId};`;

    const movie = await db.get(getMovieQuery);

    const result = convertMovieDbObjectToResponseObject(movie);
    console.log(result);

    response.send(result);
    
});


// Update Movie by Movie Id API
app.put("/movies/:movieId/", async(request, response) => {
    const { movieId } = request.params;

    const { directorId, movieName, leadActor } = request.body;

    const updateMovieQuery = `
    UPDATE
      movie
    SET
      director_id = '${directorId}',
      movie_name = '${movieName}',
      lead_actor = '${leadActor}'
    WHERE
      movie_id = ${movieId};`;
    
    const movie = await db.run(updateMovieQuery);

    response.send("Movie Details Updated"); 
});


// Delete Movie by Movie Id API
app.delete("/movies/:movieId/", async(request, response) => {
    const { movieId } = request.params;
    
    const deleteMovieQuery = `
    DELETE FROM
      movie
    WHERE
      movie_id = ${movieId};`;

    await db.run(deleteMovieQuery);

    response.send("Movie Removed");
})


// Get Directors API
app.get("/directors/", async(request, response) => {
    const getDirectorsQuery = `
    SELECT
      *
    FROM
      director;`;
    
    const directorsObject = await db.all(getDirectorsQuery);

    let directorsArray = [];
    for (let object of directorsObject) {
        let result = convertDirectorDbObjectToResponseObject(object);
        directorsArray.push(result);
    };

    response.send(directorsArray);
});


// Get Movies by Director Id
app.get("/directors/:directorId/movies/", async(request, response) => {
    const { directorId } = request.params;

    getMoviesListQuery = `
    SELECT
      movie_name
    FROM
      movie
    WHERE
      director_id = ${directorId};`;

    const moviesList = await db.all(getMoviesListQuery);

    const moviesListArray = [];
    for (let object of moviesList) {
        const result = convertMovieDbObjectToResponseObject(object);
        moviesListArray.push(result);
    };
    
    console.log(moviesListArray);
    response.send(moviesListArray);
})


module.exports = app;