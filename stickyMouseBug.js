const { app, BrowserWindow, ipcMain } = require('electron')

app.on('ready', () =>{

    var offscreenWin = new BrowserWindow({width: 580, height: 450, webPreferences: {offscreen: true}})
    var displayWin = new BrowserWindow({title:'Sticky Mouse Bug', width: 600, height: 500})
    var i = 0

    //offscreenWin.webContents.openDevTools({mode: "detach"})
    offscreenWin.webContents.on('paint', (event, dirty, image) => {
        console.log('Drawing frame ' + i++)
        displayWin.webContents.executeJavaScript(`setImage('${image.toDataURL()}')`)
    })

    displayWin.on('resize', () => { setBounds() })
    displayWin.on('close', () => { offscreenWin.close() })

    function setBounds() {
        var size = displayWin.getContentSize()
        offscreenWin.setSize(size[0], size[1])
    }

    offscreenWin.loadURL(`file://${__dirname}/offscreen.html`)
    displayWin.loadURL(`file://${__dirname}/display.html`)

    // necessary to force display of initial frame in Electron 4
    setTimeout(()=>{
        let bounds = displayWin.getBounds()
        displayWin.setBounds({x: bounds.x, y: bounds.y, width: bounds.width +1, height: bounds.height })
    }, 2000)


    ipcMain.on('mouse-down', (event, x, y) => { sendMouseInput('mouseDown', x, y)})
    ipcMain.on('mouse-up', (event, x, y) => { sendMouseInput('mouseUp', x, y)})
    ipcMain.on('mouse-move', (event, x, y) => { sendMouseInput('mouseMove', x, y)})
    ipcMain.on('mouse-enter', (event, x, y) => { sendMouseInput('mouseEnter', x, y)})
    ipcMain.on('mouse-leave', (event, x, y) => { sendMouseInput('mouseLeave', x, y)})

    sendMouseInput = (type, x, y) => {
        offscreenWin.focusOnWebView()
        console.log(type+' '+x+' '+y)
        let inputArgs = { type: type, x: x, y: y }
        if (type == 'mouseDown' || type == 'mouseUp'){
            inputArgs.clickCount = 1
            inputArgs.button = 'left';
        }
        offscreenWin.webContents.sendInputEvent(inputArgs)
    }

})
