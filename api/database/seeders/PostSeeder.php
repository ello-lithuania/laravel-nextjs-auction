<?php

namespace Database\Seeders;

use App\Models\Post;
use Illuminate\Database\Seeder;

// Užkrauna naujienų įrašus iš Markdown failų (database/data/posts/*.md) į DB.
// Kiekvienas failas turi YAML-stiliaus frontmatter ir Markdown turinį.
// Pakartotinai paleidus — atnaujina pagal slug (updateOrCreate).
class PostSeeder extends Seeder
{
    public function run(): void
    {
        $files = glob(database_path('data/posts/*.md'));

        foreach ($files as $file) {
            [$meta, $body] = $this->parse(file_get_contents($file));
            if (empty($meta['slug'])) {
                continue;
            }

            Post::updateOrCreate(
                ['slug' => $meta['slug']],
                [
                    'title' => $meta['title'] ?? '',
                    'description' => $meta['description'] ?? '',
                    'keywords' => isset($meta['keywords'])
                        ? array_values(array_filter(array_map('trim', explode(',', $meta['keywords']))))
                        : [],
                    'cover' => $meta['cover'] ?? null,
                    'excerpt' => $meta['excerpt'] ?? null,
                    'read_minutes' => (int) ($meta['read_minutes'] ?? 5),
                    'body' => trim($body),
                    'published_at' => $meta['date'] ?? null,
                ]
            );
        }
    }

    /**
     * @return array{0: array<string,string>, 1: string}
     */
    private function parse(string $raw): array
    {
        $raw = str_replace("\r\n", "\n", $raw);
        if (! preg_match('/^---\s*\n(.*?)\n---\s*\n(.*)$/s', $raw, $m)) {
            return [[], $raw];
        }

        $meta = [];
        foreach (explode("\n", $m[1]) as $line) {
            if (! str_contains($line, ':')) {
                continue;
            }
            [$key, $value] = explode(':', $line, 2);
            $meta[trim($key)] = trim(trim($value), "\"'");
        }

        return [$meta, $m[2]];
    }
}
