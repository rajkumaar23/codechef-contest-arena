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
     * To retrieve list of all contests
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
            if (!empty($result) && Utils::shouldUpdateCache($result[0]->lastUpdated)) {
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
     * To receive a particular non-parent contest's details along with its problemsList
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
                $contestDelStmt = $this->conn->prepare("DELETE FROM contests WHERE code = ?");
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
                $contestsUpdateStmt = $this->conn->prepare("UPDATE contests SET isParent = ?, children = ?, banner = ? WHERE code = ?");
                $contestsUpdateStmt->execute([intval($res->isParent), json_encode($res->children), $res->bannerFile, $contestCode]);
            }
            $this->conn->commit();
            $contestsStmt->execute();
            $contest = $contestsStmt->fetch(PDO::FETCH_OBJ);
            $problemsStmt->execute();
            $problems = $problemsStmt->fetchAll(PDO::FETCH_OBJ);
        }
        if (!empty($contest) && boolval($contest->isParent)) {
            throw new CustomException(json_encode(['children' => json_decode($contest->children)]));
        }
        return json_encode([
            'contest' => $contest,
            'problemsList' => $problems
        ]);
    }

    /**
     * Returns recent submissions for a contest
     * @param $token
     * @param $contestCode
     * @return false|string
     */
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
                ->prepare("INSERT INTO submissions(id,date, contestCode,problemCode,memory,time,result,username,language,lastUpdated) VALUES (?,?,?,?,?,?,?,?,?,?)");
            foreach ($res as $item) {
                $submissionWriteStmt->execute([
                    $item->id, $item->date, $item->contestCode, $item->problemCode, $item->memory, $item->time, $item->result, $item->username, $item->language, Carbon::now()
                ]);
            }
            $this->conn->commit();
            $submissionStmt->execute([$contestCode]);
            $submissions = $submissionStmt->fetchAll(PDO::FETCH_OBJ);
        }
        return json_encode($submissions);
    }

    /**
     * Returns the ranklist for a contest
     * @param $token
     * @param $contestCode
     * @return false|string
     */
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


    /**
     * Returns recent successful submissions for a problem
     * @param $token
     * @param $contestCode
     * @param $problemCode
     * @return false|string
     */
    public function getProblemSubmissions($token, $contestCode, $problemCode)
    {
        $probSubmissionsStmt = $this->conn->prepare("SELECT * FROM problemSubmissions WHERE contestCode = ? AND problemCode = ? ORDER BY date DESC");
        $probSubmissionsStmt->execute([$contestCode, $problemCode]);
        $submissions = $probSubmissionsStmt->fetchAll(PDO::FETCH_OBJ);
        if (empty($submissions) || Utils::shouldUpdateCache($submissions[0]->lastUpdated)) {
            $queryData = ['limit' => 20, 'result' => 'AC', 'contestCode' => $contestCode, 'problemCode' => $problemCode];
            $res = json_decode($this->client->get("/submissions/?" . http_build_query($queryData), [
                'headers' => [
                    'Authorization' => 'Bearer ' . $token
                ]
            ])->getBody())->result->data->content;
            $this->conn->beginTransaction();
            if (!empty($submissions) && Utils::shouldUpdateCache($submissions[0]->lastUpdated)) {
                $delStmt = $this->conn->prepare("DELETE FROM problemSubmissions WHERE contestCode = ? AND problemCode = ?");
                $delStmt->execute([$contestCode, $problemCode]);
            }
            $writeStmt = $this->conn
                ->prepare("INSERT INTO problemSubmissions(username,time,memory,language,problemCode,contestCode,date,lastUpdated) VALUES (?,?,?,?,?,?,?,?)");
            foreach ($res as $item) {
                $writeStmt->execute([
                    $item->username, $item->time, $item->memory, $item->language, $problemCode, $contestCode, $item->date, Carbon::now()
                ]);
            }
            $this->conn->commit();
            $probSubmissionsStmt->execute([$contestCode, $problemCode]);
            $submissions = $probSubmissionsStmt->fetchAll(PDO::FETCH_OBJ);
        }
        return json_encode($submissions);
    }

    /**
     * Returns major details of a problem
     * @param $token
     * @param $contestCode
     * @param $problemCode
     * @return false|string
     */
    public function getProblemDetails($token, $contestCode, $problemCode)
    {
        $problemStmt = $this->conn->prepare("SELECT * FROM problemDetails WHERE contestCode = ? AND problemCode = ?");
        $problemStmt->execute([$contestCode, $problemCode]);
        $problem = $problemStmt->fetch(PDO::FETCH_OBJ);
        if (empty($problem) || Utils::shouldUpdateCache($problem->lastUpdated)) {
            $res = json_decode($this->client->get("/contests/" . $contestCode . '/problems/' . $problemCode, [
                'headers' => [
                    'Authorization' => 'Bearer ' . $token
                ]
            ])->getBody())->result->data->content;
            $this->conn->beginTransaction();
            if (!empty($problem) && (Utils::shouldUpdateCache($problem->lastUpdated))) {
                $delStmt = $this->conn->prepare("DELETE FROM problemDetails WHERE contestCode = ? AND problemCode = ?");
                $delStmt->execute([$contestCode, $problemCode]);
            }
            $item = $res;
            $problemsWriteStmt = $this->conn
                ->prepare("INSERT INTO problemDetails(problemCode,contestCode,body,name,author,lastUpdated) VALUES (?,?,?,?,?,?)");
            $problemsWriteStmt->execute([$problemCode, $contestCode, $item->body, $item->problemName, $item->author, Carbon::now()]);
            $this->conn->commit();
            $problemStmt->execute([$contestCode, $problemCode]);
            $problem = $problemStmt->fetch(PDO::FETCH_OBJ);
        }
        return json_encode($problem);
    }

    /**
     * Runs the given code in IDE
     * @param $token
     * @param $code
     * @param $input
     * @param $lang
     * @return false|string
     */
    public function runOnIDE($token, $code, $input, $lang)
    {
        $res = json_decode($this->client->request("post", "/ide/run", [
            'headers' => [
                'Authorization' => 'Bearer ' . $token,
                'Content-Type' => 'application/json'
            ],
            'json' => [
                'sourceCode' => $code,
                'language' => $lang,
                'input' => $input
            ]
        ])->getBody())->result->data;
        return json_encode($res);
    }

    /**
     * Returns the status/output of the submitted code from IDE
     * @param $token
     * @param $link
     * @return false|string
     */
    public function getIDEStatus($token, $link)
    {
        $res = json_decode($this->client->get("/ide/status?link=" . $link, [
            'headers' => [
                'Authorization' => 'Bearer ' . $token
            ]
        ])->getBody())->result->data;
        return json_encode($res);
    }
}
