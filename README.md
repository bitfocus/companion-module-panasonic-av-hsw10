# companion-module-panasonic-av-hsw10

See [HELP.md](./companion/HELP.md) and [LICENSE](./LICENSE)

## Getting started

Executing a `yarn` command should perform all necessary steps to develop the module, if it does not then follow the steps below.

The module can be built once with `yarn build`. This should be enough to get the module to be loadable by companion.

While developing the module, by using `yarn dev` the compiler will be run in watch mode to recompile the files on change.

## Version History

### Version 2.0.0

- Update to Companion module API 2.2, which needs Companion 5.1 or later
- Use Node 26 and TypeScript 6
- Bus and source take variables by expression only. Existing variables are converted
- Transition times and Picture in Picture positions and size are number fields. Existing values and variables are converted
- Reconnect once when the connection drops, rather than opening a second connection on top of the first
- Reconnect when a switcher that has replied stops responding
- Clearing the host closes the connection to the switcher
- Take UDP notifications when the host is a hostname
- Take every message in a UDP datagram
- A message whose start was lost no longer swallows the next one
- Picture in Picture positions and size are rounded, not truncated: 0.29 was sent as 0.28
- A transition time that is not a number is not sent
- Messages still queued when an action is aborted are not sent
- Network errors are logged with their message
- Check feedbacks by id
- Add Bus Source (Value) feedback

### Version 1.0.1

- Fix the repository URL in package.json

### Version 1.0.0

- Initial release
