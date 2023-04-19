const sm = require("./index.js");
sm.spaceMice.onData = mouse => {
    console.clear();
    console.log(JSON.stringify(mouse.mice[0], null, 2));
};
