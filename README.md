# ZICOM Website

This is the ZICOM Equipment company website. It is built with a tool called
**Eleventy** (which turns simple content files into a finished website).

This guide assumes you have **never programmed before**. Just follow the steps
in order. If anything goes wrong, copy the error message and paste it to your AI
agent — it can fix most problems for you.

---

## What you need to understand first (30 seconds)

- The website lives in a folder on your computer.
- To see it, you run one command that starts a small "server" on your own
  machine and gives you a web address like `http://localhost:8080`.
- Nothing you do here affects the public internet until you deliberately
  "push" and deploy it. You can experiment safely.

You will use a program called the **Terminal** (also called PowerShell on
Windows). It is just a box where you type commands. That's it.

---

## One-time setup (you only do this once)

### 1. Install Node.js

Node.js is the engine that runs this website on your computer.

1. Go to **https://nodejs.org**
2. Download the button that says **LTS** (the recommended version).
3. Run the installer and click **Next / Agree / Install** until it finishes.
4. Restart your computer if it asks.

**To check it worked:** open the Terminal (see below) and type:

```powershell
node --version
```

If you see something like `v22.17.0`, you're good. If you see an error, tell
your AI agent: *"node --version gives an error, help me install Node.js."*

### 2. Open the Terminal in the project folder

**Easiest way (VS Code):**
- Open the project folder in VS Code (`File → Open Folder` → pick the
  `Zicom_Website_V002` folder).
- At the top menu, click **Terminal → New Terminal**.
- A box opens at the bottom. That is your Terminal, already in the right place.

**Other way (Windows File Explorer):**
- Open the `Zicom_Website_V002` folder.
- Click the address bar at the top, type `powershell`, and press **Enter**.

### 3. Install the website's building blocks

In the Terminal, type this and press **Enter**:

```powershell
npm install
```

This downloads the tools the website needs into a folder called
`node_modules`. It can take a minute or two. You only do this once (or again
if someone tells you the project was updated).

---

## Running the website (you do this every time)

In the Terminal, type:

```powershell
npm start
```

Wait a few seconds. You will see a line like:

```
[11ty] Server at http://localhost:8080/
```

Now open your web browser (Chrome, Edge, etc.) and go to that address:

👉 **http://localhost:8080/**

> **Note:** If port 8080 is busy, it may pick **8081** instead — just use
> whatever address the Terminal prints.

The website is now running on your computer. 🎉

### While it's running

- The website **auto-refreshes**: if you (or your AI agent) edit a file and
  save it, the browser updates by itself. No need to restart.
- Keep the Terminal window open. Closing it stops the website.

### To stop the website

Click into the Terminal and press **Ctrl + C**. The server stops. Run
`npm start` again whenever you want it back.

---

## The three commands you'll actually use

| Command | What it does |
|---|---|
| `npm install` | Downloads the tools (one time, or after updates) |
| `npm start` | Runs the website locally so you can see it |
| `npm run build` | Creates the final website files in a `_site` folder (for publishing). You usually don't need this day-to-day. |

---

## Where things live (so you can ask your AI agent to change them)

You don't need to memorize this — just know it exists so you can point your
AI agent to the right place.

```
Zicom_Website_V002/
├── src/
│   ├── content/pages/   ← The words/text on each page (one file per page)
│   ├── content/posts/   ← News articles and blog posts
│   ├── content/projects/← Project case studies
│   └── _includes/       ← Reusable page building blocks (the layout)
├── assets/              ← Styling (colors, fonts) and small scripts
├── images/              ← Pictures used on the site
└── package.json         ← The project's settings (don't edit unless told)
```

**Want to change text?** Most page wording is in `src/content/pages/`. For
example, the home page is `src/content/pages/home.json`.

---

## Working with your AI agent

Your AI agent (like Claude) can do the hard parts for you. Good things to say:

- *"Start the website so I can see it."*
- *"Change the heading on the home page to say X."*
- *"The command gave this error: [paste the whole error]. Fix it."*
- *"Save my changes to GitHub."*

**Golden rule:** when something breaks, copy the **entire** error message from
the Terminal and give it to your AI agent. Errors look scary but they tell the
agent exactly what to fix.

---

## Saving your work to GitHub (optional)

This project is connected to GitHub at:
**https://github.com/Jkhisha/Zicom_Website_V002**

To save a snapshot of your changes online, type these three lines one at a
time (or just ask your AI agent to "save my changes to GitHub"):

```powershell
git add -A
git commit -m "describe what you changed"
git push
```

---

## Quick troubleshooting

| Problem | What to do |
|---|---|
| `npm` or `node` "is not recognized" | Node.js isn't installed. Go back to **One-time setup → step 1**. |
| Browser shows "can't reach this page" | The server isn't running. Run `npm start` and use the exact address it prints. |
| Page didn't update after a change | Make sure you **saved** the file, and that `npm start` is still running. |
| A big red error appears | Copy all of it and paste it to your AI agent. |

When in doubt: **stop the server (Ctrl + C), run `npm start` again.** That
fixes a surprising number of issues.
