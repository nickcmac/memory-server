// JavaScript
const timerElement = document.getElementById('timer');
const scoreElement = document.getElementById('score');
const bestScoreElement = document.getElementById('best-score');
const startButton = document.getElementById('start-button');
const resetButton = document.getElementById('reset-button');


let hasFlippedCard = false;
let lockBoard = false;
let firstCard, secondCard;
let score = 0;
let timer = 60;
let timerInterval;
let matches = 0;
let selectedCards = [];
let bestScore = localStorage.getItem('bestScore') || 0;




startButton.addEventListener('click', startGame);
resetButton.addEventListener('click', resetGame);
bestScoreElement.textContent = `Best Score: ${bestScore}`;


function startGame() {
  startButton.disabled = true;
  selectedCards = selectRandomCards(6); // Pass the number of cards to select
  const pairedCards = createCardPairs(selectedCards); // Create pairs for each unique card
  const combinedCards = shuffleCards([...pairedCards]); // Shuffle the combined pairs
  deployCards(combinedCards); // Deploy the shuffled pairs to the HTML elements
  startTimer();
}

function resetGame() {
  resetBoardAndShuffle();
  score = 0;
  timer = 60;
  matches = 0;
  scoreElement.textContent = `Score: ${score}`;
  timerElement.textContent = `Timer: ${timer}`;
  stopTimer();
  startButton.disabled = false; // Enable the start button

  scoreElement.classList.remove('blue', 'teal', 'purple');
  timerElement.classList.remove('low'); // Reset timer color
}

function selectRandomCards(numCards) {
  const shuffledCards = extraCards.sort(() => Math.random() - 0.5);
  return shuffledCards.slice(0, numCards);
}

function createCardPairs(cards) {
  const pairedCards = [];
  for (let i = 0; i < cards.length; i++) {
    pairedCards.push(cards[i], cards[i]);
  }
  return pairedCards;
}

function shuffleCards(cards) {
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]]; // Swap elements to shuffle the array
  }
  return cards;
}

function deployCards(cards) {
  const memoryCards = document.querySelectorAll('.memory-card');
  cards.forEach((card, index) => {
    const frontImgUrl = card.imgUrl;
    const pokemonName = card.name;
    const cardElement = memoryCards[index];

    cardElement.dataset.pokemon = pokemonName;
    cardElement.querySelector('.front-face').src = frontImgUrl;
    cardElement.querySelector('.front-face').alt = pokemonName;
    cardElement.classList.remove('flip'); // Ensure cards start unflipped
    cardElement.addEventListener('click', flipCard);
  });
}

function flipCard() {
  if (lockBoard) return;
  if (this === firstCard) return;

  this.classList.add('flip');

  if (!hasFlippedCard) {
    hasFlippedCard = true;
    firstCard = this;
    return;
  }

  secondCard = this;
  checkForMatch();
}

function checkForMatch() {
  let isMatch = firstCard.dataset.pokemon === secondCard.dataset.pokemon;

  if (isMatch) {
    matches++; // Increment the matches variable
    disableCards();
    // Reset hasFlippedCard and firstCard variables
  } else {
    unflipCards();
  }
}


function disableCards() {
  firstCard.removeEventListener('click', flipCard);
  secondCard.removeEventListener('click', flipCard);
  incrementScore();

  if (matches === 6) {
    setTimeout(resetBoardAndShuffle, 500);
  } else {
    resetBoard();
  }
}

function unflipCards() {
  lockBoard = true;

  setTimeout(() => {
    firstCard.classList.remove('flip');
    secondCard.classList.remove('flip');

    resetBoard();
  }, 800);
}

function resetBoard() {
  [hasFlippedCard, lockBoard] = [false, false];
  [firstCard, secondCard] = [null, null];
}

function resetBoardAndShuffle() {
  resetBoard();
  matches = 0;
  selectedCards = selectRandomCards(6); // Generate new set of randomly selected cards
  const pairedCards = createCardPairs(selectedCards); // Create pairs for each unique card
  const combinedCards = shuffleCards([...pairedCards]); // Shuffle the combined pairs
  deployCards(combinedCards); // Deploy the shuffled pairs to the HTML elements
}

// Function to update the color of the score based on different thresholds
function updateScoreColor() {
  scoreElement.textContent = `Score: ${score}`;

  scoreElement.classList.remove('blue', 'teal', 'purple', 'gold','rainbow');

  if (score >= 6 && score < 12) {
    scoreElement.classList.add('blue');
  } else if (score >= 12 && score < 16) {
    scoreElement.classList.add('teal');
  } else if (score >= 16 && score < 18) {
    scoreElement.classList.add('purple');
  } else if (score >= 18 && score < 20) {
    scoreElement.classList.add('gold');
  } else if (score >= 20) {
    scoreElement.classList.add('rainbow');
    
  }
  
}

