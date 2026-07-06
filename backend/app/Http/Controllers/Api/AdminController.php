<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Models\Project;
use App\Models\Skill;
use App\Models\Contact;

class AdminController extends Controller
{
    // --- Projects ---
    public function projects()
    {
        return response()->json(Project::latest()->get());
    }

    public function storeProject(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'tech_stack' => 'required|string',
            'github_url' => 'nullable|url',
            'demo_url' => 'nullable|url',
            'image' => 'nullable|image|max:2048'
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('projects', 'public');
        }

        $project = Project::create($validated);
        return response()->json(['message' => 'Project added', 'project' => $project], 201);
    }

    public function updateProject(Request $request, Project $project)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'tech_stack' => 'required|string',
            'github_url' => 'nullable|url',
            'demo_url' => 'nullable|url',
            'image' => 'nullable|image|max:2048'
        ]);

        if ($request->hasFile('image')) {
            if ($project->image) {
                Storage::disk('public')->delete($project->image);
            }
            $validated['image'] = $request->file('image')->store('projects', 'public');
        }

        $project->update($validated);
        return response()->json(['message' => 'Project updated', 'project' => $project]);
    }

    public function deleteProject(Project $project)
    {
        if ($project->image) {
            Storage::disk('public')->delete($project->image);
        }
        $project->delete();
        return response()->json(['message' => 'Project deleted']);
    }

    // --- Skills ---
    public function skills()
    {
        return response()->json(Skill::latest()->get());
    }

    public function storeSkill(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:255',
        ]);

        $skill = Skill::create($validated);
        return response()->json(['message' => 'Skill added', 'skill' => $skill], 201);
    }

    public function updateSkill(Request $request, Skill $skill)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:255',
        ]);

        $skill->update($validated);
        return response()->json(['message' => 'Skill updated', 'skill' => $skill]);
    }

    public function deleteSkill(Skill $skill)
    {
        $skill->delete();
        return response()->json(['message' => 'Skill deleted']);
    }

    // --- Messages ---
    public function messages()
    {
        return response()->json(Contact::latest()->get());
    }

    public function markMessageRead(Contact $contact)
    {
        $contact->update(['is_read' => true]);
        return response()->json(['message' => 'Message marked as read', 'contact' => $contact]);
    }

    public function deleteMessage(Contact $contact)
    {
        $contact->delete();
        return response()->json(['message' => 'Message deleted']);
    }
}
