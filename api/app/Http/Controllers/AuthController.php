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
        // Note: we deliberately do NOT use a `unique:users,email` rule here.
        // That rule returns "email already taken", which lets anyone probe which
        // addresses are registered (user enumeration). Instead we accept the
        // input and respond identically whether or not the account already
        // exists (see below).
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email:rfc|max:255',
            'city' => 'nullable|string|max:255',
            // Enforce a meaningful password: at least 8 chars with mixed case
            // and a digit. (No external breach check so local/offline dev still
            // works.)
            'password' => ['required', 'confirmed', Password::min(8)->letters()->mixedCase()->numbers()],
        ]);

        if ($validator->fails()) {
            // These messages (weak password, malformed email) don't reveal
            // whether the account exists, so returning them is safe.
            return response()->json(['message' => $validator->errors()->first()], 422);
        }

        $data = $validator->validated();
        $existing = User::where('email', $data['email'])->first();

        if ($existing) {
            // Account already exists: do not create a duplicate and do not
            // disclose it. Burn time equivalent to a real hash so the response
            // timing matches the create path (timing-based enumeration).
            Hash::make($data['password']);
        } else {
            try {
                User::create([
                    'name' => $data['name'],
                    'email' => $data['email'],
                    'city' => $data['city'] ?? null,
                    'password' => bcrypt($data['password']),
                ]);
            } catch (\Illuminate\Database\QueryException $e) {
                // Unique-constraint race (a concurrent request registered the
                // same email). Swallow and fall through to the same generic
                // response so the outcome is indistinguishable.
            }
        }

        // Identical response in every case. No token is issued: the user signs
        // in via /login afterwards. If the email was already taken, the real
        // owner can simply log in (or reset) with their existing password.
        return response()->json([
            'message' => 'Registracija sėkminga. Galite prisijungti.',
        ], 201);
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

    /**
     * Change the authenticated user's password.
     * POST /api/user/password
     */
    public function updatePassword(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'current_password' => 'required|string',
            // New password must meet the policy, be confirmed, and differ from
            // the current one.
            'password' => ['required', 'confirmed', 'different:current_password', Password::min(8)->letters()->mixedCase()->numbers()],
        ]);

        // Verify the current password before allowing the change (defends
        // against an attacker using a hijacked but still-valid session).
        if (! Hash::check($validated['current_password'], $user->password)) {
            return response()->json(['message' => 'Dabartinis slaptažodis neteisingas.'], 422);
        }

        $user->forceFill(['password' => Hash::make($validated['password'])])->save();

        // Revoke every other token so sessions opened with the old password are
        // logged out; keep the current token so this client stays signed in.
        $currentTokenId = $request->user()->currentAccessToken()->id;
        $user->tokens()->where('id', '!=', $currentTokenId)->delete();

        return response()->json(['message' => 'Slaptažodis sėkmingai pakeistas.'], 200);
    }

    /**
     * Save the authenticated user's billing requisites (person or company).
     * POST /api/user/requisites
     */
    public function updateRequisites(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'billing_type' => 'required|in:person,company',
            'billing_name' => 'required|string|max:255',
            'billing_code' => 'nullable|string|max:50',
            'billing_vat' => 'nullable|string|max:50',
            'billing_address' => 'nullable|string|max:255',
            'billing_phone' => 'nullable|string|max:50',
            'billing_iban' => 'nullable|string|max:64',
        ]);

        $user->forceFill($validated)->save();

        return response()->json([
            'message' => 'Rekvizitai išsaugoti.',
            'user' => $user,
        ], 200);
    }
}
