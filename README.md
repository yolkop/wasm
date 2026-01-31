<div align='center'>
  <h1>yolkwasm</h1>
  <h3>load the shell shockers webassembly library in your bun project!</h3>
  <p>
    <a href='https://github.com/yolkop/wasm'>github</a> | 
    <a href='https://npmjs.com/yolkwasm'>npm</a> |
    <a href='https://discord.gg/VUVRmmCXzN'>discord</a>
  </p>
</div>

<br>

<h3 align='center'>usage</h1>

> [!NOTE]
> While Node compatibility should exist, it is not guaranteed.

```js
import WASM from 'yolkwasm';

const wasm = new WASM();
await wasm.initWasm();

// validate stuff for the matchmaker
const validated = wasm.validate('some input string');
console.log('validated string:', validated);

// decode the JS
const jsReq = await fetch('https://shellshock.io/js/shellshock.js');
const theJS = await jsReq.text();
const processed = await wasm.process(theJS);
console.log('processed js:', processed.slice(0, 100), '...');

// get coords string for yaw 1.5, pitch 0.3
console.log(wasm.coords(1.5, 0.3));
```

a lot of other stuff is exposed, just read the library 😭 it's one file

<br>

<h3 align='center'>credits</h3>

<p align='center'>
  yolkwasm is built with ❤️ by <a href='https://github.com/villainsrule'>1ust</a> & <a href='https://github.com/zastlx'>zastix</a><br>
  special thanks to zastix for yolkwasm's parent, <a href='https://github.com/zastlx/shell-wasm-node'>shell-wasm-node</a>
</p>
