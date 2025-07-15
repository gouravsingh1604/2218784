const app = require("./app");
const { Log } = require("./logger");

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  await Log("backend", "info", "service", `Server started on http://localhost:${PORT}`);
});
