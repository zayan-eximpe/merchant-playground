import os
import re
import json
import sys

# Configuration
DIRECTORY = "/Users/zayan/Documents/Eximpe/merchant_playground"
VERSION_FILE = os.path.join(DIRECTORY, "version.json")

def get_current_version():
    if os.path.exists(VERSION_FILE):
        with open(VERSION_FILE, 'r') as f:
            data = json.load(f)
            return data.get("version", "1.0.1")
    return "1.0.1"

def save_version(version):
    with open(VERSION_FILE, 'w') as f:
        json.dump({"version": version}, f, indent=2)

def bump_version(version):
    parts = version.split('.')
    if len(parts) == 3:
        parts[-1] = str(int(parts[-1]) + 1)
        return '.'.join(parts)
    return version + ".1"

# Determine version to apply
current_version = get_current_version()

if "--bump" in sys.argv:
    new_version = bump_version(current_version)
    save_version(new_version)
    VERSION = new_version
    print(f"Bumping version: {current_version} -> {new_version}")
elif len(sys.argv) > 1 and not sys.argv[1].startswith("--"):
    VERSION = sys.argv[1]
    save_version(VERSION)
    print(f"Setting version to: {VERSION}")
else:
    VERSION = current_version
    print(f"Using current version: {VERSION}")

def update_file_static(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    script_pattern = r'src=["\']([^"\']+\.js)(?:\?v=[^"\']*)?["\']'
    new_content = re.sub(script_pattern, rf'src="\1?v={VERSION}"', content)
    
    css_pattern = r'href=["\']([^"\']+\.css)(?:\?v=[^"\']*)?["\']'
    new_content = re.sub(css_pattern, rf'href="\1?v={VERSION}"', new_content)
    
    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        return True
    return False

def update_file_dynamic(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # 1. Find the config.js path
    config_match = re.search(r'<script src="([^"]+config\.js)(?:\?v=[^"]*)?"></script>', content)
    if not config_match:
        return False
    
    config_path = config_match.group(1)
    config_tag = f'<script src="{config_path}"></script>'
    
    # 2. Remove all existing script/link tags that we want to make dynamic
    # (except config.js)
    
    def script_repl(m):
        path = m.group(1)
        if "config.js" in path: return "" # Remove to re-insert later
        return f'<script>loadJS("{path}");</script>'
    
    def css_repl(m):
        path = m.group(1)
        return f'<script>loadCSS("{path}");</script>'
    
    # Clean up existing tags
    temp_content = re.sub(r'<script src="([^"]+\.js)(?:\?v=[^"]*)?"></script>', script_repl, content)
    temp_content = re.sub(r'<link rel="stylesheet" href="([^"]+\.css)(?:\?v=[^"]*)?">', css_repl, temp_content)
    
    # 3. Insert config.js at the top of <head> and then the rest
    if "<head>" in temp_content:
        # Insert config.js right after <head>
        new_content = temp_content.replace("<head>", f"<head>\n    {config_tag}")
    else:
        new_content = temp_content
    
    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        return True
    return False

is_dynamic = "--dynamic" in sys.argv

count = 0
for root, dirs, files in os.walk(DIRECTORY):
    for file in files:
        if file.endswith(".html"):
            path = os.path.join(root, file)
            updated = update_file_dynamic(path) if is_dynamic else update_file_static(path)
            if updated:
                print(f"Updated: {path}")
                count += 1

print(f"Total files updated: {count}")
