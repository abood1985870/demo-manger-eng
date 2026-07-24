<?php

namespace App\Services;

use App\Models\License;
use Carbon\Carbon;
use Exception;

class LicenseManagementService
{
    /**
     * Evaluate if the given tenant's license is active, or within grace period.
     */
    public function validateTenantLicense(string $tenantId): bool
    {
        $license = License::where('tenant_id', $tenantId)
            ->whereIn('status', ['Active', 'Grace Period', 'Trial'])
            ->first();

        if (!$license) return false;

        $now = Carbon::now();

        // 1. Is it completely expired beyond grace?
        if ($license->grace_period_end && $now->greaterThan($license->grace_period_end)) {
            $license->update(['status' => 'Expired']);
            return false;
        }

        // 2. Is it expired but within grace?
        if ($license->valid_until && $now->greaterThan($license->valid_until) && $license->status !== 'Grace Period') {
            $license->update(['status' => 'Grace Period']);
            return true; // Still technically valid, but notifications should be sent
        }

        return true;
    }

    /**
     * Simulates signature validation using a public key for On-Premises.
     */
    public function verifyOfflineSignature(string $licensePayload, string $signature): bool
    {
        $publicKeyPath = config('licensing.public_key_path');
        if (!file_exists($publicKeyPath)) {
            throw new Exception("Public key missing for offline license verification.");
        }

        $publicKey = openssl_pkey_get_public(file_get_contents($publicKeyPath));
        $result = openssl_verify($licensePayload, base64_decode($signature), $publicKey, OPENSSL_ALGO_SHA256);

        return $result === 1;
    }
}
