# Karting Team Management App

Simple management app.

### Build Instructions

In order to clone the repo and prepare the environment the following commands should be used:

```bash
git clone git@github.com:atwardzik/Karting-Manager.git
cd Karting-Manager
./scripts/setup.sh
source .venv/bin/activate
```

After that you can create database with:

```bash
flask --app karting init-db
```

And run the app:

```bash
flask --app karting run --debug
```

## Contributing

There is a guideline in `CONTRIBUTING.md`

## Code Style

This project uses `black` (Python), and `prettier` (JS) to enforce consistent formatting.

Use the provided scripts before committing:

```bash
./scripts/format.sh             # format all code
./scripts/check-format.sh       # CI-style check
```

## License

Copyright (C) 2026 Karol Biezunski, Michal Figoluszka, Mateusz Mlynek, Artur Twardzik
