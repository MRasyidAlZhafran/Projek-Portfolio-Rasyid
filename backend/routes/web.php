<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\PortfolioController;
use Illuminate\Support\Facades\Route;

// Frontend Routes
Route::post('/contact', [PortfolioController::class, 'storeContact'])->name('portfolio.contact');

// Auth Routes
Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login'])->name('login.post');
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// Protected Admin Routes
Route::middleware(['auth'])->prefix('admin')->group(function () {
    Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('admin.dashboard');
    
    // Projects CRUD
    Route::get('/projects', [AdminController::class, 'projects'])->name('admin.projects.index');
    Route::post('/projects', [AdminController::class, 'storeProject'])->name('admin.projects.store');
    Route::put('/projects/{project}', [AdminController::class, 'updateProject'])->name('admin.projects.update');
    Route::delete('/projects/{project}', [AdminController::class, 'deleteProject'])->name('admin.projects.delete');

    // Skills CRUD
    Route::get('/skills', [AdminController::class, 'skills'])->name('admin.skills.index');
    Route::post('/skills', [AdminController::class, 'storeSkill'])->name('admin.skills.store');
    Route::put('/skills/{skill}', [AdminController::class, 'updateSkill'])->name('admin.skills.update');
    Route::delete('/skills/{skill}', [AdminController::class, 'deleteSkill'])->name('admin.skills.delete');

    // Contact Messages
    Route::get('/messages', [AdminController::class, 'messages'])->name('admin.messages.index');
    Route::put('/messages/{contact}/read', [AdminController::class, 'markMessageRead'])->name('admin.messages.read');
    Route::delete('/messages/{contact}', [AdminController::class, 'deleteMessage'])->name('admin.messages.delete');
});

// Catch-all: Sajikan React SPA untuk semua route yang bukan API
// (Harus di paling bawah)
Route::get('/{any}', function () {
    return file_exists(public_path('index.html'))
        ? response()->file(public_path('index.html'))
        : abort(404, 'Frontend belum di-build. Jalankan: npm run build di folder frontend.');
})->where('any', '.*');
