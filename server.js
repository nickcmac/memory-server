const express = require('express');
const mysql = require('mysql2');

const app = express();
app.use(express.static('public'));
app.use(express.json());

// MySQL connection configuration
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'game'
});

// Connect to MySQL
connection.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// API endpoint to register a user
app.post('/register', (req, res) => {
  const { username, score } = req.body;

  // Check if the username already exists in the database
  const checkQuery = 'SELECT * FROM users WHERE username = ?';
  connection.query(checkQuery, [username], (err, results) => {
    if (err) {
      console.error('Error checking username:', err);
      res.sendStatus(500);
      return;
    }

    if (results.length > 0) {
      // Username already exists, update the score
      const userId = results[0].userID;
      const updateQuery = 'UPDATE scores SET score = ? WHERE userID = ?';
      connection.query(updateQuery, [score, userId], (err, results) => {
        if (err) {
          console.error('Error updating score:', err);
          res.sendStatus(500);
          return;
        }
        console.log(`Score updated for username: ${username}`);
        res.sendStatus(200);
      });
    } else {
      // Username doesn't exist, create a new entry
      const insertQuery = 'INSERT INTO users (username) VALUES (?)';
      connection.query(insertQuery, [username], (err, results) => {
        if (err) {
          console.error('Error creating new user:', err);
          res.sendStatus(500);
          return;
        }

        const userId = results.insertId;
        const insertScoreQuery = 'INSERT INTO scores (score, userID) VALUES (?, ?)';
        connection.query(insertScoreQuery, [score, userId], (err, results) => {
          if (err) {
            console.error('Error creating new score:', err);
            res.sendStatus(500);
            return;
          }
          console.log(`New user registered: username: ${username}, score: ${score}`);
          res.sendStatus(200);
        });
      });
    }
  });
});
// API endpoint to retrieve top scores
app.get('/topscores', (req, res) => {
  const topScoresQuery = 
  `
    SELECT scores.score, users.username
    FROM scores
    JOIN users ON scores.userID = users.userID
    ORDER BY scores.score DESC
    LIMIT 10
  `;
  connection.query(topScoresQuery, (err, results) => {
    if (err) {
      console.error('Error retrieving top scores:', err);
      res.sendStatus(500);
      return;
    }
    console.log('Retrieved top scores:', results);
    res.json(results);
  });
});


// Start the server
const port = 8080;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
