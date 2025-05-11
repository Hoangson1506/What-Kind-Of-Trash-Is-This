from dotenv import load_dotenv
import os


def update_env_variable(key, value):
    """Update an environment variable in the .env file.

    Args:
        key (str): The name of the enviroment variable to update.
        value (str): The updated value for the environment variable.
    """

    env_file_path = '.env'
    env_vars = {}

    # Load existing environment variables from the .env file
    try:
        with open(env_file_path, 'r') as file:
            for line in file:
                if line.strip() and not line.startswith('#'):
                    k, v = line.strip().split('=', 1)
                    env_vars[k] = v
    except FileNotFoundError:
        pass

    # Update the variable
    env_vars[key] = value

    # Write the updated variables back to the .env file
    with open(env_file_path, 'w') as file:
        for k, v in env_vars.items():
            file.write(f"{k}={v}\n")

    # Reload .env to update os.environ
    load_dotenv(override=True)
