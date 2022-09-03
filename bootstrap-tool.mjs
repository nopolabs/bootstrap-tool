#! /usr/bin/env node

/**
 * bootstrap-tool.mjs
 *
 * Usage: bootstrap-tool [project]
 */


import { Command, Argument } from 'commander';
import { $, argv, cd, chalk, fs, question } from "zx";
import path from "path";
import which from "which";

function exitWithError(errorMessage) {
  console.error(chalk.red(errorMessage));
  process.exit(1);
}

async function checkRequiredProgramsExist(programs) {
  try {
    for (let program of programs) {
      await which(program);
    }
  } catch (error) {
    exitWithError(`Error: Required command ${error.message}`);
  }
}

function isEmpty(path) {
	return fs.readdirSync(path).length === 0;
}

async function prepareDirectory(project) {
	const targetDir = path.resolve(project);
	if ((await fs.pathExists(targetDir))) {
		if (!isEmpty(targetDir)) {
			exitWithError(`${targetDir} is not empty!`)
		}
	} else {
		await fs.mkdirSync(targetDir, { recursive: true });
	}
	return targetDir;
}

async function getGlobalGitSettingValue(settingName) {
  $.verbose = false;

  let settingValue = "";
  try {
    settingValue = (
      await $`git config --global --get ${settingName}`
    ).stdout.trim();
  } catch (error) {
    // Ignore process output
  }

  $.verbose = true;

  return settingValue;
}

async function checkGlobalGitSettings(settingsToCheck) {
  for (let settingName of settingsToCheck) {
    const settingValue = await getGlobalGitSettingValue(settingName);
    if (!settingValue) {
      console.warn(
        chalk.yellow(`Warning: Global git setting '${settingName}' is not set.`)
      );
    }
  }
}

async function readPackageJson(dir) {
  const packageJsonFilepath = `${dir}/package.json`;

  return await fs.readJSON(packageJsonFilepath);
}

async function writePackageJson(dir, contents) {
  const packageJsonFilepath = `${dir}/package.json`;

  await fs.writeJSON(packageJsonFilepath, contents, { spaces: 2 });
}

async function createReadme(dir) {
	const { name: projectName } = await readPackageJson(dir);
	const readmeContents = `# ${projectName}\n\n...\n`;
	await fs.writeFile(`${dir}/README.md`, readmeContents);
}

async function initGit(gitignore) {
	await checkGlobalGitSettings(["user.name", "user.email"]);
	await $`git init`;
	if (gitignore) {
		await $`npx gitignore node`;
	}
	await $`git add .`;
	await $`git commit -m "bootstrapped"`;
}

async function bootstrap(directory, options) {
	await checkRequiredProgramsExist(["git", "node", "npx"]);
	const dir = await prepareDirectory(directory);
	cd(dir);
	await $`npm init --yes`;
	const packageJson = await readPackageJson(dir);
	packageJson.name = options.name ? options.name : packageJson.name;
	packageJson.version = options.version ? options.version : packageJson.version;
	packageJson.type = options.type;
	await writePackageJson(dir, packageJson);
	if (options.packages.length > 0) {
		await $`npm install ${options.packages}`;
	}
	if (options.editorconfig) {
		await $`npx mrm editorconfig`;
	}
	if (options.prettier) {
		await $`npx mrm prettier`;
	}
	if (options.eslint) {
		await $`npx mrm eslint`;
	}
	if (options.readme) {
		await createReadme(dir)
	}
	if (options.git) {
		await initGit(options.gitignore);
	}
	console.log(
		chalk.green(
			`\n✔️ The project ${packageJson.name} has been bootstrapped!\n`
		)
	);
	if (options.git) {
		console.log(chalk.green(`Add a git remote and push your changes.`));
	}
}

const program = new Command()
	.name('bootstrap-tool')
	.version('0.0.1')
	.description('Bootstrap a node project')
	.addHelpCommand(true)
	.helpOption(true)
	.addArgument(new Argument('[directory]', 'directory').default('.', 'current directory'))
	.option('-n, --name [package-name]', 'package-name (defaults to directory name)')
	.option('-v, --verion [version]', 'version (defaults to 1.0.0)')
	.option('--packages [packages...]', 'specify packages', [])
	.option('--type [module-system]', 'module or commonjs', "module")
	.option('--no-editorconfig', 'no editorconfig')
	.option('--no-eslint', 'no eslint')
	.option('--no-readme', 'no README.md')
	.option('--no-git', 'no git')
	.option('--no-gitignore', 'no gitignore')
	.option('--no-prettier', 'no prettier')
	.action(bootstrap);

await program.parseAsync(process.argv);
