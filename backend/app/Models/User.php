<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'email', 'password'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class);
    }

    public function projects(): BelongsToMany
    {
        return $this->belongsToMany(Project::class, 'project_user');
    }

    public function apiTokens(): HasMany
    {
        return $this->hasMany(ApiToken::class);
    }

    public function permissionSlugs(): array
    {
        return $this->roles
            ->flatMap(fn (Role $role) => $role->permissions->pluck('slug'))
            ->unique()
            ->values()
            ->all();
    }

    public function hasPermission(string $permission): bool
    {
        if ($this->roles->contains(fn (Role $role) => in_array($role->slug, ['admin', 'super-admin'], true))) {
            return true;
        }

        return in_array($permission, $this->permissionSlugs(), true);
    }

    public function hasRole(string $roleSlug): bool
    {
        return $this->roles->contains(fn (Role $role) => $role->slug === $roleSlug);
    }

    public function canAccessSystem(string $system): bool
    {
        if (in_array($system, ['admin', 'project'], true) === false) {
            return false;
        }

        if ($this->hasRole('admin') || $this->hasRole('super-admin') || $this->hasRole('project-manager') || $this->hasRole('manager')) {
            return true;
        }

        if ($system === 'project' && ($this->hasRole('ba') || $this->hasRole('dev'))) {
            return true;
        }

        return false;
    }
}
