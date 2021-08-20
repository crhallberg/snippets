const { createStore } = require("../js/substore");

const users = createStore([
    { name: "Admin", isAdmin: true },
    { name: "User", isAdmin: false },
]);

users.listen((users) => {
    console.log("hello from user-store.js");
});

module.exports = { users };
