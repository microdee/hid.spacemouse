//import hid from "node-hid";
hid = require("node-hid");

function joinInt16(min, maj)
{
    var sign = maj & (1 << 7);
    var x = (((maj & 0xFF) << 8) | (min & 0xFF));
    if (sign) {
        x = 0xFFFF0000 | x;  // fill in most significant bits with 1's
    }
    return x;
}

class spaceMouse
{
    constructor(dev, info) 
    {
        this.translate = {x: 0, y:0, z:0};
        this.rotate = {x:0, y:0, z:0};
        this.buttons = (new Array(48)).fill(false);
        this.hidDevice = dev;
        this.hidInfo = info;
        this.onData = sm => {};

        dev.on('data', (data => {
            switch (data[0])
            {
                case 1:
                    this.translate.x = joinInt16(data[1], data[2]) / 350;
                    this.translate.y = joinInt16(data[3], data[4]) / 350;
                    this.translate.z = joinInt16(data[5], data[6]) / 350;
                    break;
                case 2:
                    this.rotate.x = joinInt16(data[1], data[2]) / 350;
                    this.rotate.y = joinInt16(data[3], data[4]) / 350;
                    this.rotate.z = joinInt16(data[5], data[6]) / 350;
                    break;
                case 3:
                    data.slice(1, 7).forEach((buttonbyte, i) => {
                        let si = i*8;
                        let mask = 1;
                        for (let j = 0; j < 8; j++) {
                            this.buttons[si + j] = ((mask << j) & buttonbyte) > 0;
                        }
                    });
                    break;
            }
            this.onData(this);
        }).bind(this));
    }
}

class spaceMice
{
    constructor()
    {
        this.translate = {x: 0, y:0, z:0};
        this.rotate = {x:0, y:0, z:0};
        this.buttons = (new Array(48)).fill(false);
        this.mice = [];
        this.onData = sm => {};

        this.devices = hid.devices().filter(dev => dev.vendorId == 1133 && dev.product.includes("Space"));
        this.devices.forEach(dev => {
            try {
                this.mice.push(new spaceMouse(new hid.HID(dev.path), dev))
            } catch (error) {
                console.log(`can't open device ${dev.productId}, ${dev.product}`);
                console.log(error);
            }
        });
        this.mice.forEach(mouse => {
            mouse.onData = data => {
                this.translate = this.mice.reduce((cval, cm) => {
                    return {
                        x: cval.x + cm.translate.x,
                        y: cval.y + cm.translate.y,
                        z: cval.z + cm.translate.z,
                    }
                }, {x: 0, y:0, z:0});
                this.rotate = this.mice.reduce((cval, cm) => {
                    return {
                        x: cval.x + cm.rotate.x,
                        y: cval.y + cm.rotate.y,
                        z: cval.z + cm.rotate.z,
                    }
                }, {x: 0, y:0, z:0});
                this.buttons.fill(false);
                this.mice.forEach(cm => {
                    for (let i = 0; i < this.buttons.length; i++) {
                        this.buttons[i] = this.buttons[i] || cm.buttons[i];
                    }
                });
                this.onData(this);
            };
        });
    }
}

module.exports.spaceMice = new spaceMice();
