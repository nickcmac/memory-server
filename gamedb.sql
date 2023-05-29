create table users(
userID int NOT NULL auto_increment,
PRIMARY KEY (userID),
userNAME varchar(40)
);

create table Scores (
ScoreID int NOT NULL auto_increment,
Score int NOT NULL,
userID int ,
PRIMARY KEY (ScoreID),
FOREIGN KEY (userID) references users(userID)
);

drop table scores;
drop table users;

SELECT scores.score, users.username
    FROM scores
    JOIN users ON scores.userID = users.userID
    ORDER BY scores.score DESC
    LIMIT 10;