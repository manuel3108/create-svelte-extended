#!/usr/bin/env node

const fetch = require('node-fetch');
const prompts = require('prompts');
var { spawnSync } = require('child_process');
var { cyan, magenta } = require('kleur');

const orgName = 'svelte-add';
const mainRepo = 'svelte-adders';
const cliName = orgName;

async function execute() {
    createSvelte();

    const repos = await getSvelteAddGithubRepositorys();

    let canceledByUser = false;

    while (!canceledByUser) {
        const addersResponse = await prompts(
            {
                type: 'select',
                name: 'value',
                message: 'Do you want to add some extra stuff?',
                hint:
                    'Use arrow-keys. Return to submit. CTRL + C or CMD + C to exit.',
                choices: repos.map((repo) => ({
                    title: `${cyan(repo.name)} - ${repo.description}`,
                    value: repo.name,
                })),
            },
            {
                onCancel: () => {
                    canceledByUser = true;
                    return false;
                },
            }
        );

        if (!canceledByUser) {
            await applySvelteAdder(addersResponse.value);
        }
    }

    console.log(
        `Run ${magenta('npm install')}, ${magenta(
            'pnpm install'
        )}, or ${magenta('yarn')} to install dependencies`
    );
}

// applys the adder by running the specified command
async function applySvelteAdder(name) {
    spawnSync('npx', [cliName, name, '--exclude-examples'], {
        shell: true,
        stdio: 'inherit',
    });
}

// fetch the github repositorys of svelte-add organization and prepare them
async function getSvelteAddGithubRepositorys() {
    const response = await fetch(
        `https://api.github.com/orgs/${orgName}/repos`
    );
    const repos = await response.json();

    let results = [];

    repos.forEach((repo) => {
        if (repo.full_name === `${orgName}/${mainRepo}`) {
            return;
        }

        results.push({
            name: repo.full_name.replace(orgName + '/', ''),
            description: repo.description,
        });
    });

    return results;
}

// create a clean svelte app
function createSvelte() {
    var createSvelteChild = spawnSync('npm', ['init', 'svelte@next'], {
        shell: true,
        stdio: 'inherit',
    });

    // if create svelte errord, exit the program
    if (createSvelteChild.status !== 0) {
        process.exit(1);
    }
}

execute();
