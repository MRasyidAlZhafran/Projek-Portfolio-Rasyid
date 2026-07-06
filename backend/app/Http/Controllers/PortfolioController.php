<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Project;
use App\Models\Skill;
use App\Models\Contact;

class PortfolioController extends Controller
{
    public function index()
    {
        $projects = Project::latest()->get();
        // Mengelompokkan skill berdasarkan kategori agar mudah di-render di frontend
        $skills = Skill::all()->groupBy('category');

        return view('portfolio', compact('projects', 'skills'));
    }

    public function storeContact(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'message' => 'required|string|max:2000',
        ]);

        Contact::create($validated);

        return back()->with('success', 'Pesan Anda berhasil dikirim! Terima kasih.');
    }
}
