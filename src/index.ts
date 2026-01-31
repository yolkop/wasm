// https://github.com/zastlx/shell-wasm-node
// thanks zastix! yolkbot wouldn't have stayed alive without your help <3

import { wasmBytes } from './bytes';

const normalizeYaw = (yaw: number) => ((yaw % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

export interface GetYawPitch {
    yaw: number;
    pitch: number;
    coords: string;
}

export interface WASMExports {
    memory: WebAssembly.Memory;

    start: () => void;
    process: (ptr: number, len: number) => void;
    validate(ptr: number, len: number): [number, number];
    get_yaw_pitch(): GetYawPitch;
    reset_yaw_pitch(): void;
    set_mouse_params(speed: number, invert: number, fov: number, scoped: boolean, uniqueIdPtr: number, uniqueIdLen: number): void;
    poll_gamepad(gp_idx: number, deadzone: number, speed: number, scoped: boolean, invert: number, players: object[], babylonCamera: any, selfId: number, selfTeam: number): void;

    __wbindgen_export_2: WebAssembly.Table;
    __wbindgen_export_5: WebAssembly.Table;

    __wbindgen_exn_store(idx: number): void;
    __externref_table_alloc(): number;
    __wbindgen_malloc(size: number, tag: number): number;
    __wbindgen_realloc: (ptr: number, oldSize: number, newSize: number, tag: number) => number;
    __wbindgen_free(ptr: number, size: number, tag: number): void;
    __wbindgen_start: () => void;

    closure9_externref_shim: (arg0: any, arg1: any, arg2: any) => void;
}

export class WASM {
    // @ts-expect-error wah wah
    wasm: WASMExports = null;

    debug = false;

    canvasListeners = { pointermove: (m: { movementX: number, movementY: number }) => { } };
    mockElement = { textContent: '' };

    processDate: number | null = null;
    processListeners: Array<(result: string) => void> = [];

    async init(): Promise<void> {
        const wasmInstantiated = await WebAssembly.instantiate(wasmBytes, this.getImports());
        this.wasm = wasmInstantiated.instance.exports as unknown as WASMExports;

        this.wasm.start();

        const [ptr, len] = this.passStringToWasm([...Array(14)].map(() => Math.random().toString(36)[2]).join(''));
        this.wasm.set_mouse_params(50, 1, 1, false, ptr, len);

        const movementX = Math.random() * 10 + 100;
        const movementY = Math.random() * 10 + 100;

        this.canvasListeners.pointermove({ movementX, movementY });
    }

    getStringFromWasm = (ptr: number, len: number): string => {
        if (!this.wasm) throw new Error('you must call initWasm() before using the WASM module');

        ptr >>>= 0;
        return (new TextDecoder()).decode((new Uint8Array(this.wasm.memory.buffer)).subarray(ptr, ptr + len));
    }

    passStringToWasm = (str: string): [number, number] => {
        if (!this.wasm) throw new Error('you must call initWasm() before using the WASM module');

        const buf = (new TextEncoder()).encode(str);
        const ptr = this.wasm.__wbindgen_malloc(buf.length, 1) >>> 0;
        (new Uint8Array(this.wasm.memory.buffer)).subarray(ptr, ptr + buf.length).set(buf);
        return [ptr, buf.length];
    }

    addToExternrefTable = (obj: any): number => {
        if (!this.wasm) return 0;

        const idx = this.wasm.__externref_table_alloc();
        this.wasm.__wbindgen_export_2.set(idx, obj);
        return idx;
    }

    getImports(): any {
        const CLOSURE_DTORS = new FinalizationRegistry((state: any) => {
            this.wasm.__wbindgen_export_5.get(state.dtor)(state.a, state.b)
        });

        const makeMutClosure = (arg0: any, arg1: any, dtor: any, f: any) => {
            const state = { a: arg0, b: arg1, cnt: 1, dtor };
            const real = (...args: any[]) => {
                state.cnt++;
                const a = state.a;
                state.a = 0;
                try {
                    return f(a, state.b, ...args);
                } finally {
                    if (--state.cnt === 0) {
                        this.wasm.__wbindgen_export_5.get(state.dtor)(a, state.b);
                        CLOSURE_DTORS.unregister(state);
                    } else state.a = a;
                }
            };
            real.original = state;
            CLOSURE_DTORS.register(real, state, state);
            return real;
        }

        const __wbg_adapter_6 = (arg0: any, arg1: any, arg2: any) => this.wasm.closure9_externref_shim(arg0, arg1, arg2);

        return {
            wbg: {
                __wbg_addEventListener_775911544ac9d643: (_t: any, arg1: number, arg2: number, callback: Function) => {
                    const listenerName = this.getStringFromWasm(arg1, arg2);
                    (this.canvasListeners as any)[listenerName] = callback;
                },
                __wbg_appendChild_87a6cc0aeb132c06: () => { },
                __wbg_axes_57e916a6e0ffb3e4: () => { },
                __wbg_body_8822ca55cb3730d2: () => this.addToExternrefTable(null),
                __wbg_call_13410aac570ffff7: () => { },
                __wbg_createElement_4909dfa2011f2abe: () => this.mockElement,
                __wbg_document_7d29d139bd619045: () => this.addToExternrefTable({}),
                __wbg_from_88bc52ce20ba6318: (arg0: Iterable<unknown> | ArrayLike<unknown>) => Array.from(arg0),
                __wbg_getGamepads_c373aed0f1e5e4a6: (arg0: any) => arg0.getGamepads(),
                __wbg_get_458e874b43b18b25: (arg0: any, arg1: any) => Reflect.get(arg0, arg1),
                __wbg_get_0da715ceaecea5c8: (arg0: any, arg1: any) => arg0[arg1 >>> 0],
                __wbg_has_b89e451f638123e3: () => true,
                __wbg_instanceof_Gamepad_2987f05b50f4775a: () => true,
                __wbg_instanceof_Window_12d20d558ef92592: () => true,
                __wbg_isTrusted_04e871d8dde8ea8a: () => true,
                __wbg_length_186546c51cd61acd: (...args: [any]) => args[0].length,
                __wbg_movementX_0ef0e79f7b9168fc: (...args: any[]) => args[0].movementX,
                __wbg_movementY_875c2fc2aabd99bf: (...args: any[]) => args[0].movementY,
                __wbg_navigator_65d5ad763926b868: (...args: any[]) => args[0].navigator,
                __wbg_new_19c25a3f2fa63a02: () => new Object(),
                __wbg_newnoargs_254190557c45b4ec: () => { },
                __wbg_now_1e80617bcee43265: () => this.processDate || Date.now(),
                __wbg_set_453345bcda80b89a: (...args: any[]) => Reflect.set(args[0], args[1], args[2]),
                __wbg_settextContent_b55fe2f5f1399466: async (...args: [unknown, number, number]) => {
                    this.mockElement.textContent = this.getStringFromWasm(args[1], args[2]);
                    this.processListeners.forEach((listener) => listener(this.mockElement.textContent));
                    this.processListeners = [];
                },
                __wbg_static_accessor_GLOBAL_8921f820c2ce3f12: () => { },
                __wbg_static_accessor_GLOBAL_THIS_f0a4409105898184: () => { },
                __wbg_static_accessor_SELF_995b214ae681ff99: () => this.addToExternrefTable({}),
                __wbg_static_accessor_WINDOW_cde3890479c675ea: () => { },
                __wbg_wbindgenbooleanget_3fe6f642c7d97746: (arg0: boolean) => {
                    if (typeof arg0 === 'boolean') return arg0 ? 1 : 0;
                    return null;
                },
                __wbg_wbindgendebugstring_99ef257a3ddda34d: (arg0: number, arg1: number) => {
                    const str = this.getStringFromWasm(arg0, arg1);
                    const [ptr, len] = this.passStringToWasm(str);
                    const dv = new DataView(this.wasm.memory.buffer);
                    dv.setInt32(arg0 + 4 * 1, len, true);
                    dv.setInt32(arg0 + 4 * 0, ptr, true);
                },
                __wbg_wbindgenisnull_f3037694abe4d97a: (arg0: any) => arg0 === null ? 1 : 0,
                __wbg_wbindgenisundefined_c4b71d073b92f3c5: (arg0: any) => typeof arg0 === 'undefined' ? 1 : 0,
                __wbg_wbindgennumberget_f74b4c7525ac05cb: (arg0: number, arg1: number) => {
                    const obj = arg1;
                    const ret = typeof (obj) === 'number' ? obj : 0;
                    const dv = new DataView(this.wasm.memory.buffer);
                    dv.setFloat64(arg0 + 8 * 1, ret, true);
                    dv.setInt32(arg0 + 4 * 0, 1, true);
                },
                __wbg_wbindgenthrow_451ec1a8469d7eb6: (a: any, b: any) => this.debug && console.log('call 31', a, b),
                __wbindgen_cast_01559742fdcca8af: (arg0: any, arg1: any) => makeMutClosure(arg0, arg1, 8, __wbg_adapter_6),
                __wbindgen_cast_2241b6af4c4b2941: (arg0: number, arg1: number) => this.getStringFromWasm(arg0, arg1),
                __wbindgen_cast_2495c10526b24646: (arg0: any, arg1: any) => makeMutClosure(arg0, arg1, 8, __wbg_adapter_6),
                __wbindgen_cast_d6cd19b81560fd6e: (arg0: any) => arg0,
                __wbindgen_init_externref_table: () => {
                    const table = this.wasm.__wbindgen_export_2;
                    const offset = table.grow(4);
                    table.set(0, null);
                    table.set(offset + 0, null);
                    table.set(offset + 1, null);
                    table.set(offset + 2, true);
                    table.set(offset + 3, false);
                }
            }
        }
    }

    // public use function divider

    async process(str: string, date?: number): Promise<string> {
        if (date) this.processDate = date;

        const promise = new Promise<string>((resolve) => this.processListeners.push(resolve));

        const [ptr, len] = this.passStringToWasm(str);
        this.wasm.process(ptr, len);

        return promise;
    }

    validate(input: string): string {
        const [ptr, len] = this.passStringToWasm(input);
        const [retPtr, retLen] = this.wasm.validate(ptr, len);

        const string = this.getStringFromWasm(retPtr, retLen);
        this.wasm.__wbindgen_free(retPtr, retLen, 1);
        return string;
    }

    getYawPitch = (): GetYawPitch => this.wasm.get_yaw_pitch();
    resetYawPitch = (): void => this.wasm.reset_yaw_pitch();

    coords(targetYaw: number, targetPitch: number): string {
        this.wasm.reset_yaw_pitch();

        const current = this.wasm.get_yaw_pitch();

        const normalizedCurrentYaw = normalizeYaw(current.yaw);
        const normalizedTargetYaw = normalizeYaw(targetYaw);

        const yawDiff = ((normalizedTargetYaw - normalizedCurrentYaw) + Math.PI) % (2 * Math.PI) - Math.PI;
        const pitchDiff = targetPitch - current.pitch;

        const movementX = Math.round(-yawDiff / 0.0025);
        const movementY = Math.round(-pitchDiff / 0.0025);

        this.canvasListeners.pointermove({ movementX, movementY });

        const newYawPitch = this.wasm.get_yaw_pitch();
        return newYawPitch.coords;
    }
}

export default WASM;