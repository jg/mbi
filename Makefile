all:
	tsc ts/main.ts ts/app.ts ts/blast.ts --module "amd" --outDir js/
