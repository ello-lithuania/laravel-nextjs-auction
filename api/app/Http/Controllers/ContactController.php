<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    // Gavėjo adresas laikomas TIK serveryje — viešai (footeryje ir kt.) nerodomas.
    private const RECIPIENT = 'justas.arbatauskis@gmail.com';

    public function send(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:120',
            'email' => 'required|email:rfc|max:190',
            'message' => 'required|string|max:5000',
        ]);

        $body = "Vardas: {$data['name']}\n"
            . "El. paštas: {$data['email']}\n\n"
            . "Žinutė:\n{$data['message']}";

        try {
            Mail::raw($body, function ($mail) use ($data) {
                $mail->to(self::RECIPIENT)
                    ->subject('Dekaukciona — nauja žinutė iš kontaktų formos')
                    ->replyTo($data['email'], $data['name']);
            });
        } catch (\Throwable $e) {
            report($e);
            return response()->json(['message' => 'Nepavyko išsiųsti žinutės. Pabandykite vėliau.'], 500);
        }

        return response()->json(['message' => 'Žinutė išsiųsta! Atsakysime kaip galima greičiau.'], 200);
    }
}
