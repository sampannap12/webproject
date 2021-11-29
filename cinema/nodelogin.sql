CREATE DATABASE IF NOT EXISTS `nodelogin` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `nodelogin`;

CREATE TABLE IF NOT EXISTS `accounts` (
	`id` int(11) NOT NULL AUTO_INCREMENT,
	`username` varchar(50) NOT NULL,
	`password` varchar(255) NOT NULL,
	`email` varchar(100) NOT NULL,
	`activation_code` varchar(255) NOT NULL DEFAULT '',
	`rememberme` varchar(255) NOT NULL DEFAULT '',
    `profileimg` varbinary(500) not null,
	PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
CREATE TABLE IF NOT EXISTS `Movies` (
	`movieid` int(11) NOT NULL AUTO_INCREMENT,
	`moviename` varchar(50) NOT NULL,
	`directorname` varchar(255) NOT NULL,
	`hall` varchar(100) NOT NULL,
	`price` int(255) NOT NULL DEFAULT '',
    `movieimg` varbinary(500) not null,
	PRIMARY KEY (`movieid`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

INSERT INTO `accounts` (`id`, `username`, `password`, `email`, `activation_code`, `rememberme`) VALUES (1, 'test', 'a94a8fe5ccb19ba61c4c0873d391e987982fbbd3', 'test@testexample23.com', '', '');
INSERT INTO `movies` (`movieid`, `moviename`, `directorname`, `hall`, `price`, `movieimg`) VALUES (1, 'dune', 'david', 'HallB', '15', LOAD_FILE('C:\Users\35383\Desktop\New folder (2)\views\img'));
