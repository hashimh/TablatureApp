CREATE DATABASE IF NOT EXISTS chords;

CREATE TABLE IF NOT EXISTS `presaved` (
  `chord_id` int PRIMARY KEY AUTO_INCREMENT,
  `chord_name` varchar(8),
  `chord_frets` varchar(64)
);
