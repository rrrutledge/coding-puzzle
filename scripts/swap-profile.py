import os
import sys
from pathlib import Path

HOME = Path.home()
CLAUDE_DIR = HOME / ".claude"
REPO_DIR = Path(__file__).resolve().parent.parent

LINKS = {
    "CLAUDE.md": {
        "personal": HOME / "OneDrive" / "Claude" / ".claude" / "CLAUDE.md",
        "puzzle": REPO_DIR / "puzzle-profile" / "CLAUDE.md",
    },
    "settings.json": {
        "personal": HOME / "OneDrive" / "Claude" / ".claude" / "settings.json",
        "puzzle": REPO_DIR / "puzzle-profile" / "settings.json",
    },
}


def swap_to(mode):
    for filename, targets in LINKS.items():
        link = CLAUDE_DIR / filename
        target = targets[mode]
        if not target.exists():
            print(f"ABORT: target for {filename} does not exist: {target}")
            sys.exit(1)
        if link.exists() or link.is_symlink():
            if not link.is_symlink():
                print(f"ABORT: {link} exists and is not a symlink — not touching it.")
                sys.exit(1)
            link.unlink()
        os.symlink(target, link)
        print(f"{filename} -> {target}")


def status():
    for filename in LINKS:
        link = CLAUDE_DIR / filename
        if link.is_symlink():
            print(f"{filename} -> {link.resolve()}")
        elif link.exists():
            print(f"{filename} is a REAL FILE, not a symlink: {link}")
        else:
            print(f"{filename} does not exist at {link}")


if __name__ == "__main__":
    if len(sys.argv) != 2 or sys.argv[1] not in ("puzzle", "restore", "status"):
        print("Usage: python swap-profile.py [puzzle|restore|status]")
        sys.exit(1)

    mode = sys.argv[1]
    if mode == "status":
        status()
    else:
        swap_to("puzzle" if mode == "puzzle" else "personal")
        print(f"\nSwapped to: {mode}")
