all:
	tsc ts/main.ts ts/test.ts --module "commonjs" --outDir js/
