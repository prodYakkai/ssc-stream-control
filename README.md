# SRS Server Key Control Panel

## Development

Use yarn package manager to install dependencies.

Use Firebase for authentication and Firestore for database. Check [here](./docs/firebase.md) for setup.

## Notes

Everything should be stateless, so you can run it in a container and scale up.

If you need a public url to test webhook, use something like [ngrok](https://ngrok.com/).
