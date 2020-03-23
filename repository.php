<?php
/**
 * Copyright (c) 2020. RAJKUMAR
 */

use GuzzleHttp\Client;

/**
 * Copyright (c) 2020. RAJKUMAR
 */
class Repository
{
    private $db;
    private $conn;
    private $client;

    public function __construct()
    {
        $this->db = new Database();
        $this->client = new Client([
            'base_uri' => API_URL
        ]);
        $this->conn = $this->db->getConnection();
    }

    public function getContests($token)
    {
        try {
            $readStmt = $this->conn->prepare("SELECT * FROM contests");
            $readStmt->execute();
            $result = $readStmt->fetchAll(PDO::FETCH_OBJ);
            if (empty($result)) {
                $res = json_decode($this->client->get('/contests', [
                    'headers' => [
                        'Authorization' => 'Bearer ' . $token
                    ]
                ])->getBody());
                $this->conn->beginTransaction();
                $insertStmt = $this->conn->prepare(("INSERT INTO contests(code,name,startDate,endDate) VALUES (?,?,?,?);"));
                foreach ($res->result->data->content->contestList as $item) {
                    $insertStmt->execute([$item->code, $item->name, $item->startDate, $item->endDate]);
                }
                $this->conn->commit();
                $readStmt->execute();
                $result = $readStmt->fetchAll(PDO::FETCH_OBJ);
            }
            return json_encode($result);
        } catch (Exception $e) {
            return json_encode([
                'message' => 'Fetching of contests failed'
            ]);
        }
    }

    public function getContestDetails($token, $code)
    {
        try {
            $contestsStmt = $this->conn->prepare("SELECT * FROM contests where CODE = '$code'");
            $contestsStmt->execute();
            $contests = $contestsStmt->fetchAll(PDO::FETCH_OBJ);

            $problemsStmt = $this->conn->prepare("SELECT * FROM problems where CONTESTCODE = '$code'");
            $problemsStmt->execute();
            $problems = $problemsStmt->fetchAll(PDO::FETCH_OBJ);

            if (empty($contests) || empty($contests[0]->banner) || empty($problems)) {
                $res = json_decode($this->client->get("/contests/$code", [
                    'headers' => [
                        'Authorization' => 'Bearer ' . $token
                    ]
                ])->getBody())->result->data->content;
                $this->conn->beginTransaction();
                if (empty($problems)) {
                    $problemsWriteStmt = $this->conn
                        ->prepare("INSERT INTO problems(code,contestCode,successfulSubmissions,accuracy) VALUES (?,?,?,?)");
                    foreach ($res->problemsList as $item) {
                        $problemsWriteStmt->execute([$item->problemCode, $code, $item->successfulSubmissions, $item->accuracy]);
                    }
                }
                if (empty($contests)) {
                    $contestsWriteStmt = $this->conn->prepare("INSERT INTO contests(code,name,startDate,endDate,banner) VALUES (?,?,?,?,?)");
                    $contestsWriteStmt->execute([$code, $res->name, $res->startDate, $res->endDate, $res->banner]);
                } else if (empty($contests[0]->banner)) {
                    $contestsUpdateStmt = $this->conn->prepare("UPDATE contests SET banner = ? WHERE code = ?");
                    $contestsUpdateStmt->execute([$res->bannerFile, $code]);
                }
                $this->conn->commit();
                $contestsStmt->execute();
                $contests = $contestsStmt->fetchAll(PDO::FETCH_OBJ);
                $problemsStmt->execute();
                $problems = $problemsStmt->fetchAll(PDO::FETCH_OBJ);
            }
            $contests['problemsList'] = $problems;
            return json_encode($contests);
        } catch (Exception $e) {
            throw new Exception(json_encode([
                'message' => 'Fetching of contest details failed'
            ]));
        }
    }
}
