<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'city' => 'nullable|string|max:255',
            'password' => 'required|string|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }

        $data = $validator->validated();
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'city' => $data['city'] ?? null,
            'password' => bcrypt($data['password']),
        ]);

        $token = $user->createToken('auth')->plainTextToken;

        return response()->json(['message' => 'Sėkmingai užregistruota', 'user' => $user, 'token' => $token], 201);
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }

        $credentials = $validator->validated();
        $user = User::where('email', $credentials['email'])->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            return response()->json(['message' => 'Neteisingas el. paštas arba slaptažodis'], 401);
        }

        $token = $user->createToken('auth')->plainTextToken;

        return response()->json(['message' => 'Sėkmingai prisijungta', 'user' => $user, 'token' => $token], 200);
    }

    public function logout(Request $request)
    {
        // Revoke the token used for this request.
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Sėkmingai atsijungta'], 200);
    }
}
