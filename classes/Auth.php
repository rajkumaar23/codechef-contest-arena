<?php
/**
 * Copyright (c) 2020. RAJKUMAR
 */

namespace Classes;

use Exception;
use Exceptions\AuthException;
use Exceptions\CustomException;
use Firebase\JWT\JWT;

class Auth
{
    /**
     * Verify the access token from JWT
     * @throws AuthException
     */
    public static function getAccessToken()
    {
        try {
            $token = JWT::decode(self::getBearerToken(), JWT_KEY, array('HS256'))->codechef_token;
            if (empty($token)) {
                throw new CustomException("Access token empty or invalid");
            }
            return $token;
        } catch (Exception $exception) {
            throw new AuthException("Invalid Access Token");
        }
    }

    /**
     * Parse the Bearer token from Authorization header
     * @return mixed|null
     */
    private static function getBearerToken()
    {
        $headers = self::getAuthorizationHeader();
        // HEADER: Get the access token from the header
        if (!empty($headers)) {
            if (preg_match('/Bearer\s(\S+)/', $headers, $matches)) {
                return $matches[1];
            }
        }
        return null;
    }

    /**
     * Returns Authorization headers
     * @return string|null
     */
    private static function getAuthorizationHeader()
    {
        $headers = null;
        if (isset($_SERVER['Authorization'])) {
            $headers = trim($_SERVER["Authorization"]);
        } else if (isset($_SERVER['HTTP_AUTHORIZATION'])) { //Nginx or fast CGI
            $headers = trim($_SERVER["HTTP_AUTHORIZATION"]);
        } elseif (function_exists('apache_request_headers')) {
            $requestHeaders = apache_request_headers();
            // Server-side fix for bug in old Android versions (a nice side-effect of this fix means we don't care about capitalization for Authorization)
            $requestHeaders = array_combine(array_map('ucwords', array_keys($requestHeaders)), array_values($requestHeaders));
            //print_r($requestHeaders);
            if (isset($requestHeaders['Authorization'])) {
                $headers = trim($requestHeaders['Authorization']);
            }
        }
        return $headers;
    }

    /**
     * Returns the refresh token sent in query param
     * @param $params
     * @return mixed
     * @throws CustomException
     */
    public static function getRefreshToken($params)
    {
        $token = $params['token'];
        if (empty($token)) {
            throw new CustomException("Refresh token empty or invalid");
        }
        return $token;
    }

    /**
     * Create a JWT using the access token sent from CodeChef API
     * @param $access_token
     * @return string
     * @throws CustomException
     */
    public static function getOwnJWT($access_token)
    {
        if (empty($access_token)) {
            throw new CustomException("Access or Refresh token empty or invalid");
        }
        $issuedAt = time();
        $expirationTime = $issuedAt + 7200;

        $payload = array(
            'codechef_token' => $access_token,
            'iat' => $issuedAt,
            'exp' => $expirationTime
        );
        $key = JWT_KEY;
        $alg = 'HS256';
        return JWT::encode($payload, $key, $alg);
    }
}
