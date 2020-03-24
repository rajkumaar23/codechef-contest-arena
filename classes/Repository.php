<?php
/**
 * Copyright (c) 2020. RAJKUMAR
 */

namespace Classes;

use Carbon\Carbon;
use Exceptions\CustomException;
use GuzzleHttp\Client;
use PDO;


/**
 * Copyright (c) 2020. RAJKUMAR
 */
class Repository
{
    private $db;
    private $conn;
    private $client;

    /**
     * Repository constructor.
     */
    public function __construct()
    {
        $this->db = new Database();
        $this->client = new Client([
            'base_uri' => API_URL
        ]);
        $this->conn = $this->db->getConnection();
    }

    /**
     * @param $token
     * @return false|string
     */
    public function getContests($token)
    {
        $readStmt = $this->conn->prepare("SELECT * FROM contests WHERE isParent = ?");
        $readStmt->execute([false]);
        $result = $readStmt->fetchAll(PDO::FETCH_OBJ);
        if (empty($result) || Utils::shouldUpdateCache($result[0]->lastUpdated)) {
            $res = json_decode($this->client->get('/contests', [
                'headers' => [
                    'Authorization' => 'Bearer ' . $token
                ]
            ])->getBody());
            $this->conn->beginTransaction();
            if (Utils::shouldUpdateCache($result[0]->lastUpdated)) {
                $deleteStmt = $this->conn->prepare("DELETE FROM contests");
                $deleteStmt->execute();
            }
            $insertStmt = $this->conn->prepare("INSERT INTO contests(code,name,startDate,endDate, lastUpdated) VALUES (?,?,?,?,?);");
            foreach ($res->result->data->content->contestList as $item) {
                $insertStmt->execute([$item->code, $item->name, $item->startDate, $item->endDate, Carbon::now()]);
            }
            $this->conn->commit();
            $readStmt->execute();
            $result = $readStmt->fetchAll(PDO::FETCH_OBJ);
        }
        return json_encode($result);
    }


    /**
     * @param $token
     * @param $contestCode
     * @return false|string
     * @throws CustomException
     */
    public function getContestDetails($token, $contestCode)
    {
        $contestsStmt = $this->conn->prepare("SELECT * FROM contests where CODE = '$contestCode'");
        $contestsStmt->execute();
        $contest = $contestsStmt->fetch(PDO::FETCH_OBJ);

        $problemsStmt = $this->conn->prepare("SELECT * FROM problems where CONTESTCODE = '$contestCode'");
        $problemsStmt->execute();
        $problems = $problemsStmt->fetchAll(PDO::FETCH_OBJ);

        if (!empty($contest) && boolval($contest->isParent)) {
            throw new CustomException("This is a parent contest. Please look for its children");
        }

        if (empty($contest) || empty($contest->banner) || empty($problems) || Utils::shouldUpdateCache($problems[0]->lastUpdated)) {
            $res = json_decode($this->client->get("/contests/$contestCode", [
                'headers' => [
                    'Authorization' => 'Bearer ' . $token
                ]
            ])->getBody())->result->data->content;
            $this->conn->beginTransaction();
            if (!empty($problems) && Utils::shouldUpdateCache($problems[0]->lastUpdated)) {
                $problemDelStmt = $this->conn->prepare("DELETE FROM problems WHERE contestCode = ?");
                $problemDelStmt->execute([$contestCode]);
                $problemsStmt->execute();
                $problems = $problemsStmt->fetchAll(PDO::FETCH_OBJ);
            }
            if (!empty($contest) && Utils::shouldUpdateCache($contest->lastUpdated)) {
                $contestDelStmt = $this->conn->prepare("DELETE FROM contests WHERE contestCode = ?");
                $contestDelStmt->execute([$contestCode]);
                $contestsStmt->execute();
                $contest = $contestsStmt->fetch(PDO::FETCH_OBJ);
            }
            if (empty($problems)) {
                $problemsWriteStmt = $this->conn
                    ->prepare("INSERT INTO problems(code,contestCode,successfulSubmissions,accuracy,lastUpdated) VALUES (?,?,?,?,?)");
                foreach ($res->problemsList as $item) {
                    $problemsWriteStmt->execute([$item->problemCode, $contestCode, $item->successfulSubmissions, $item->accuracy, Carbon::now()]);
                }
            }
            if (empty($contest)) {
                $contestsWriteStmt = $this->conn->prepare("INSERT INTO contests(code,name,startDate,endDate,banner,lastUpdated) VALUES (?,?,?,?,?,?)");
                $contestsWriteStmt->execute([$contestCode, $res->name, $res->startDate, $res->endDate, $res->banner, Carbon::now()]);
            } else if (empty($contest->banner)) {
                $contestsUpdateStmt = $this->conn->prepare("UPDATE contests SET isParent = ?, banner = ? WHERE code = ?");
                $contestsUpdateStmt->execute([intval($res->isParent), $res->bannerFile, $contestCode]);
            }
            $this->conn->commit();
            if (boolval($res->isParent)) {
                throw new CustomException("This is a parent contest. Please look for its children");
            }
            $contestsStmt->execute();
            $contest = $contestsStmt->fetch(PDO::FETCH_OBJ);
            $problemsStmt->execute();
            $problems = $problemsStmt->fetchAll(PDO::FETCH_OBJ);
        }
        return json_encode([
            'contest' => $contest,
            'problemsList' => $problems
        ]);
    }

