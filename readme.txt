restart the server each time dotenv (.env) changes, the server won't restart automatically if you only save .env

When requesting, don't forget to use headers if needed:
Content-Type: application/json
Api-Key: seeTheApiKeyInTheDotenvFile

focus on schema, post, and patch whenever there's a change on schema