<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Billing requisites for a user — used to issue invoices / settle after a won
// auction. A user is either a private person or a company; the company-only
// fields (code, VAT) are simply left null for persons.
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('billing_type')->default('person'); // person | company
            $table->string('billing_name')->nullable();
            $table->string('billing_code')->nullable();   // asmens kodas / įmonės kodas
            $table->string('billing_vat')->nullable();    // PVM kodas (company)
            $table->string('billing_address')->nullable();
            $table->string('billing_phone')->nullable();
            $table->string('billing_iban')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'billing_type',
                'billing_name',
                'billing_code',
                'billing_vat',
                'billing_address',
                'billing_phone',
                'billing_iban',
            ]);
        });
    }
};
