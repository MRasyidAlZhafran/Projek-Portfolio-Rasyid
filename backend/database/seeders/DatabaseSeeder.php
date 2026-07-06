<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User admin default
        User::factory()->create([
            'name' => 'Admin Portfolio',
            'email' => 'admin@portfolio.com',
            'password' => bcrypt('password123'),
        ]);

        // Contoh data keahlian (Skills)
        \App\Models\Skill::create([
            'name' => 'Laravel',
            'level' => 90,
            'category' => 'Backend',
        ]);
        \App\Models\Skill::create([
            'name' => 'PHP',
            'level' => 85,
            'category' => 'Backend',
        ]);
        \App\Models\Skill::create([
            'name' => 'JavaScript',
            'level' => 80,
            'category' => 'Frontend',
        ]);
        \App\Models\Skill::create([
            'name' => 'Tailwind CSS',
            'level' => 85,
            'category' => 'Frontend',
        ]);
        \App\Models\Skill::create([
            'name' => 'Git & GitHub',
            'level' => 80,
            'category' => 'Tools',
        ]);

        // Contoh data proyek (Projects)
        \App\Models\Project::create([
            'title' => 'E-Commerce Website',
            'description' => 'Sebuah toko online lengkap dengan fitur katalog produk, keranjang belanja, checkout, dan integrasi payment gateway.',
            'tech_stack' => 'Laravel, SQLite, Tailwind CSS',
            'github_url' => 'https://github.com/example/ecommerce',
            'demo_url' => 'https://ecommerce.example.com',
        ]);

        \App\Models\Project::create([
            'title' => 'Task Management App',
            'description' => 'Aplikasi kolaborasi tim untuk manajemen tugas menggunakan antarmuka seret-dan-lepas (drag-and-drop) ala Trello.',
            'tech_stack' => 'Laravel, Livewire, AlpineJS, Tailwind CSS',
            'github_url' => 'https://github.com/example/task-manager',
            'demo_url' => null,
        ]);
    }
}
