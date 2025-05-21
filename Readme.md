# NSFW Reaper 🔥💀

A Reddit moderation assistant that automatically **removes NSFW posts**, optionally **notifies the user**, and gives you **fine control** over who can post NSFW content in your subreddit.

---

## ✨ Features

* 🚫 **Auto-removes NSFW posts** from your subreddit.
* 💬 **Sends customized removal messages** via comment, private message, or both.
* ✅ **Optional allowlist** of users permitted to post NSFW content.
* 🧹 **Subreddit menu button** to remove the **100 most recent NSFW posts** with one click.

---

## ⚙️ Configuration

### 1. **Removal Actions**

* Choose what happens when an NSFW post is detected:

  * ❌ Remove post only
  * 💬 Leave a **comment** with a custom message
  * 📩 Send a **private message**
  * 🔁 Do both!

### 2. **Approved Users (Optional)**

* Maintain an allowlist of usernames allowed to post NSFW content.
* NSFW posts from these users will **not** be removed.

### 3. **Subreddit Cleanup Button**

* A dedicated **menu button** to:

  * Instantly **scan and remove the 100 most recent NSFW posts**
  * Keeps your subreddit clean with one click.

---

## 🚀 How It Works

1. The app listens for new posts in your subreddit.
2. If a post is marked NSFW and the user is not on the allowlist (if enabled), it:

   * Removes the post
   * Sends the configured message/comment (if enabled)
3. The subreddit menu offers quick NSFW cleanup.

---

## 🛠 Setup

> *Requires moderator permissions on the target subreddit.*

1. Add the bot to your subreddit.
2. Configure your preferences:

   * Removal type (comment, PM, both)
   * Custom message template
   * Enable/disable approved users
   * Add usernames to allowlist if needed
3. Done! NSFW posts will now be monitored and removed.

---

## 🧾 Example Message Templates

* **Comment:**

  > Your post was removed because it is marked NSFW, and this subreddit does not allow NSFW content.

* **Private Message:**

  > Your post was removed because it is marked NSFW, and this subreddit does not allow NSFW content.

---


