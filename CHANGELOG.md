# Changelog — winccoa-pa-register

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0/).

## [1.1.2] - 2026-11-26

### Fixed

- resolve katex and js-yaml security alerts in dev dependencies (#73)
- use client-id instead of the deprecated app-id for the bot token (#70)
- ignore TypeScript 7 and ESLint 10 updates until the lint tooling supports them (#66)

### Changed

- align .github files and scripts with the template (#72)
- prefer REPO_ADMIN_TOKEN over the bot app token for merges and branch updates (#71)
- deps-dev(deps-dev): bump typescript from 5.9.3 to 6.0.3 (#68)
- use the winccoa-tools-pack-bot app token for automated PR actions (#67)
- deps-dev(deps-dev): bump markdownlint-cli from 0.50.0 to 0.50.1 (#69)
- run integration tests manually and warn on limited test coverage (#64)
- auto-release patch and minor releases (#63)
- align .github with template-npm-shared-library (#62)
- deps-dev(deps-dev): bump markdownlint from 0.42.1 to 0.42.2 (#58)
- deps-dev(deps-dev): bump typescript-eslint from 8.72.2 to 8.73.0 (#57)
- deps-dev(deps-dev): bump typescript-eslint from 8.72.1 to 8.72.2 (#56)
- deps-dev(deps-dev): bump prettier (#54)
- deps-dev(deps-dev): bump markdownlint from 0.42.0 to 0.42.1 (#55)
- deps-dev(deps-dev): bump globals from 17.13.0 to 17.14.0 (#52)
- bump js-yaml and markdownlint-cli (#51)
- deps-dev(deps-dev): bump @types/node (#48)
- deps-dev(deps-dev): bump typescript-eslint from 8.72.0 to 8.72.1 (#49)
- deps-dev(deps-dev): bump typescript-eslint from 8.71.2 to 8.72.0 (#46)
- deps-dev(deps-dev): bump markdown-it from 14.3.1 to 14.3.3 (#45)
- deps-dev(deps-dev): bump prettier (#42)
- deps-dev(deps-dev): bump typescript-eslint from 8.71.1 to 8.71.2 (#44)
- deps-dev(deps-dev): bump markdownlint from 0.41.1 to 0.42.0 (#43)
- deps-dev(deps-dev): bump @types/node (#39)
- deps-dev(deps-dev): bump typescript-eslint from 8.71.0 to 8.71.1 (#40)
- deps-dev(deps-dev): bump globals from 17.12.0 to 17.13.0 (#37)
- deps-dev(deps-dev): bump typescript-eslint from 8.70.1 to 8.71.0 (#36)
- deps-dev(deps-dev): bump brace-expansion from 1.1.18 to 1.1.21 (#38)
- deps-dev(deps-dev): bump @types/node (#35)
- deps-dev(deps-dev): bump typescript-eslint from 8.70.0 to 8.70.1 (#34)
- deps-dev(deps-dev): bump prettier (#31)
- deps-dev(deps-dev): bump tsx from 4.23.13 to 4.23.15 (#33)
- deps-dev(deps-dev): bump @types/node in the testing group (#30)
- deps-dev(deps-dev): bump prettier (#29)
- deps-dev(deps-dev): bump @types/node in the testing group (#28)
- deps-dev(deps-dev): bump typescript-eslint from 8.69.0 to 8.70.0 (#26)
- deps-dev(deps-dev): bump @types/node in the testing group (#25)

## [1.1.1] - 2026-09-13

### Fixed

- point npm-winccoa-register bin to dist/cjs/cli.js (#22)

### Changed

- Warn instead of throwing when no WinCC OA installs detected on host (CI-friendly)

## [1.1.0] - 2026-09-09

### Added

- support --sub-project multiple times (#16)
- merge back some changes from other npm packages to be  more compatible (#13)

## [1.0.1] - 2026-09-09

### Added

- merge back some changes from other npm packages to be  more compatible (#13)

## [1.0.0] - 2026-09-09

### Changed

- Maintenance release

## [Unreleased]

### Added

- Initial repository created (template content cleaned). Maintain changelog per release.
