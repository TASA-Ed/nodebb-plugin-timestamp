// esm import
import process from "node:process";

// nodebb.require loading commonjs lib/user.js
const user = nodebb.require("./lib/user");

// can also load test1 ESM module
const test1 = nodebb.require("./lib/test1");

export function init(params) {
  params.router.get("/esm-test", async function (req, res) {
    const userData = await user.getUserData(req.uid);
    test1.foo();
    res.json({
      process: process.version,
      userData,
      bar: test1.bar
    });
  });
}
