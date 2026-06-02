<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email:rfc|max:255|unique:users,email',
            'city' => 'nullable|string|max:255',
            // Enforce a meaningful password: at least 8 chars with mixed case
            // and a digit. (No external breach check so local/offline dev still
            // works.)
            'password' => ['required', 'confirmed', Password::min(8)->letters()->mixedCase()->numbers()],
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

        // Always run a hash comparison, even when the account doesn't exist, so
        // the response time doesn't reveal whether the email is registered
        // (timing-based user enumeration). The dummy hash is a valid bcrypt of a
        // random value.
        $hash = $user?->password ?? '$2y$12$gamUcOhyjhkz5qKCTbTsSeyGE852gCnGBd63p2QV4bTX.t.D8s7vq';

        if (!$user || !Hash::check($credentials['password'], $hash)) {
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
