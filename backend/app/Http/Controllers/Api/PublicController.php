<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Project;
use App\Models\Skill;
use App\Models\Contact;

class PublicController extends Controller
{
    public function projects()
    {
        return response()->json(Project::latest()->get());
    }

    public function skills()
    {
        $skills = Skill::all()->groupBy('category');
        return response()->json($skills);
    }

    public function storeContact(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'message' => 'required|string|max:2000',
        ]);

        $contact = Contact::create($validated);

        return response()->json([
            'message' => 'Pesan Anda berhasil dikirim! Terima kasih.',
            'contact' => $contact
        ], 201);
    }
}
