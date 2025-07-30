document.addEventListener("DOMContentLoaded", function() {
    
    var playerName = prompt("Enter your name:");
    var toggleScoreBoardButton = document.querySelector('.scoreButton');
    var playButton = document.querySelector('.playButton');
    var scoreboard = document.querySelector('.scoreboard');
    var nameButton = document.querySelector('.nameButton');
    var startTime, endTime;
    var gridContainer = document.querySelector('.grid-container');
    var pairsRevealed = 0;
    var letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'];
    var isRevealingAllPairs = false; 
    var isNameChangeAllowed = true;
    var timerStarted = false;
    var lastClicked;
    
    function startTimer() {
        startTime = new Date();
        timerStarted = true;
    }

    function stopTimer() {
        endTime = new Date();
        var timeTaken = (endTime - startTime) / 1000; 
        updateLeaderboard(playerName, timeTaken);
    }

    toggleScoreBoardButton.addEventListener('click', function() {
        scoreboard.classList.toggle('hidden');
    });
    
    letters = shuffleArray(letters);
    for (var i = 0; i < letters.length; i++) {
        var gridItem = document.createElement('div');
        gridItem.className = 'grid-item';
        gridItem.dataset.letter = letters[i];
        gridContainer.appendChild(gridItem);
        gridItem.addEventListener('click', revealLetter);
    }

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Q' && !isRevealingAllPairs) {
            isRevealingAllPairs = true;
            revealAllPairs();
        }
    });
    playButton.addEventListener('click', function(event) {
        resetGame();
    });
    nameButton.addEventListener('click', function(event) {
        if(isNameChangeAllowed){
            playerName = prompt("Enter your name:");
        }
    });
    
    function resetGame() {
        // Remove all letters from the grid
        var gridItems = document.querySelectorAll('.grid-item');
        gridItems.forEach(function(item) {
            item.textContent = '';
            item.style.opacity = 1;
            item.classList.remove('revealed'); 
        });
    
        letters = shuffleArray(letters);
        pairsRevealed = 0;
        selectedItems = [];
        isTimeoutActive = false;
        timerStarted = false;
        isFirstClick = true;
        isNameChangeAllowed = true;

        gridItems.forEach(function(item, index) {
            item.dataset.letter = letters[index];
        });
        playButton.classList.remove('play-again');
    }
    var selectedItems = [];
    var isTimeoutActive = false;

    function revealLetter(event) {
        var clickedItem = event.target;
        if (isRevealingAllPairs) {
            return; 
        }
        if (!timerStarted) {
            startTimer();
            isNameChangeAllowed = false;
        }
        if (clickedItem.textContent !== '' || selectedItems.includes(clickedItem) || isTimeoutActive) {
            return;
        }
        clickedItem.style.opacity = 0;

        setTimeout(function() {
            clickedItem.textContent = clickedItem.dataset.letter;
            clickedItem.style.opacity = 1;
        }, 300);
        lastClicked = clickedItem;
        selectedItems.push(clickedItem);

        if (selectedItems.length === 2) {
            if (selectedItems[0].dataset.letter === selectedItems[1].dataset.letter) {
                selectedItems.forEach(function (item) {
                    item.classList.add('revealed');
                });
                selectedItems = [];
                pairsRevealed++;
                if (pairsRevealed === letters.length / 2) {
                    stopTimer();
                }
            } else {
                isTimeoutActive = true;
                setTimeout(function() {
                    selectedItems.forEach(function(item) {
                        item.textContent = '';
                    });
                    selectedItems = [];
                    isTimeoutActive = false;
                }, 1000);
            }
        }
    }

    function revealAllPairs() {
        if (!timerStarted) {
            startTimer();
            isNameChangeAllowed = false;
        }
        // Extract unique letters from the array
        var uniqueLetters = Array.from(new Set(letters));

        if (lastClicked) {
            // If there's one item, or two non-matching clicked, find pairs and reveal first
            var matchingLastSelectedItem = document.querySelectorAll(`[data-letter="${lastClicked.dataset.letter}"]`);
            setTimeout(function () {
                if (!lastClicked.classList.contains('revealed')) {
                    matchingLastSelectedItem.forEach(function (item) {
                        if (item.dataset.letter) { 
                            item.classList.add('revealed');
                            item.textContent = item.dataset.letter;
                            item.style.opacity = 1;
                            pairsRevealed++;
                        }
                    });
                }
            }, 1000);
            pairsRevealed--;
        }
        // Set a timeout for each pair
        uniqueLetters.forEach(function (letter, index) {
            setTimeout(function () {
                var matchingItems = document.querySelectorAll(`[data-letter="${letter}"]`);
                if (matchingItems[0].textContent === '' && matchingItems[1].textContent === '') {
                    matchingItems.forEach(function (item) {
                        item.classList.add('revealed'); 
                        item.textContent = item.dataset.letter;
                        item.style.opacity = 1;
                    });
                    pairsRevealed++;
                    // Check if all pairs are revealed and stop the timer
                    if (pairsRevealed === letters.length / 2) {
                        isRevealingAllPairs = false; 
                        stopTimer();
                    }
                }
            }, index * 500);
        });
    }
    function updateLeaderboard(playerName, timeTaken) {
        // Retrieve existing leaderboard data from sessionStorage
        var leaderboardData = JSON.parse(sessionStorage.getItem('leaderboard')) || [];
        leaderboardData.push({ playerName: playerName, timeTaken: timeTaken });


        leaderboardData.sort(function (a, b) {
            return a.timeTaken - b.timeTaken;
        });

        // Save the updated leaderboard data back to sessionStorage
        sessionStorage.setItem('leaderboard', JSON.stringify(leaderboardData));

        displayLeaderboard();

        if(playerName === null) playerName = ""
        setTimeout(function() {
          alert("Congratulations " + playerName + "! Finished the game in " + timeTaken);
        }, 380);
        isNameChangeAllowed = true;
        playButton.classList.add('play-again');
        }

        function displayLeaderboard() {
            var leaderboardData = JSON.parse(sessionStorage.getItem('leaderboard')) || [];
            var tableBody = document.querySelector('#scoreTable tbody');
            tableBody.innerHTML = '';
    
            leaderboardData.forEach(function (entry) {
                var newRow = document.createElement('tr');
                var playerNameCell = document.createElement('td');
                var timeTakenCell = document.createElement('td');
                playerNameCell.textContent = entry.playerName;
                timeTakenCell.textContent = entry.timeTaken + ' seconds';
                newRow.appendChild(playerNameCell);
                newRow.appendChild(timeTakenCell);
                playerNameCell.classList.add('player-name');
                tableBody.appendChild(newRow);
            });
        }
    displayLeaderboard();

    function shuffleArray(array) {
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    }
});
