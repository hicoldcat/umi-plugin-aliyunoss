const isProd = process.env.NODE_ENV === 'prod';

export default [
    {
        target: 'node',
        cjs: { type: 'babel', lazy: true },
        disableTypeCheck: true,
        entry: 'src/index.ts',
        esm: "babel",
        umd: {
            minFile: isProd,
            sourcemap: !isProd,
        },
    }
];