#!/usr/bin/env python3
"""Create jobflow-submission.zip with .git and flat Docker build context."""
from __future__ import annotations

import shutil
import subprocess
import tempfile
import zipfile
from pathlib import Path, PurePosixPath

REPO = Path(__file__).resolve().parent.parent
OUT = REPO / "jobflow-submission.zip"
ARCHIVE_ROOT = "jobflow-submission"

SKIP_DIRS = {
    "node_modules", "dist", "coverage", ".venv", "venv",
    "__pycache__", ".pytest_cache", "fieldops-engine", ".fieldops_engine_snapshot",
}
SKIP_FILES = {"jobflow-submission.zip", ".coverage"}
SKIP_GIT = {"gk", "refs/original"}


def should_skip(rel: Path) -> bool:
    if any(part in SKIP_DIRS for part in rel.parts):
        return True
    if rel.name in SKIP_FILES:
        return True
    if rel.suffix in {".pyc", ".zip"}:
        return True
    if ".git" in rel.parts:
        for part in rel.parts:
            if part in SKIP_GIT:
                return True
    return False


def archive_path(rel: Path) -> str:
    return (PurePosixPath(ARCHIVE_ROOT) / rel).as_posix()


def iter_files() -> list[Path]:
    files: list[Path] = []
    for path in sorted(REPO.rglob("*")):
        if not path.is_file():
            continue
        rel = path.relative_to(REPO)
        if should_skip(rel):
            continue
        files.append(path)
    git_dir = REPO / ".git"
    if git_dir.is_dir():
        seen = {p.resolve() for p in files}
        for path in sorted(git_dir.rglob("*")):
            if not path.is_file():
                continue
            rel = path.relative_to(REPO)
            if should_skip(rel):
                continue
            if path.resolve() not in seen:
                files.append(path)
    return sorted(files, key=lambda p: archive_path(p.relative_to(REPO)))


def ensure_loose_refs() -> None:
    head = subprocess.check_output(
        ["git", "rev-parse", "HEAD"], cwd=REPO, text=True
    ).strip()
    for rel in ("refs/heads/main", "refs/remotes/origin/main"):
        path = REPO / ".git" / rel
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(f"{head}\n", encoding="utf-8")
    (REPO / ".git" / "refs" / "tags").mkdir(parents=True, exist_ok=True)


def add_zip_directories(zf: zipfile.ZipFile, dirs: set[str]) -> None:
    for d in sorted(dirs):
        zf.writestr(d if d.endswith("/") else d + "/", b"")


def collect_git_dirs(files: list[Path]) -> set[str]:
    dirs: set[str] = set()
    for path in files:
        if ".git" not in path.parts:
            continue
        rel = path.relative_to(REPO)
        arc = archive_path(rel)
        parent = str(PurePosixPath(arc).parent)
        while parent and parent != ARCHIVE_ROOT:
            dirs.add(parent + "/")
            parent = str(PurePosixPath(parent).parent)
    base = f"{ARCHIVE_ROOT}/.git"
    for sub in ("refs/", "refs/heads/", "refs/remotes/", "refs/remotes/origin/", "refs/tags/"):
        dirs.add(f"{base}/{sub}")
    return dirs


def write_zip(files: list[Path]) -> None:
    if OUT.exists():
        OUT.unlink()
    with zipfile.ZipFile(OUT, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=6) as zf:
        add_zip_directories(zf, collect_git_dirs(files))
        for path in files:
            zf.write(path, archive_path(path.relative_to(REPO)))


def validate_zip() -> bool:
    required = [
        f"{ARCHIVE_ROOT}/Dockerfile",
        f"{ARCHIVE_ROOT}/package.json",
        f"{ARCHIVE_ROOT}/package-lock.json",
        f"{ARCHIVE_ROOT}/src/index.ts",
        f"{ARCHIVE_ROOT}/tests/api-routes.test.ts",
        f"{ARCHIVE_ROOT}/.git/HEAD",
    ]
    with zipfile.ZipFile(OUT) as zf:
        names = set(zf.namelist())
        for req in required:
            if req not in names:
                print(f"ERROR: missing {req}")
                return False
    tmp = Path(tempfile.mkdtemp(prefix="jobflow-zip-"))
    try:
        with zipfile.ZipFile(OUT) as zf:
            zf.extractall(tmp)
        ctx = tmp / ARCHIVE_ROOT
        r = subprocess.run(
            ["git", "rev-list", "--count", "HEAD"],
            cwd=ctx, capture_output=True, text=True,
        )
        if r.returncode != 0:
            print("ERROR:", r.stderr)
            return False
        print(f"validated: {r.stdout.strip()} commits, src/ + Dockerfile at archive root")
        return True
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def main() -> int:
    ensure_loose_refs()
    files = iter_files()
    write_zip(files)
    print(f"written: {OUT}")
    print(f"size_mb: {OUT.stat().st_size / (1024 * 1024):.2f}")
    print(f"total_files: {len(files)}")
    return 0 if validate_zip() else 1


if __name__ == "__main__":
    raise SystemExit(main())
