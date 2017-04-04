# web-newtmgr -- node-newtmgr packaged for front end
Proof of concept packaging node-newtmgr for front end. 

This app is up and running at: https://nnewtmgr.surge.sh

Or you can run it locally:

## Install
```
git clone https://github.com/jacobrosenthal/web-newtmgr
cd web-newtmgr
npm i
```

## Run it

```
npm run build && npm start
````

## View it

Make sure you're using a compatible browser with the appropriate flags turned on: 
[status page](https://github.com/WebBluetoothCG/web-bluetooth/blob/gh-pages/implementation-status.md)

Then view the app: 
[http://localhost:3000](http://localhost:3000)


## Troubleshooting
For more logs, open the javascript console and type
```
localStorage.debug = '*'

```
