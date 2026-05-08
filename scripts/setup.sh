#!/usr/bin/env bash
set -e

python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
npm install
pre-commit install
pre-commit install --hook-type commit-msg

echo "[!] Environment ready!"
