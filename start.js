const { commands } = require('./commands');
const { createClient } = require('./utils/client');
const { getPrefix } = require('./utils/getprefix');
const settings = require('./settings.json');
const { isAdmin } = require('./utils/admin');
const { everyMinute } = require('./utils/cron');

function startBot() {
	const client = createClient();

	// Event handler for when a message is received
	client.on('messageCreate', (message) => {
		// Ignore messages from bots
		if (message.author.bot) return;

		// Ignore messages outside of the designated channel
		if (!settings.channels.includes(message.channel.id)) return;

		// Get the preferred prefix of the user, but default to the bot prefix
		getPrefix(message.author.id).then((preferred_prefix) => {
		
			// Only act on commands starting with the prefix
			if (!message.content.startsWith(preferred_prefix)) return;
		
			// Convert message to lowercase array and go through all the registered commands
			const args = message.content.substring(preferred_prefix.length).toLowerCase().split(' ');
			commands.forEach((command) => {
				// If the message matches any of the aliases, execute the corresponding function
				if (command.aliases.includes(args[0])) {
					// Only admin can execute this command
					if (command.adminOnly && !isAdmin(message)) {
						return;
					} else {
						command.func(message, args[1], args[2], args[3], args[4])
					}
				}
			})
		})
	});

	// See /utils/cron.js, these are for events happening every hour/minute/second
	setInterval(() => {
		everyMinute(client);
	}, 60000);

	// Log in the bot using the token
	client.login(settings.token);
}
exports.startBot = startBot;