CREATE DATABASE IF NOT EXISTS tabify;

CREATE TABLE IF NOT EXISTS `presaved` (
  `chord_id` int PRIMARY KEY AUTO_INCREMENT,
  `chord_name` varchar(8),
  `chord_frets` varchar(64)
);

CREATE TABLE IF NOT EXISTS `users` (
  `email` varchar(64) PRIMARY KEY,
  `fname` varchar(32),
  `lname` varchar(32)
);
