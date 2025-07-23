// tsup.config.ts
export default {
  entry: ["src/**/*.ts", "config/data-source.ts", "config/swagger.ts"],
  outDir: "dist",
  format: ["esm"],
  target: "esnext",
  sourcemap: true,
  dts: false,
  clean: true,
}
