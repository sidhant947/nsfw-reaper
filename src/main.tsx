import { Devvit, SettingScope } from '@devvit/public-api';

// Configure the app to use Reddit API
Devvit.configure({
  redditAPI: true
});

// Add settings for customizable messages
Devvit.addSettings([
  {
    type: 'group',
    label: 'Removal Notification Settings',
    fields: [
      {
        type: 'paragraph',
        name: 'removal-message',
        label: 'Custom message to send to users when content is removed:',
        helpText: 'You can use {subreddit} to insert the subreddit name and {author} to insert the username.',
        defaultValue: 'Your post has been automatically removed from r/{subreddit} because it was marked as NSFW. This type of content is not allowed in this community.',
        scope: SettingScope.Installation,
        lineHeight: 10,
        onValidate: ({ value }) => {
          const wordCount = value.trim().split(/\s+/).length;
          if (wordCount > 400) {
            return 'Message is too long. Please limit your message to 400 words.';
          }
        }
      },
      {
        type: 'boolean',
        name: 'send-pm',
        label: 'Send a private message to the user when content is removed',
        defaultValue: true,
        scope: SettingScope.Installation,
      },
      {
        type: 'boolean',
        name: 'send-comment',
        label: 'Leave a removal comment when a post is removed',
        defaultValue: false,
        scope: SettingScope.Installation,
      },
      {
        type: 'boolean',
        name: 'allow-approved-users',
        label: 'Allow NSFW posts from approved users',
        defaultValue: false,
        scope: SettingScope.Installation,
      }
    ]
  }
]);
// Add a subreddit button to remove all NSFW posts
Devvit.addMenuItem({
  location: 'subreddit',
  label: 'Remove All NSFW Posts',
  forUserType: 'moderator', // Only moderators can see this button
  onPress: async (event, context) => {
    const { reddit, ui } = context;

    // Show a toast to indicate the process has started
    ui.showToast('Starting to remove NSFW posts...');

    // Get the subreddit
    const subreddit = await reddit.getCurrentSubreddit();

    // Get posts from the subreddit (limited to 100 at a time by Reddit's API)
    const postsIterator = reddit.getNewPosts({
      subredditName: subreddit.name,
      limit: 100
    });

    const posts = await postsIterator.all();
    let removedCount = 0;

    // Process each post
    for (const post of posts) {
      if (post.nsfw) {
        // Check if we should allow posts from approved users
        const allowApprovedUsers = await context.settings.get('allow-approved-users');

        let shouldRemove = true;

        // If the setting is enabled, check if the user is approved
        if (allowApprovedUsers) {
          const isApproved = await reddit.isApprovedUser({
            subredditName: subreddit.name,
            username: post.authorName
          });

          // Skip removal if user is approved
          if (isApproved) {
            shouldRemove = false;
          }
        }

        if (shouldRemove) {
          try {
            // Remove the post
            await post.remove();
            removedCount++;

            // Get notification settings
            const removalMessage = await context.settings.get('removal-message');
            const sendPM = await context.settings.get('send-pm');
            const sendComment = await context.settings.get('send-comment');

            // Process placeholders in the message
            const processedMessage = removalMessage
              .replace('{subreddit}', subreddit.name)
              .replace('{author}', post.authorName);

            // Send notification to the user
            await notifyUser(post, processedMessage, sendPM, sendComment, subreddit.name, context);
          } catch (error) {
            console.error(`Error removing post ${post.id}:`, error);
          }
        }
      }
    }

    // Show completion message
    ui.showToast(`Removed ${removedCount} NSFW posts from r/${subreddit.name}`);
  }
});

// Check posts when they're first submitted
Devvit.addTrigger({
  event: 'PostSubmit',
  onEvent: async (event, context) => {
    const post = await context.reddit.getPostById(event.post.id);

    if (post.nsfw) {
      // Check if we should allow posts from approved users
      const allowApprovedUsers = await context.settings.get('allow-approved-users');

      // If the setting is enabled, check if the user is approved
      if (allowApprovedUsers) {
        const subreddit = await context.reddit.getCurrentSubreddit();
        const isApproved = await context.reddit.isApprovedUser({
          subredditName: subreddit.name,
          username: post.authorName
        });

        // Skip removal if user is approved
        if (isApproved) {
          console.log(`Skipping NSFW removal for approved user: ${post.authorName}`);
          return;
        }
      }

      // Remove the post if it's NSFW (and user is not approved or setting is disabled)
      await post.remove();

      // Get custom message and notification preferences from settings
      const removalMessage = await context.settings.get('removal-message');
      const sendPM = await context.settings.get('send-pm');
      const sendComment = await context.settings.get('send-comment');

      // Get subreddit info for the message
      const subreddit = await context.reddit.getCurrentSubreddit();

      // Process placeholders in the message
      const processedMessage = removalMessage
        .replace('{subreddit}', subreddit.name)
        .replace('{author}', post.authorName);

      // Send notification to the user
      await notifyUser(post, processedMessage, sendPM, sendComment, subreddit.name, context);

      console.log(`Removed NSFW post at submission: ${post.id}`);
    }
  },
});

// Add a trigger for when posts are marked as NSFW after submission
Devvit.addTrigger({
  event: 'PostNsfwUpdate',
  onEvent: async (event, context) => {
    if (event.isNsfw) {
      // Get the post that was marked as NSFW
      const post = await context.reddit.getPostById(event.post.id);

      // Check if we should allow posts from approved users
      const allowApprovedUsers = await context.settings.get('allow-approved-users');

      // If the setting is enabled, check if the user is approved
      if (allowApprovedUsers) {
        const subreddit = await context.reddit.getCurrentSubreddit();
        const isApproved = await context.reddit.isApprovedUser({
          subredditName: subreddit.name,
          username: post.authorName
        });

        // Skip removal if user is approved
        if (isApproved) {
          console.log(`Skipping NSFW removal for approved user: ${post.authorName}`);
          return;
        }
      }

      // Remove the post
      await post.remove();

      // Get custom message and notification preferences from settings
      const removalMessage = await context.settings.get('removal-message');
      const sendPM = await context.settings.get('send-pm');
      const sendComment = await context.settings.get('send-comment');

      // Get subreddit info for the message
      const subreddit = await context.reddit.getCurrentSubreddit();

      // Process placeholders in the message
      const processedMessage = removalMessage
        .replace('{subreddit}', subreddit.name)
        .replace('{author}', post.authorName);

      // Send notification to the user
      await notifyUser(post, processedMessage, sendPM, sendComment, subreddit.name, context);

      console.log(`Removed NSFW post after update: ${post.id}`);
    }
  },
});

// Helper function to notify users
async function notifyUser(post, message, sendPM, sendComment, subredditName, context) {
  // Send as a comment if enabled
  if (sendComment) {
    await context.reddit.submitComment({
      id: post.id,
      text: message
    });
  }

  // Send as a private message if enabled
  if (sendPM) {
    await context.reddit.sendPrivateMessage({
      to: post.authorName,
      subject: `Post removed from r/${subredditName}`,
      text: message
    });
  }
}

export default Devvit;