# Register a default Admin using environment variables
# Usage: source .env && curl -X POST http://localhost:3001/auth/register ...
# Or use the /auth/seed endpoint

# curl -X POST http://localhost:3001/auth/register \
#      -H "Content-Type: application/json" \
#      -d "{
#        \"mobileNumber\": \"$INITIAL_ADMIN_PHONE\",
#        \"password\": \"$INITIAL_ADMIN_PASSWORD\",
#        \"name\": \"Super Admin\",
#        \"role\": \"ADMIN\"
#      }"

echo "\nSeed script updated. Please use environment variables for registration."

