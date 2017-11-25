module.exports = {
    entry: {
        bundle: "./src/index.ts",
        bundle_bare: "./src/bare.ts"
    },
    output: {
        path: __dirname,
        filename: "[name].js",
    },

    // Enable sourcemaps for debugging webpack's output.
    devtool: "source-map",

    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".ts", ".js"]
    },

    module: {
        loaders: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
            { test: /\.ts$/, loader: "ts-loader" }
        ]

    },

    // Other options...
};
