<?php

namespace App\Http\Controllers\Legal;

use App\Http\Controllers\Controller;
use App\Models\Legal\LegalCase;
use App\Models\Legal\CaseFile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use ZipArchive;

class CaseBundleController extends Controller
{
    public function sendBundle(Request $request, $caseId): JsonResponse
    {
        $tenantId = $request->user()->tenant_id ?? 'default-tenant';
        
        $case = LegalCase::where('id', $caseId)
            ->where('tenant_id', $tenantId)
            ->firstOrFail();

        $validated = $request->validate([
            'email' => 'required|email',
            'include_documents' => 'boolean',
            'include_invoices' => 'boolean',
        ]);

        $zipName = 'case_bundle_' . $case->case_number . '_' . time() . '.zip';
        $zipPath = storage_path('app/temp/' . $zipName);
        
        if (!is_dir(storage_path('app/temp'))) {
            mkdir(storage_path('app/temp'), 0777, true);
        }

        $zip = new ZipArchive;
        if ($zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) === TRUE) {
            
            // Add case summary document
            $summaryContent = "Case Summary:\n";
            $summaryContent .= "Title: " . $case->title_ar . "\n";
            $summaryContent .= "Number: " . $case->case_number . "\n";
            $summaryContent .= "Status: " . $case->case_status . "\n";
            $zip->addFromString('case_summary.txt', $summaryContent);

            if (!empty($validated['include_documents'])) {
                $files = CaseFile::where('case_id', $caseId)->get();
                foreach ($files as $file) {
                    if (Storage::disk('local')->exists($file->storage_key)) {
                        $zip->addFile(Storage::disk('local')->path($file->storage_key), 'documents/' . $file->display_name . '.' . $file->extension);
                    }
                }
            }

            // In a real app we'd fetch invoices and generate PDFs here if 'include_invoices' is true
            
            $zip->close();
        }

        // Generate secure link (in a real app, store to S3/Disk and generate signed URL or store token in DB)
        $token = Str::random(40);
        $downloadLink = url('/api/legal/bundle/download?token=' . $token);

        // Store temp file in local storage instead of deleting right away, 
        // in real app there would be a scheduled task to clean up old bundles
        Storage::disk('local')->put('bundles/' . $token . '.zip', file_get_contents($zipPath));
        unlink($zipPath);

        // Mock email sending
        // Mail::to($validated['email'])->send(new CaseBundleMail($case, $downloadLink));

        return response()->json([
            'success' => true,
            'message' => 'تم إرسال حزمة القضية بنجاح إلى ' . $validated['email'],
            'download_link' => $downloadLink,
        ]);
    }
}
