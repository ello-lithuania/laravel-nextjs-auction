<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password as PasswordBroker;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password as PasswordRule;

class PasswordResetController extends Controller
{
    /**
     * Email a password reset link.
     * POST /api/forgot-password
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|email']);

        // Fires the ResetPassword notification (link points at the SPA, see
        // AppServiceProvider). Result is intentionally ignored: we always reply
        // with the same generic message so the endpoint can't be used to probe
        // which emails are registered (user enumeration).
        PasswordBroker::sendResetLink($request->only('email'));

        return response()->json([
            'message' => 'Jei tokia paskyra egzistuoja, išsiuntėme slaptažodžio atstatymo nuorodą el. paštu.',
        ], 200);
    }

    /**
     * Reset the password using a token from the emailed link.
     * POST /api/reset-password
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'token' => 'required|string',
            'email' => 'required|email',
            'password' => ['required', 'confirmed', PasswordRule::min(8)->letters()->mixedCase()->numbers()],
        ]);

        $status = PasswordBroker::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, string $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                    'remember_token' => Str::random(60),
                ])->save();

                // Revoke every existing API token so any session opened with the
                // old (possibly compromised) password is invalidated.
                $user->tokens()->delete();
            }
        );

        if ($status === PasswordBroker::PASSWORD_RESET) {
            return response()->json(['message' => 'Slaptažodis sėkmingai atstatytas. Galite prisijungti.'], 200);
        }

        // Invalid/expired token or unknown email — keep the message generic.
        return response()->json([
            'message' => 'Nepavyko atstatyti slaptažodžio. Nuoroda neteisinga arba nebegalioja.',
        ], 422);
    }
}
