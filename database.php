<?php
/**
 * Copyright (c) 2020. RAJKUMAR
 */

class Database
{
    public $connection;
    private $DB_SERVER, $DB_USER, $DB_PASS, $DB_NAME;

    public function __construct()
    {
        $this->DB_SERVER = getenv("DB_HOST");
        $this->DB_NAME = getenv("DB_NAME");
        $this->DB_PASS = getenv("DB_PASSWORD");
        $this->DB_USER = getenv("DB_USERNAME");
        $this->connection = $this->connect();
    }

    private function connect()
    {
        try {
            $conn = new PDO("mysql:host=$this->DB_SERVER;dbname=$this->DB_NAME", $this->DB_USER, $this->DB_PASS);
            $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            return $conn;
        } catch (PDOException $e) {
            die("Connection failed: " . $e->getMessage());
        }
    }

    public function getConnection()
    {
        return $this->connection;
    }

}
