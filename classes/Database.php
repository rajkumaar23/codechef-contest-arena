<?php
/**
 * Copyright (c) 2020. RAJKUMAR
 */

namespace Classes;

use PDO;

class Database
{
    public $connection;
    private $DB_SERVER, $DB_USER, $DB_PASS, $DB_NAME;

    /**
     * Database constructor.
     */
    public function __construct()
    {
        $this->DB_SERVER = getenv("DB_HOST");
        $this->DB_NAME = getenv("DB_NAME");
        $this->DB_PASS = getenv("DB_PASSWORD");
        $this->DB_USER = getenv("DB_USERNAME");
        $this->connection = $this->connect();
        $this->loadMigrations();
    }

    /**
     * Connects to the database using PDO
     * @return PDO
     */
    private function connect()
    {
        $conn = new PDO("mysql:host=$this->DB_SERVER;dbname=$this->DB_NAME", $this->DB_USER, $this->DB_PASS);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $conn;
    }

    /**
     * Load initial migrations for creating tables
     */
    public function loadMigrations()
    {
        $migrations = [
            "CREATE TABLE IF NOT EXISTS `contests` (`code` text COLLATE utf8_unicode_ci NOT NULL,`name` text COLLATE utf8_unicode_ci NOT NULL,`isParent` int(11) NOT NULL DEFAULT '0',`children` text COLLATE utf8_unicode_ci,`startDate` datetime NOT NULL,`endDate` datetime NOT NULL,`banner` text COLLATE utf8_unicode_ci,`lastUpdated` datetime DEFAULT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;",
            "CREATE TABLE IF NOT EXISTS `problems` (  `code` varchar(250) NOT NULL,  `contestCode` varchar(250) NOT NULL,  `successfulSubmissions` int(11) NOT NULL,  `accuracy` double NOT NULL,  `lastUpdated` datetime DEFAULT NULL) ENGINE=InnoDB DEFAULT CHARSET=latin1;",
            "CREATE TABLE IF NOT EXISTS `problemDetails` (`contestCode` varchar(255) NOT NULL,`problemCode` varchar(255) NOT NULL,`body` text NOT NULL,`name` text NOT NULL,`author` varchar(255) NOT NULL,`lastUpdated` datetime NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=latin1;",
            "CREATE TABLE IF NOT EXISTS `problemSubmissions` (  `username` varchar(255) NOT NULL,  `time` varchar(255) NOT NULL,  `date` datetime NOT NULL,  `memory` double NOT NULL,  `language` varchar(255) NOT NULL,  `problemCode` varchar(255) NOT NULL,  `contestCode` varchar(255) NOT NULL,  `lastUpdated` datetime NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=latin1;",
            "CREATE TABLE IF NOT EXISTS `rankings` (  `contestCode` varchar(255) NOT NULL,  `rank` int(11) NOT NULL,  `username` varchar(255) NOT NULL,  `score` varchar(255) NOT NULL,  `institution` text NOT NULL,  `countryCode` varchar(255) NOT NULL,  `lastUpdated` datetime NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=latin1;",
            "CREATE TABLE IF NOT EXISTS `submissions` (  `id` int(11) NOT NULL,  `date` datetime NOT NULL,  `contestCode` varchar(255) NOT NULL,  `problemCode` varchar(255) NOT NULL,  `memory` double NOT NULL,  `time` varchar(255) NOT NULL,  `result` varchar(255) NOT NULL,  `username` varchar(255) NOT NULL,  `language` varchar(255) NOT NULL,  `lastUpdated` datetime NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=latin1;"
        ];

        $this->connection->beginTransaction();
        foreach ($migrations as $migration) {
            $this->connection->exec($migration);
        }
        $this->connection->commit();

    }

    /**
     * Returns the created PDO connection
     * @return PDO
     */
    public function getConnection()
    {
        return $this->connection;
    }

}
