"""Reuse the approved brand asset for sharing; do not regenerate retired copy."""
from pathlib import Path
from shutil import copyfile
root = Path(__file__).resolve().parents[1]
copyfile(root / "assets/booked-af-logo.png", root / "assets/booked-af-social.png")
print("Updated social preview from the approved BOOKED AF logo.")
