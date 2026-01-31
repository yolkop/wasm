import { describe, expect, it } from 'bun:test';

import WASM from '../dist';

describe('WASM', async () => {
    const wasm = new WASM();
    await wasm.init();

    it('WASM validate', () => {
        const input = 'e8edc8fd-410b-48db-8581-3f9cc1c29d66';
        const expectedResult = 'd6d858f388204df7718bf43d98c330f34124df18e36a1e821683a8be571dc084';

        expect(wasm.validate(input)).toBe(expectedResult);
    });

    it('WASM process', async () => {
        const req = await fetch('https://shellshock.io/js/shellshock.js');
        const res = await req.text();

        const processResult = await wasm.process(res);
        expect(processResult).toStartWith('(()=>{');
    });

    it('WASM coords', async () => {
        const zeroZero = wasm.coords(0, 0);
        expect(zeroZero).toBeTypeOf('string');
    })
});