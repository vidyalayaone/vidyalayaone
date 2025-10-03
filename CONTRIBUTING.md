# Contributing to VidyalayaOne

First off, thank you for considering contributing! 🎉  

VidyalayaOne is an open-source school management system built with a **microservices architecture**. We welcome contributions of all sizes, whether it’s fixing a bug, improving documentation, or adding new features.

## Table of Contents

1. [How to Contribute](#how-to-contribute)  
2. [Good First Issues](#good-first-issues)  
3. [Reporting Bugs](#reporting-bugs)  
4. [Setting up the Development Environment](#setting-up-the-development-environment)  
5. [Git Workflow](#git-workflow)  
6. [Code of Conduct](#code-of-conduct)  

## How to Contribute

There are several ways to contribute to VidyalayaOne:

- **Bug reports:** Identify and report issues you encounter.
- **Code contributions:** Implement new features, fix bugs, or improve existing functionality.
- **Documentation:** Improve clarity, update setup instructions, or write tutorials.

Before starting, please **fork the repository** and clone it locally.

## Good First Issues

If you are new to the project or open source in general, check issues labeled:

- [`good first issue`](https://github.com/vidyalayaone/vidyalayaone/issues?q=state%3Aopen%20label%3A%22good%20first%20issue%22)  

These are smaller tasks perfect for getting started.

## Reporting Bugs

When reporting a bug, please include:

1. **Description:** What the issue is.  
2. **Steps to Reproduce:** How we can replicate the problem.  
3. **Expected Behavior:** What you expected to happen.  
4. **Screenshots / Logs:** Optional, but helpful for debugging.  
5. **Environment:** OS, Node.js version, browser, etc.

Report issues via the [GitHub Issues](https://github.com/vidyalayaone/vidyalayaone/issues) tab.

## Setting up the Development Environment

See [setup/SETUP.md](setup/SETUP.md) for detailed instructions on setting up VidyalayaOne locally, including:

- Installing dependencies via `pnpm`  
- Running backend services  
- Running frontend applications  
- Database setup for each microservice  

## Git Workflow

Here are common Git commands to get you started quickly:

### 1. Fork & Clone
```bash
# Fork the repository on GitHub first, then:
git clone https://github.com/<your-username>/vidyalayaone.git
cd vidyalayaone
````

### 2. Add Original Repo as Upstream

```bash
git remote add upstream https://github.com/vidyalayaone/vidyalayaone.git
```

### 3. Sync with Main

```bash
git fetch upstream
git checkout main
git merge upstream/main
```

### 4. Create a New Feature Branch

```bash
git checkout -b your-branch-name
```

### 5. Make Changes & Commit

```bash
git add .
git commit -m "your-commit-message"
```

### 6. Push to Your Fork

```bash
git push origin your-branch-name
```

### 7. Open a Pull Request

* Go to your fork on GitHub
* Click **Compare & Pull Request**
* Target branch: `main` of the original repo

## Code of Conduct

All contributors are expected to follow our [Code of Conduct](CODE_OF_CONDUCT.md) to maintain a welcoming and inclusive community.

Thank you for helping make VidyalayaOne better! 🚀
