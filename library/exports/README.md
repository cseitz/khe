## Exports

Searches for `/** @export 'import-name' */` in all files in the project.

Automatically populates `package.json` `exports` with what it finds.

This allows one to easily define exports for other portions of this project to utilize.


### Example

The API has the Authentication service. It defines its own client logic.

One can do `/** @export 'auth' */` inside `api/src/services/authentication/client.ts`.

Then, the `app` project can import it via `api/auth`.