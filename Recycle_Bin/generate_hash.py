import bcrypt

# Generate hash for "Admin123!"
password = "Admin123!"
salt = bcrypt.gensalt()
hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
print(f"Password: {password}")
print(f"Hash: {hashed.decode('utf-8')}")

# Verify the hash
print(f"Verification: {bcrypt.checkpw(password.encode('utf-8'), hashed)}")
