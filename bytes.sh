#!/bin/bash

file="$1"

if [ $# -eq 0 ]; then
    file="./src/wasm_loader.wasm"
    echo "no file specified, using default: $file"
    echo "this also means the wasm file will redownload"

    wasm_loader_js=$(curl -s "https://egg.dance/js/wasm_loader.js")
    wasm_url_fragment=$(echo "$wasm_loader_js" | grep -o "URL('wasm_loader_[^']*\.wasm'" | sed "s/URL('\(.*\)'/\1/")
    wasm_url="https://egg.dance/js/$wasm_url_fragment"
    curl -s "$wasm_url" -o ./src/wasm_loader.wasm

    echo "downloaded wasm file! updating bytes..."
fi

if [ ! -f "$file" ]; then
    echo "file '$file' does not exist"
    exit 1
fi

if [[ "$file" != *.wasm ]]; then
    echo "file '$file' is not a .wasm file"
    exit 1
fi

os="$(uname)"

if [ "$os" = "Linux" ]; then
    base64 "$file" > bytes.txt
elif [ "$os" = "Darwin" ]; then
    base64 -i "$file" -o bytes.txt
else
    echo "your OS (\"$os\") isn't supported"
    exit 1
fi

bytesContent=$(cat bytes.txt)
sed -i '' "s|toUint8Array('.*')|toUint8Array('$bytesContent')|g" ./src/bytes.ts
rm -rf ./bytes.txt

echo "updated bytes in ./src/bytes.ts with $file"