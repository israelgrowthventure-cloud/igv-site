"""Delete admin user from MongoDB to recreate with correct password"""
import httpx

BACKEND_URL = "https://igv-cms-backend.onrender.com"
BOOTSTRAP_TOKEN = "igv-bootstrap-2025-secure-token-xyz789"
ADMIN_EMAIL = "postmaster@israelgrowthventure.com"

print(f"🗑️  Deleting admin user: {ADMIN_EMAIL}")

# Call a custom endpoint to delete the user
# Since we don't have a delete endpoint, we'll create one or use direct MongoDB

print(f"\n⚠️  We need to delete the user manually from MongoDB")
print(f"   OR create a /api/admin/delete-user endpoint")
print(f"\nAlternative: Update password hash directly")
