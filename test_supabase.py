from supabase import create_client
from config import SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY

# Admin client (for signup)
supabase_admin = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

# Auth client (for login)
supabase_auth = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

# Test login
res = supabase_auth.auth.sign_in_with_password({
    "email": "testuser@example.com",
    "password": "Test@1234"
})

print(res)
