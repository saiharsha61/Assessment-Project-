# auth.py
# Secure Authentication module

class User:
    def __init__(self, username, password, role):
        self.username = username
        self.password = password  # In production, use hashed passwords!
        self.role = role  # 'student' or 'admin'

class AuthService:
    def login(self, username, password):
        """Authenticate user and return user object if valid."""
        pass
    def has_permission(self, user, action):
        """Check if user has permission for a given action."""
        pass
