from server.app.core.security import verify_password

# Test the hash we're using
password = "Admin123!"
hashed = "$2b$12$XVwYbvYSx0nG3.uclfFrh.K7eE4k.szEImHDOw2GGBA8Dxh9TwEvW"
result = verify_password(password, hashed)
print(f"Password: {password}")
print(f"Hash: {hashed}")
print(f"Verification result: {result}")
