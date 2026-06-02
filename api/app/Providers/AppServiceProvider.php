<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureRateLimiters();
    }

    /**
     * Named rate limiters referenced as `throttle:<name>` on the API routes.
     */
    private function configureRateLimiters(): void
    {
        // Login / register: keyed by email + IP so brute-forcing a single
        // account is slowed without letting an attacker lock out a victim by
        // hammering their email from elsewhere.
        RateLimiter::for('auth', function (Request $request) {
            $email = (string) $request->input('email');
            $key = Str::lower($email) . '|' . $request->ip();

            return [
                Limit::perMinute(5)->by($key),
                Limit::perMinute(20)->by($request->ip()),
            ];
        });

        // Authenticated API: per-user (falls back to IP) — protects bidding and
        // messaging from automated flooding.
        RateLimiter::for('authenticated', function (Request $request) {
            return Limit::perMinute(60)->by(
                optional($request->user())->id ?: $request->ip()
            );
        });

        // Public read endpoints: generous per-IP cap to absorb normal browsing
        // while still blunting scrapers.
        RateLimiter::for('public', function (Request $request) {
            return Limit::perMinute(120)->by($request->ip());
        });
    }
}