    public function getContestSubmissions($token, $contestCode)
    {
        $submissionStmt = $this->conn->prepare("SELECT * FROM submissions WHERE contestCode = ? ORDER BY date");
        $submissionStmt->execute([$contestCode]);
        $submissions = $submissionStmt->fetchAll(PDO::FETCH_OBJ);
        if (empty($submissions) || Utils::shouldUpdateCache($submissions[0]->lastUpdated)) {
            $queryData = [
                'contestCode' => $contestCode,
                'limit' => 20
            ];
            $res = json_decode($this->client->get("/submissions?" . http_build_query($queryData), [
                'headers' => [
                    'Authorization' => 'Bearer ' . $token
                ]
            ])->getBody())->result->data->content;
            $this->conn->beginTransaction();
            if (!empty($submissions) && Utils::shouldUpdateCache($submissions[0]->lastUpdated)) {
                $submissionsDelStm = $this->conn->prepare("DELETE FROM submissions WHERE contestCode = ?");
                $submissionsDelStm->execute([$contestCode]);
            }
            $submissionWriteStmt = $this->conn
                ->prepare("INSERT INTO submissions(id,date, contestCode,problemCode,memory,time,result,username,language,sourceCode,lastUpdated) VALUES (?,?,?,?,?,?,?,?,?,?,?)");
            foreach ($res as $item) {
                $submissionWriteStmt->execute([
                    $item->id, $item->date, $item->contestCode, $item->problemCode, $item->memory, $item->time, $item->result, $item->username, $item->language, $item->sourceCode, Carbon::now()
                ]);
            }
            $this->conn->commit();
            $submissionStmt->execute([$contestCode]);
            $submissions = $submissionStmt->fetchAll(PDO::FETCH_OBJ);
        }
        return json_encode($submissions);
    }

    public function getProblemSubmissions($token, $contestCode, $problemCode)
    {

    }


    public function getContestRankings($token, $contestCode)
    {
        $rankingsStmt = $this->conn->prepare("SELECT * FROM rankings WHERE contestCode = ? ORDER BY rank");
        $rankingsStmt->execute([$contestCode]);
        $rankings = $rankingsStmt->fetchAll(PDO::FETCH_OBJ);
        if (empty($rankings) || Utils::shouldUpdateCache($rankings[0]->lastUpdated)) {
            $res = json_decode($this->client->get("/rankings/" . $contestCode, [
                'headers' => [
                    'Authorization' => 'Bearer ' . $token
                ]
            ])->getBody())->result->data->content;
            var_dump($res);
            $this->conn->beginTransaction();
            if (!empty($rankings) && Utils::shouldUpdateCache($rankings[0]->lastUpdated)) {
                $rankingsDelStmt = $this->conn->prepare("DELETE FROM rankings WHERE contestCode = ?");
                $rankingsDelStmt->execute([$contestCode]);
            }
            $submissionWriteStmt = $this->conn
                ->prepare("INSERT INTO rankings(contestCode,rank, username, score, institution, countryCode, lastUpdated) VALUES (?,?,?,?,?,?,?)");
            foreach ($res as $item) {
                $submissionWriteStmt->execute([
                    $contestCode, $item->rank, $item->username, $item->totalScore, $item->institution, $item->countryCode, Carbon::now()
                ]);
            }
            $this->conn->commit();
            $rankingsStmt->execute([$contestCode]);
            $rankings = $rankingsStmt->fetchAll(PDO::FETCH_OBJ);
        }
        return json_encode($rankings);
    }
}