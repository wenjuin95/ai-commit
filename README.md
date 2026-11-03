AI Commit Message Generator

# About
AI Commit Message Generator is a CLI tool that uses AI API to automatically generate meaningful Git commit messages based on staged changes.

Instead of manually thinking of a commit message every time you make changes, developers can let AI analyze their Git diff and suggest an appropriate message.

---

# Real-Life Problem
Writing Git commit messages seems simple, but developers often face a few common problems:

- **Unclear commit messages**: Developers sometimes write vague messages such as update, fix, or changes.

- **Inconsistent formatting**: Different developers follow different commit message styles.

- **Time-consuming**: Developers need to understand their changes and think of a suitable description before every commit.

- **Forgetting what changed**: When working on multiple files, it can be difficult to summarize all the changes accurately.

These problems make Git history harder to understand, especially when working on larger projects or collaborating with other developers.

---

# How This Project Solves the Problem
AI Commit Message Generator simplifies the commit process by using AI to analyze staged Git changes and generate relevant commit messages.

It retrieves the staged Git diff, sends the changes to AI API, and generates a commit message following the Conventional Commits format.

Developers can then review, edit, regenerate, or accept the suggested message before creating a Git commit.

This helps developers maintain a cleaner and more consistent Git history while reducing the time spent writing commit messages.

---

# Feature
- **AI-Powered Generation**: Uses Gemini API to analyze staged changes and generate commit messages.

- **Conventional Commits**: Generates messages using types such as feat, fix, refactor, docs, and test.

- **Interactive CLI**: Allows users to accept, edit, regenerate, or cancel generated messages.

- **Git Integration**: Automatically retrieves staged changes using Git.

- **Bring Your Own Key (BYOK)**: Users can provide their own AI API key instead of sharing a common API key.

- **Automatic Git Commit**: Creates a Git commit after the user approves the generated message.

---

# Workflow
```
             [ Stage changes using 'git add' ]
                              |
                              V
           [ Run AI Commit Message Generator ]
                              |
                              V
                [ Retrieve staged Git diff ]
                              |
                              V
                [ Send changes for analysis ]
                              |
                              V
            [ AI generates a commit message ]
                              |
                              V
               [ Review the generated message ]
                              |
                              V
          [ Choose to accept, edit, regenerate, or cancel ]
           /            |                 |              \
          V             V                 V               V
     [ Accept ]     [ Edit ]       [ Regenerate ]    [ Cancel ]
         |              |                 |
         +--------------+-----------------+  (Except cancel, which  aborts)
                        |
                        V
           [ Confirm and create your Git commit ]
```

---

# Tech Stack
| Technology | Purpose |
|-------------|-------------|
| Node.js | JavaScript runtime environment |
| TypeScript | Main programming language |
| simple-git | Git repository interaction |
| Commander.js | CLI command management |
| Inquirer.js | Interactive terminal prompts |

---

# Prerequisites
- Node.js
- npm
- Git
- A Google Gemini API Key (Free to get at [Google AI Studio](https://aistudio.google.com/app/api-keys))

# Getting Started

## 1. Clone the repository

```bash
git clone https://github.com/wenjuin95/ai-commit.git
cd ai-commit
```

## 2. Install dependencies

Install the required packages

```bash
npm install
```

## 3. Build the CLI

Compile the TypeScript source into the `dist` directory:

```bash
npm run build
```

## 4. Install the CLI globally

Link the package to your system so you can run the `ai-commit` command from anywhere:

```bash
npm link
```

## 5. Run the CLI

Open any Git repository, stage your changes, and run the tool::

```bash
git add .
ai-commit
```

🔑 First-Time Setup (API Key)
On your first run, the CLI will interactively prompt you for your Gemini API Key.
It will securely save this key to ~/.ai-commit/.ai-commit.json (with strict 0o600 read/write permissions for your user account only). You won't be asked for it again.

🛠 Interactive Menu
Once the AI generates a Conventional Commit message based on your diff, you will be presented with an interactive menu:
- Accept: Immediately commits the files with the generated message.
- Edit: Opens your terminal's default text editor to tweak the message before committing.
- Regenerate: Asks Gemini for a new message using the same diff.
- Quit: Cancels the operation without committing.

## EXTRA: Uninstalling

If you ever want to remove the globally linked CLI from your system, run:

```bash
npm unlink -g ai-commit
```

---

# Note: This project is intended to simplify the Git commit workflow. AI-generated commit messages should always be reviewed before committing.
