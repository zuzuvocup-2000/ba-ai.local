<?php

namespace App\Services;

use App\Models\Requirement;
use App\Models\RequirementAttachment;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class RequirementAttachmentService
{
    public function list(Requirement $requirement): array
    {
        return $requirement->attachments()
            ->orderBy('created_at')
            ->get()
            ->map(fn (RequirementAttachment $a) => $this->toArray($a))
            ->all();
    }

    public function upload(Requirement $requirement, UploadedFile $file, int $userId): RequirementAttachment
    {
        $storedName = uniqid('att_', true) . '.' . $file->getClientOriginalExtension();
        $dir        = 'requirement-attachments/' . $requirement->id;

        Storage::disk('public')->putFileAs($dir, $file, $storedName);

        return RequirementAttachment::create([
            'requirement_id' => $requirement->id,
            'original_name'  => $file->getClientOriginalName(),
            'stored_name'    => $storedName,
            'path'           => $dir . '/' . $storedName,
            'mime_type'      => $file->getMimeType(),
            'size'           => $file->getSize(),
            'created_by'     => $userId,
        ]);
    }

    public function delete(RequirementAttachment $attachment): void
    {
        Storage::disk('public')->delete($attachment->path);
        $attachment->delete();
    }

    public function toArray(RequirementAttachment $attachment): array
    {
        return [
            'id'            => $attachment->id,
            'original_name' => $attachment->original_name,
            'mime_type'     => $attachment->mime_type,
            'size'          => $attachment->size,
            'url'           => Storage::disk('public')->url($attachment->path),
            'created_at'    => $attachment->created_at,
        ];
    }
}
