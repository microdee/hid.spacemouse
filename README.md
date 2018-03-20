# hid.spacemouse
HID based abstraction layer for 3DConnexion space mice (no need for 3DXWare bloatware) in node.js

This package creates a spacemouse manager with accumulated data and an array of connected spacemice. Usage:

``` js
sm = require("./index.js");
sm.spaceMice.onData = mouse => {
    console.clear();
    console.log(JSON.stringify(mouse.mice[0], null, 2));
};
```
spaceMice class looks like this:
``` js
{
    translate: {x, y, z}, // x right, y backwards, z down [-1..1]
    rotate: {x, y, z}, // x pitch ccv, y roll ccv, z yaw cw [-1..1]
    buttons: [], // array of 48 possible buttons
    devices: [], // HID device info about found spacemice
    mice: [], // array of spaceMouse objects
    onData: function(spacemice) {} // callback function on data received from any device, argument is this object
}
```

spaceMice manages an array of spaceMouse devices which looks like:
``` js
{
    translate: {x, y, z}, // x right, y backwards, z down [-1..1]
    rotate: {x, y, z}, // x pitch ccv, y roll ccv, z yaw cw [-1..1]
    buttons: [], // array of 48 possible buttons
    onData: function(spacemouse) {} // callback function on data received from this device, argument is this object
}
```
that's it.