function incrementScore() {
  score++;
  updateScoreColor();
}

function startTimer() {
  timerInterval = setInterval(() => {
    timer--;
    timerElement.textContent = `Timer: ${timer}`; //Gets the timer = time from top ^

    if (timer <= 10) {
      timerElement.classList.add('low');
      timerElement.classList.add('flashing');
    }

    if (timer === 0) {
      clearInterval(timerInterval);
      stopGame();
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function stopGame() {
  lockBoard = true;
  resetButton.disabled = false;
  startButton.disabled = true;
  resetButton.classList.add('disabled');
  timerElement.classList.remove('flashing');
  removeEventListener('click',flipCard);

  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem('bestScore', bestScore); // Save the best score to localStorage
  }

  
  // Display the score and prompt for the username
  alert('Your score: ' + score);
  const username = prompt('Please enter your username:');
  if (username) {
    // Send the username and score to the server
    const data = { username, score };
    fetch('/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
      .then(response => {
        if (response.ok) {
          // Score successfully registered
          alert('Score registered successfully!');
        } else {
          // Error registering the score
          alert('Failed to register the score.');
        }
      })
      .catch(error => {
        console.error('Error registering the score:', error);
        alert('An error occurred while registering the score.');
      });
  } else {
    // User canceled or didn't enter a username
    alert('Username is required to register the score.');
  }

  bestScoreElement.textContent = `Best Score: ${bestScore}`;

  // Display final score or perform any other actions you want.
  var logElement = document.getElementById('log');
  var logMessage = `Game Over! Final Score: ${score}`;
  logElement.textContent = logMessage;
  console.log(logMessage);
  
}



/*
const bestScoresList = document.getElementById('best-scores-list');
const bestScores = [];

function updateBestScores() {
  bestScoresList.innerHTML = ''; // Clear the list

  bestScores.forEach(score => {
    const li = document.createElement('li');
    li.textContent = score;
    bestScoresList.appendChild(li);
  });
}

// Add a function to update the best scores array
function addBestScore(score) {
  bestScores.push(score);
  updateBestScores();
}

// Call addBestScore() with a sample score to test
addBestScore(); // Add a score of 100 to the best scores array



/*
{ id: , name: "", imgUrl: "images" },
{ id: , name: "", imgUrl: "images" },
{ id: , name: "", imgUrl: "images" },
{ id: , name: "", imgUrl: "images" },
*/


//The "Old" file group
const extraCards = [
  { "id": 1, name: "Aipom", imgUrl: "images/old/Aipom.MT.70.webp" },
  { "id": 2, name: "Articuno", imgUrl: "images/old/Articuno.FO.17.webp" },
  { "id": 3, name: "Baltoy", imgUrl: "images/old/Baltoy.DX.53.webp" },
  { "id": 4, name: "Banette", imgUrl: "images/old/Banette.HL.1.webp" },
  { "id": 5, name: "Barboach", imgUrl: "images/old/Barboach.DX.54.webp" },
  { "id": 6, name: "Beedrill", imgUrl: "images/old/Beedrill.BS.17.webp" },
  { "id": 7, name: "Bill", imgUrl: "images/old/Bill.BS.91.webp" },
  { "id": 8, name: "Blastoise", imgUrl: "images/old/Blastoise.BS.2.webp" },
  { "id": 9, name: "Charizard", imgUrl: "images/old/Charizard.BS.4.webp" },
  { "id": 10, name: "Charmander", imgUrl: "images/old/Charmander.RG.113.webp" },
  { "id": 11, name: "Chingling", imgUrl: "images/old/Chingling.MT.42.webp" },
  { "id": 12, name: "Dark-Alakazam", imgUrl: "images/old/Dark-Alakazam.TR.1.webp" },
  { "id": 13, name: "Dark-Vileplume", imgUrl: "images/old/Dark-Vileplume.TR.13.webp" },
  { "id": 14, name: "Dewgong", imgUrl: "images/old/Dewgong.BS.25.webp" },
  { "id": 15, name: "Ditto", imgUrl: "images/old/Ditto.FO.3.webp" },
  { "id": 16, name: "Dragonair", imgUrl: "images/old/Dragonair.BS.18.webp" },
  { "id": 17, name: "Dragonite", imgUrl: "images/old/Dragonite.FO.19.webp" },
  { "id": 19, name: "Dratini", imgUrl: "images/old/Dratini.BS.26.webp" },
  { "id": 20, name: "Electrode", imgUrl: "images/old/Electrode.BS.21.webp" },
  { "id": 21, name: "Gyarados", imgUrl: "images/old/Gyarados.BS.6.webp" },
  { "id": 22, name: "Happiny", imgUrl: "images/old/Happiny.MT.52.webp" },
  { "id": 23, name: "Haunter", imgUrl: "images/old/Haunter.BS.29.webp" },
  { "id": 24, name: "Ivysaur", imgUrl: "images/old/Ivysaur.BS.30.webp" },
  { "id": 25, name: "Lapras", imgUrl: "images/old/Lapras.FO.25.webp" },
  { "id": 26, name: "Lunatone", imgUrl: "images/old/Lunatone.DX.36.webp" },
  { "id": 27, name: "Magby", imgUrl: "images/old/Magby.MT.88.webp" },
  { "id": 28, name: "Magcargo", imgUrl: "images/old/Magcargo.DX.20.webp" },
  { "id": 29, name: "Manectric", imgUrl: "images/old/Manectric.DX.38.webp" },
  { "id": 30, name: "Mewtwo", imgUrl: "images/old/Mewtwo.BS.10.webp" },
  { "id": 31, name: "Minun", imgUrl: "images/old/Minun.DX.41.webp" },
  { "id": 32, name: "Mismagius", imgUrl: "images/old/Mismagius.DP.10.webp" },
  { "id": 33, name: "Moltres", imgUrl: "images/old/Moltres.FO.27.webp" },
  { "id": 34, name: "Ninetales", imgUrl: "images/old/Ninetales.BS.12.webp" },
  { "id": 35, name: "Numel", imgUrl: "images/old/Numel.DX.68.webp" },
  { "id": 36, name: "Onix", imgUrl: "images/old/Onix.BS.56.webp" },
  { "id": 37, name: "Paras", imgUrl: "images/old/Paras.RG.72.webp" },
  { "id": 38, name: "Plusle", imgUrl: "images/old/Plusle.DX.44.webp" },
  { "id": 39, name: "Poliwhirl", imgUrl: "images/old/Poliwhirl.BS.38.webp" },
  { "id": 40, name: "Professor-Oak", imgUrl: "images/old/Professor-Oak.BS.88.webp" },
  { "id": 41, name: "Raichu", imgUrl: "images/old/Raichu.BS.14.webp" },
  { "id": 42, name: "Shedinja", imgUrl: "images/old/Shedinja.DX.14.webp" },
  { "id": 43, name: "Slugma", imgUrl: "images/old/Slugma.DX.75.webp" },
  { "id": 44, name: "Snover", imgUrl: "images/old/Snover.MT.101.webp" },
  { "id": 45, name: "Spheal", imgUrl: "images/old/Spheal.MT.102.webp" },
  { "id": 46, name: "Starmie", imgUrl: "images/old/Starmie.BS.64.webp" },
  { "id": 47, name: "Tangela", imgUrl: "images/old/Tangela.BS.66.webp" },
  { "id": 48, name: "Tropius", imgUrl: "images/old/Tropius.DX.27.webp" },
  { "id": 49, name: "Uxie", imgUrl: "images/old/Uxie.MT.18.webp" }, 
  { "id": 52, name: "Voltorb", imgUrl: "images/old/Voltorb.BS.67.webp" },
  { "id": 53, name: "Vulpix", imgUrl: "images/old/Vulpix.BS.68.webp" },
  { "id": 54, name: "Wailord", imgUrl: "images/old/Wailord.CEC.46.30765.webp" },
  { "id": 55, name: "Whiscash", imgUrl: "images/old/Whiscash.DX.28.webp" },
  { "id": 57, name: "Zapdos", imgUrl: "images/old/Zapdos.BS.16.webp" }
];




/*
//THe High Res Data set for pokemon
[
  { "id": 1, "name": "Blissey", "imgUrl": "images/res/Blissey.SV1EN.145.47199.webp" },
  { "id": 2, "name": "Breloom", "imgUrl": "images/res/Breloom.SV1EN.4.47076.webp" },
  { "id": 3, "name": "Buizel", "imgUrl": "images/res/Buizel.SV1EN.46.47114.webp" },
  { "id": 4, "name": "Cacnea", "imgUrl": "images/res/Cacnea.SV1EN.5.47077.webp" },
  { "id": 5, "name": "Cacturne", "imgUrl": "images/res/Cacturne.SV1EN.6.47078.webp" },
  { "id": 6, "name": "Chansey", "imgUrl": "images/res/Chansey.SV1EN.144.47198.webp" },
  { "id": 7, "name": "Croagunk", "imgUrl": "images/res/Croagunk.SV1EN.130.47187.webp" },
  { "id": 8, "name": "Drifblim", "imgUrl": "images/res/Drifblim.SV1EN.90.47152.webp" },
  { "id": 9, "name": "Drifloon", "imgUrl": "images/res/Drifloon.SV1EN.89.47151.webp" },
  { "id": 10, "name": "Flaaffy", "imgUrl": "images/res/Flaaffy.SV1EN.67.47131.webp" },
  { "id": 11, "name": "Floatzel", "imgUrl": "images/res/Floatzel.SV1EN.47.47115.webp" },
  { "id": 12, "name": "Forretress", "imgUrl": "images/res/Forretress.SV1EN.139.47194.webp" },
  { "id": 13, "name": "Grimer", "imgUrl": "images/res/Grimer.SV1EN.126.47183.webp" },
  { "id": 14, "name": "Houndoom", "imgUrl": "images/res/Houndoom.SV1EN.34.47104.webp" },
  { "id": 15, "name": "Houndour", "imgUrl": "images/res/Houndour.SV1EN.33.47103.webp" },
  { "id": 16, "name": "Kirlia", "imgUrl": "images/res/Kirlia.SV1EN.85.47147.webp" },
  { "id": 17, "name": "Lucario", "imgUrl": "images/res/Lucario.SV1EN.114.47173.webp" },
  { "id": 18, "name": "Mankey", "imgUrl": "images/res/Mankey.SV1EN.107.47167.webp" },
  { "id": 19, "name": "Mareep", "imgUrl": "images/res/Mareep.SV1EN.66.47130.webp" },
  { "id": 20, "name": "Medicham", "imgUrl": "images/res/Medicham.SV1EN.111.47170.webp" },
  { "id": 21, "name": "Meditite", "imgUrl": "images/res/Meditite.SV1EN.110.47169.webp" },
  { "id": 22, "name": "Muk", "imgUrl": "images/res/Muk.SV1EN.127.47184.webp" },
  { "id": 23, "name": "Pachirisu", "imgUrl": "images/res/Pachirisu.SV1EN.68.47132.webp" },
  { "id": 24, "name": "Primeape", "imgUrl": "images/res/Primeape.SV1EN.108.47168.webp" },
  { "id": 25, "name": "Riolu", "imgUrl": "images/res/Riolu.SV1EN.112.47171.webp" },
  { "id": 26, "name": "Seviper", "imgUrl": "images/res/Seviper.SV1EN.128.47185.webp" },
  { "id": 27, "name": "Shroomish", "imgUrl": "images/res/Shroomish.SV1EN.3.47022.webp" },
  { "id": 28, "name": "Slowpoke", "imgUrl": "images/res/Slowpoke.SV1EN.42.47111.webp" },
  { "id": 29, "name": "Spiritomb", "imgUrl": "images/res/Spiritomb.SV1EN.129.47186.webp" },
  { "id": 30, "name": "Starly", "imgUrl": "images/res/Starly.SV1EN.148.47202.webp" },
  { "id": 31, "name": "Torkoal", "imgUrl": "images/res/Torkoal.SM1.23.13585.webp" }
]

*/

function Hello() {
  alert("Hello!\n -To start the game please click the 'START GAME' button.\n\n -The rules are simple, match the card pairs and gain points, gather as many points as possible within 60 seconds!\n\n Have fun!!");
}
/*
fetch('/topscores')
  .then(response => response.json())
  .then(data => {
    const topScoresBody = document.getElementById('leaderboard-table').getElementsByTagName('tbody')[0];
    topScoresBody.innerHTML = ''; // Clear any existing rows

    const glowingScoreThreshold = 20; // Define the score threshold for glowing

    data.forEach((score, index) => {
      const row = document.createElement('tr');

      // Create table cells for Username and Score
      const usernameCell = document.createElement('td');
      usernameCell.textContent = score.username;
      row.appendChild(usernameCell);

      const scoreCell = document.createElement('td');
      scoreCell.textContent = score.score;
      
      // Add glowing class if the score is above the threshold
      if (score.score > glowingScoreThreshold) {
        scoreCell.classList.add('glowing-score');
      }

      row.appendChild(scoreCell);

      // Append the row to the table body
      topScoresBody.appendChild(row);
    });
  })
  .catch(error => console.error('Error:', error));
*/