def authenticate_user(email, password, users):
    for user in users:
        if user.get("email") == email and user.get("password") == password:
            return user

    return None


def check_role(user, required_role):
    if not user:
        return False

    return user.get("role") == required_role