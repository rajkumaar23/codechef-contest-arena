<?php
/**
 * Copyright (c) 2020. RAJKUMAR
 */

use GuzzleHttp\Client;
use GuzzleHttp\Exception\BadResponseException;
use Slim\Factory\AppFactory;
use Slim\Psr7\Request;
use Slim\Psr7\Response;

require __DIR__ . '/vendor/autoload.php';
require __DIR__ . '/utils.php';

define("CLIENT_ID", getenv("CODECHEF_CLIENT_ID"));
define("CLIENT_SECRET", getenv("CODECHEF_CLIENT_SECRET"));
define("API_URL", "https://api.codechef.com");
define("REDIRECT_URI", "http://" . $_SERVER['HTTP_HOST'] . "/authorize");

session_start();
header('Access-Control-Allow-Origin: *');
$app = AppFactory::create();

$app->get('/login', function (Request $request, Response $response) {
    if (empty(CLIENT_ID) || empty(CLIENT_SECRET)) {
        die('Configuration is not valid.');
    }
    $randomString = Utils::random_str();
    $_SESSION['state'] = $randomString;
    $_SESSION['client_redirect'] = $request->getQueryParams()['redirect'];
    if (empty($_SESSION['client_redirect'])) {
        die('Redirect is not set.');
    }
    $queryData = [
        'response_type' => 'code',
        'client_id' => CLIENT_ID,
        'state' => $_SESSION['state'],
        'redirect_uri' => REDIRECT_URI
    ];
    $oauthURL = API_URL . '/oauth/authorize?' . http_build_query($queryData);
    return $response->withStatus(302)->withHeader('Location', $oauthURL);
});


$app->get('/authorize', function (Request $request, Response $response) {
    try {
        $queryParams = $request->getQueryParams();

        //Verifying the STATE value in order to mitigate CSRF attacks
        if ($queryParams['state'] != $_SESSION['state']) {
            die('CSRF alert :(');
        }
        $client = new Client();
        $authResponse = $client->post(API_URL . '/oauth/token', [
            'form_params' => [
                'grant_type' => 'authorization_code',
                'code' => $queryParams['code'],
                'client_id' => CLIENT_ID,
                'client_secret' => CLIENT_SECRET,
                'redirect_uri' => REDIRECT_URI
            ]
        ]);
        $authResponse = json_decode($authResponse->getBody())->result->data;
        $tokenData = [
            'access_token' => $authResponse->access_token,
            'refresh_token' => $authResponse->refresh_token
        ];
        return $response->withAddedHeader('Location',
            $_SESSION['client_redirect'] . '?' . http_build_query($tokenData));
    } catch (BadResponseException $exception) {
        $response->getBody()->write("An unexpected error occurred while logging in");
        return $response;
    }
});


$app->get('/refresh', function (Request $request, Response $response) {
    try {
        $params = $request->getQueryParams();
        if (empty($params['token'])) {
            die('Refresh Token is mandatory to get a new access token');
        }
        $client = new Client();
        $authResponse = $client->post(API_URL . '/oauth/token', [
            'form_params' => [
                'grant_type' => 'refresh_token',
                'refresh_token' => $params['token'],
                'client_id' => CLIENT_ID,
                'client_secret' => CLIENT_SECRET,
            ]
        ]);
        $authResponse = json_decode($authResponse->getBody())->result->data;
        $tokenData = [
            'access_token' => $authResponse->access_token,
            'refresh_token' => $authResponse->refresh_token
        ];
        $response->getBody()->write(json_encode($tokenData));
        return $response->withAddedHeader('Content-Type', 'application/json');
    } catch (BadResponseException $exception) {
        $response->withStatus(400)->getBody()->write("Invalid Refresh Token");
        return $response;
    }
});

$app->run();
