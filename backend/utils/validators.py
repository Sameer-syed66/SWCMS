def validate_email(email):
    if not email:
        return False

    return "@" in email and "." in email


def validate_waste_level(waste_level):
    return isinstance(waste_level, (int, float)) and 0 <= waste_level <= 100


def validate_required_fields(data, fields):
    for field in fields:
        if field not in data or data[field] in (None, ""):
            return False

    return True