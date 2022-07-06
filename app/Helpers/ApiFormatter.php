<?php

namespace App\Helpers;

class ApiFormatter{

    protected static $response = [
        'status' => null,
        'message' => null,
        'data' => null,
    ];

    public static function createApi($status = null, $message = null, $data = null)
    {
        self::$response['status'] = $status;
        self::$response['message'] = $message;
        self::$response['data'] = $data;

        return response()->json(self::$response, self::$response['status']);
    }

    public static function createApiPresentase($status = null, $message = null, $data = null, $dataPresentase = null)
    {
        self::$response['status'] = $status;
        self::$response['message'] = $message;
        self::$response['data'] = $data;
        self::$response['dataPresentase'] = $dataPresentase;

        return response()->json(self::$response, self::$response['status']);
    }
}
