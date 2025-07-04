from django.core.management.utils import get_random_secret_key

if __name__ == "__main__":
    secret_key = get_random_secret_key()
    print(f"Generated Django Secret Key:")
    print(secret_key)
    print(f"\nAdd this to your .env file as:")
    print(f"SECRET_KEY={secret_key}") 