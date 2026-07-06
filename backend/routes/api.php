<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\PublicController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AdminController;

// Public Endpoints
Route::get('/projects', [PublicController::class, 'projects']);
Route::get('/skills', [PublicController::class, 'skills']);
Route::post('/contact', [PublicController::class, 'storeContact']);

// Authentication
Route::post('/login', [AuthController::class, 'login']);

// Protected Admin Endpoints
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Projects CRUD
    Route::get('/admin/projects', [AdminController::class, 'projects']);
    Route::post('/admin/projects', [AdminController::class, 'storeProject']);
    Route::put('/admin/projects/{project}', [AdminController::class, 'updateProject']);
    Route::delete('/admin/projects/{project}', [AdminController::class, 'deleteProject']);

    // Skills CRUD
    Route::get('/admin/skills', [AdminController::class, 'skills']);
    Route::post('/admin/skills', [AdminController::class, 'storeSkill']);
    Route::put('/admin/skills/{skill}', [AdminController::class, 'updateSkill']);
    Route::delete('/admin/skills/{skill}', [AdminController::class, 'deleteSkill']);

    // Messages
    Route::get('/admin/messages', [AdminController::class, 'messages']);
    Route::put('/admin/messages/{contact}/read', [AdminController::class, 'markMessageRead']);
    Route::delete('/admin/messages/{contact}', [AdminController::class, 'deleteMessage']);
});
