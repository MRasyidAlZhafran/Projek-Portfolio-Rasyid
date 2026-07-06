<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Project;
use App\Models\Skill;
use App\Models\Contact;
use Illuminate\Support\Facades\Storage;

class AdminController extends Controller
{
    public function dashboard()
    {
        $projectCount = Project::count();
        $skillCount = Skill::count();
        $unreadMessages = Contact::where('is_read', false)->count();
        $recentMessages = Contact::latest()->take(5)->get();

        return view('admin.dashboard', compact('projectCount', 'skillCount', 'unreadMessages', 'recentMessages'));
    }

    // Projects CRUD
    public function projects()
    {
        $projects = Project::latest()->get();
        return view('admin.projects.index', compact('projects'));
    }

    public function storeProject(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'tech_stack' => 'required|string|max:255',
            'github_url' => 'nullable|url',
            'demo_url' => 'nullable|url',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:10240',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('projects', 'public');
            $validated['image'] = $path;
        }

        Project::create($validated);

        return back()->with('success', 'Proyek berhasil ditambahkan!');
    }

    public function updateProject(Request $request, Project $project)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'tech_stack' => 'required|string|max:255',
            'github_url' => 'nullable|url',
            'demo_url' => 'nullable|url',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:10240',
        ]);

        if ($request->hasFile('image')) {
            // Hapus gambar lama jika ada
            if ($project->image) {
                Storage::disk('public')->delete($project->image);
            }
            $path = $request->file('image')->store('projects', 'public');
            $validated['image'] = $path;
        }

        $project->update($validated);

        return back()->with('success', 'Proyek berhasil diperbarui!');
    }

    public function deleteProject(Project $project)
    {
        if ($project->image) {
            Storage::disk('public')->delete($project->image);
        }
        $project->delete();
        return back()->with('success', 'Proyek berhasil dihapus!');
    }

    // Skills CRUD
    public function skills()
    {
        $skills = Skill::orderBy('category')->get();
        return view('admin.skills.index', compact('skills'));
    }

    public function storeSkill(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'level' => 'required|integer|min:0|max:100',
            'category' => 'required|string|max:255',
        ]);

        Skill::create($validated);

        return back()->with('success', 'Keahlian berhasil ditambahkan!');
    }

    public function updateSkill(Request $request, Skill $skill)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'level' => 'required|integer|min:0|max:100',
            'category' => 'required|string|max:255',
        ]);

        $skill->update($validated);

        return back()->with('success', 'Keahlian berhasil diperbarui!');
    }

    public function deleteSkill(Skill $skill)
    {
        $skill->delete();
        return back()->with('success', 'Keahlian berhasil dihapus!');
    }

    // Messages Inbox
    public function messages()
    {
        $messages = Contact::latest()->get();
        return view('admin.messages.index', compact('messages'));
    }

    public function markMessageRead(Contact $contact)
    {
        $contact->update(['is_read' => true]);
        return back()->with('success', 'Pesan ditandai sebagai dibaca.');
    }

    public function deleteMessage(Contact $contact)
    {
        $contact->delete();
        return back()->with('success', 'Pesan berhasil dihapus.');
    }
}
