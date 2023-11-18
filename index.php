<?php
/**
 * Copyright (c) 2020. RAJKUMAR
 */

use Classes\Auth;
use Classes\Repository;
use Classes\Utils;
use Exceptions\AuthException;
use Exceptions\CustomException;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\BadResponseException;
use Psr\Http\Message\ServerRequestInterface;
use Slim\Exception\HttpNotFoundException;
use Slim\Factory\AppFactory;
use Slim\Psr7\Request;
use Slim\Psr7\Response;

require 'vendor/autoload.php';
require 'classes/autoload.php';
require 'exceptions/CustomExceptions.php';

$dotenv = Dotenv\Dotenv::createUnsafeImmutable(__DIR__);
$dotenv->load();

define("CLIENT_ID", getenv("CODECHEF_CLIENT_ID"));
define("CLIENT_SECRET", getenv("CODECHEF_CLIENT_SECRET"));
define("API_URL", "https://api.codechef.com");
define("REDIRECT_URI", "https://" . $_SERVER['HTTP_HOST'] . "/authorize");
define("JWT_KEY", getenv("JWT_KEY"));
define("CACHE_INTERVAL", 60);

session_start();
$app = AppFactory::create();
$repo = new Repository();

$app->get('/login', function (Request $request, Response $response) {
    if (empty(CLIENT_ID) || empty(CLIENT_SECRET)) {
        throw new CustomException('Configuration is not valid.');
    }
    $randomString = Utils::random_str();
    $_SESSION['state'] = $randomString;
    $_SESSION['client_redirect'] = $request->getQueryParams()['redirect'];
    if (empty($_SESSION['client_redirect'])) {
        throw new CustomException('Redirect is not set.');
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
    $queryParams = $request->getQueryParams();

    //Verifying the STATE value in order to mitigate CSRF attacks
    if ($queryParams['state'] != $_SESSION['state']) {
        throw new CustomException('CSRF alert :(');
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
        'access_token' => Auth::getOwnJWT($authResponse->access_token),
        'refresh_token' => $authResponse->refresh_token
    ];
    return $response->withAddedHeader('Location', $_SESSION['client_redirect'] . '?' . http_build_query($tokenData));
});


$app->get('/refresh', function (Request $request, Response $response) {
    $token = Auth::getRefreshToken($request->getQueryParams());
    $client = new Client();
    $authResponse = $client->post(API_URL . '/oauth/token', [
        'form_params' => [
            'grant_type' => 'refresh_token',
            'refresh_token' => $token,
            'client_id' => CLIENT_ID,
            'client_secret' => CLIENT_SECRET,
        ]
    ]);
    $authResponse = json_decode($authResponse->getBody())->result->data;
    $tokenData = [
        'access_token' => Auth::getOwnJWT($authResponse->access_token),
        'refresh_token' => $authResponse->refresh_token
    ];
    $response->getBody()->write(json_encode($tokenData));
    return $response->withAddedHeader('Content-Type', 'application/json');
});

$app->get('/me', function (Request $request, Response $response) {

});

$app->get('/contests[/{code}]', function (Request $request, Response $response, $args) use ($repo) {
    $token = Auth::getAccessToken();
    if (empty($args)) {
        $response->getBody()->write($repo->getContests($token));
    } else {
        $code = $args['code'];
        $response->getBody()->write($repo->getContestDetails($token, $code));
    }
    return $response->withAddedHeader('Content-Type', 'application/json');
});

$app->get('/submissions', function (Request $request, Response $response, $args) use ($repo) {
    $token = Auth::getAccessToken();
    $params = $request->getQueryParams();
    if (empty($params['contestCode'])) {
        throw new CustomException("Contest Code is mandatory");
    } else {
        if (!empty($params['problemCode'])) {
            $response->getBody()->write($repo->getProblemSubmissions($token, $params['contestCode'], $params['problemCode']));
        } else {
            $response->getBody()->write($repo->getContestSubmissions($token, $params['contestCode']));
        }
    }
    return $response;
});

$app->get('/rankings', function (Request $request, Response $response) use ($repo) {
    $token = Auth::getAccessToken();
    $params = $request->getQueryParams();
    if (empty($params['contestCode'])) {
        throw new CustomException("Contest Code is mandatory");
    }
    $response->getBody()->write($repo->getContestRankings($token, $params['contestCode']));
    return $response;
});

$app->get('/problem', function (Request $request, Response $response) use ($repo) {
    $token = Auth::getAccessToken();
    $params = $request->getQueryParams();
    if (empty($params['contestCode']) || empty($params['problemCode'])) {
        throw new CustomException("Contest Code & Problem Code is mandatory");
    }
    $response->getBody()->write($repo->getProblemDetails($token, $params['contestCode'], $params['problemCode']));
    return $response;
});

$app->post('/ide/run', function (Request $request, Response $response) use ($repo) {
    $token = Auth::getAccessToken();
    $body = json_decode($request->getBody()->getContents(), true);
    $response->getBody()->write($repo->runOnIDE($token, $body['code'], $body['input'], $body['lang']));
    return $response;
});

$app->get('/ide/status', function (Request $request, Response $response) use ($repo) {
    $token = Auth::getAccessToken();
    $params = $request->getQueryParams();
    $response->getBody()->write($repo->getIDEStatus($token, $params['link']));
    return $response;
});

$customErrorHandler = function (
    ServerRequestInterface $request,
    Throwable $exception,
    bool $displayErrorDetails,
    bool $logErrors,
    bool $logErrorDetails
) use ($app) {
    $payload = ['error' => $exception instanceof HttpNotFoundException ? $exception->getDescription() : $exception->getMessage()];

    $response = $app->getResponseFactory()->createResponse();
    $response->getBody()->write(
        json_encode($payload, JSON_UNESCAPED_UNICODE)
    );

    return $response->withStatus(
        $exception instanceof BadResponseException ? $exception->getResponse()->getStatusCode()
            : ($exception instanceof CustomException ? 400
            : ($exception instanceof AuthException ? 401
                : ($exception instanceof HttpNotFoundException ? 404 : 500))))
        ->withAddedHeader('Content-Type', 'application/json');
};

//TODO - Set first param to false on Production
$errorMiddleware = $app->addErrorMiddleware(true, true, true);
$errorMiddleware->setDefaultErrorHandler($customErrorHandler);
$app->options('/{routes:.+}', function ($request, $response, $args) {
    return $response;
});

$app->add(function ($request, $handler) {
    $response = $handler->handle($request);
    return $response
        ->withHeader('Access-Control-Allow-Origin', '*')
        ->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization')
        ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
});
$app->map(['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], '/{routes:.+}', function ($request, $response) {
    throw new HttpNotFoundException($request);
});
$app->run();
