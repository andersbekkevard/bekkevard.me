---
title: "A tmux session picker for managing agent fleets"
description: "When you run 5+ AI agents in parallel, tmux becomes critical infrastructure. I built a session picker to make the chaos oversiktelig."
pubDatetime: "2026-03-23T15:00:00+01:00"
author: "Anders Bekkevard"
tags: ["Tooling", "AI", "tmux"]
---

If you run AI coding agents — Claude, Codex, Aider — you quickly end up with a dozen tmux sessions. Each agent gets its own window. Each project gets its own session. You `ctrl-b s` and squint at a flat list of cryptic names, trying to remember which window had the agent that was refactoring auth, and which one was running tests.

This does not scale. When you operate an agent fleet, your terminal multiplexer isn't just a convenience — it's your control plane. And a good control plane needs a good UI.

So I built [tmux-session-picker](https://github.com/andersbekkevard/dotfiles/blob/main/scripts/.scripts/tmux-session-picker): an fzf-powered session and window manager for tmux that makes the whole setup 10x more nimble and *oversiktelig*.

## Why tmux matters for agent work

Every serious agent workflow I've seen converges on the same setup: tmux sessions with multiple windows, each running a different agent or process. You might have:

- A Claude instance working on the backend
- Another Claude doing frontend
- A node dev server
- nvim open for when you need to step in
- A lazygit window

That's five windows in one session. Multiply by a few projects and you've got 15-20 windows spread across sessions. The built-in tmux session picker (`ctrl-b s`) shows you a flat list with no context. You can't see what each window is actually doing. You can't see the last output. You're flying blind.

## What the picker does

The picker gives you a tree view of all sessions and their windows, with live previews of pane content. When you hover over a session, you see every window's last output rendered in bordered boxes. When you hover over a window, you see its full pane capture.

![Session picker main view](/assets/img/2026/tmux-picker/main.png)

The core keybindings are simple:

- **Enter** — switch to session/window
- **Ctrl-s** — toggle between sessions-only and sessions+windows view
- **Ctrl-n** — create new session (with zoxide path picker)
- **Ctrl-r** — rename session or window
- **Ctrl-x** — kill session or window

Type to fuzzy-filter across everything.

## Some implementation details

The whole thing is a single bash script (~1400 lines). No dependencies beyond tmux, fzf, and standard POSIX tools. A few pieces I'm happy with:

### Command-type color coding

Every window gets colored based on what process is running in its active pane. This makes it instant to visually scan for your agents vs. your shells vs. your editors:

```bash
case "$pane_cmd" in
  zsh|bash|sh|fish|dash)           cmd_ansi="$color_cmd_shell" ;;   # soft blue
  nvim|vim|vi|emacs|nano|code)     cmd_ansi="$color_cmd_editor" ;;  # green
  node|npm|python|cargo|go|claude) cmd_ansi="$color_cmd_devrun" ;;  # amber
  git|lazygit|tig|gh)              cmd_ansi="$color_cmd_git" ;;     # lavender
  ssh|mosh)                        cmd_ansi="$color_cmd_remote" ;;  # orange
  *)                               cmd_ansi="$color_cmd_other" ;;   # silver
esac
```

Claude and node processes show up in amber. Shells are blue. Editors are green. You immediately know what's what.

### Smart pane capture

Not all pane content is equally useful. A shell's last 50 empty lines aren't helpful, and an AI agent's toolbar footer is just noise. The preview strips this intelligently per command type:

```bash
case "$pane_cmd" in
  claude|codex|aider)
    # Drop the last 7 lines (agent toolbar/footer)
    capture="$(tmux capture-pane -p -e -T -t "$pane_id" | drop_last 7)"
    ;;
  zsh|bash|sh|fish|dash)
    # Strip blank lines, show last few meaningful lines
    capture="$(tmux capture-pane -p -e -T -t "$pane_id" | sed '/^[[:space:]]*$/d' | tail -n 3)"
    ;;
  *)
    capture="$(tmux capture-pane -p -e -T -t "$pane_id")"
    ;;
esac
```

This means when you preview a session, you see the *actual last meaningful output* from each agent — not their chrome.

### Session preview budget allocation

When previewing a session with many windows, the script dynamically allocates vertical space. Shells get 3 lines max (they rarely need more), while agent windows get proportionally more space based on what's available:

```bash
# Shell captures are already short (3 lines max)
# Full windows split the remaining budget proportionally
if (( full_count > 0 )); then
  base_each=$(( full_budget / full_count ))
  remainder_lines=$(( full_budget - base_each * full_count ))
fi
```

Surplus from windows that have less content than their budget gets redistributed round-robin to others. The result: no wasted space, and the windows with the most output get the most screen real estate.

### New session with zoxide integration

Ctrl-n opens a name prompt. Press Enter to create at `~/`, or press Tab to open a zoxide-powered path picker with directory previews:

![Zoxide path picker](/assets/img/2026/tmux-picker/zoxide.png)

This makes spinning up a new agent session for a specific project a 3-second operation: name it, tab, type a few chars of the project path, enter.

### Themed action screens

Rename and kill operations get their own full-screen views with bordered pane captures, so you always have context about what you're acting on:

![Rename window view](/assets/img/2026/tmux-picker/rename.png)

## The bigger picture

The insight is boring but real: when you manage multiple autonomous agents, the bottleneck shifts from *doing the work* to *knowing what's happening*. Your multiplexer becomes mission control. A flat list of session names is like running a control room with unlabeled monitors.

Color-coded commands, live previews, smart content trimming — these aren't fancy features. They're the difference between scanning your fleet in 2 seconds vs. 20. And when each of those agents can go off the rails at any moment, those 18 seconds compound.

The script is [here](https://github.com/andersbekkevard/dotfiles/blob/main/scripts/.scripts/tmux-session-picker). Bind it to a key in your tmux.conf and stop squinting at `ctrl-b s`.
