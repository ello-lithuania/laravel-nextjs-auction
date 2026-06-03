<?php

namespace App\Http\Controllers;

use App\Models\Post;

class PostController extends Controller
{
    /**
     * Visi įrašai, naujausi viršuje. Sąrašui body negrąžinam (tik anonsą).
     * GET /api/posts
     */
    public function index()
    {
        return Post::orderByDesc('published_at')
            ->get(['slug', 'title', 'description', 'keywords', 'cover', 'excerpt', 'read_minutes', 'published_at']);
    }

    /**
     * Vienas įrašas pagal slug (su pilnu Markdown turiniu).
     * GET /api/posts/{slug}
     */
    public function show(string $slug)
    {
        return Post::where('slug', $slug)->firstOrFail();
    }
}
