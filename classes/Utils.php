<?php
/**
 * Copyright (c) 2020. RAJKUMAR
 */


namespace Classes;

use Carbon\Carbon;
use Exception;
use RangeException;

class Utils
{

    /**
     * Generate a random string, using a cryptographically secure
     * pseudorandom number generator (random_int)
     *
     * @param int $length How many characters do we want?
     * @param string $keyspace A string of all possible characters
     *                         to select from
     * @return string
     * @throws Exception
     */
    public static function random_str(
        int $length = 64,
        string $keyspace = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    ): string
    {
        if ($length < 1) {
            throw new RangeException("Length must be a positive integer");
        }
        $pieces = [];
        $max = mb_strlen($keyspace, '8bit') - 1;
        for ($i = 0; $i < $length; ++$i) {
            $pieces [] = $keyspace[random_int(0, $max)];
        }
        return implode('', $pieces);
    }

    /**
     * Function to check if cache in DB should be updated
     * @param Carbon $dateTime
     * @return bool
     */
    public static function shouldUpdateCache($dateTime)
    {
        return empty($dateTime) || (Carbon::parse($dateTime)->diffInMinutes(null) > CACHE_INTERVAL);
    }
}
