#!/usr/bin/env node
import { program } from 'commander';
import inquirer from 'inquirer';
import ora from 'ora';
import chalk from 'chalk';
import logSymbols from 'log-symbols';
import path from 'path';
import fs from 'fs';
import envinfo from 'envinfo';
import handlebars from 'handlebars';

const download = require('download-git-repo');

const gitUrL = 'https://github.com:xian88888888/';
const templates = [
  {
    description: 'project',
    name: 'webpack-react',
    value: `${gitUrL}webpack-react`,
  },
  {
    description: 'plugin',
    name: 'postcss-px-to-viewport-8-plugin',
    value: `${gitUrL}postcss-px-to-viewport-8-plugin`,
  },
];
const packageJson = require('../package.json');
const spinner = ora(chalk.yellow('正在下载模版...\n'));

const downloadTemplate = (url: string, name: string, root: string) => {
  return new Promise((resolve, reject) => {
    download(url, name, { clone: true }, function(err: Error) {
      if (err) {
        spinner.fail(chalk.red('下载失败\n'));
        console.log(chalk.red(err));
        reject(err);
        return;
      }
      spinner.succeed(chalk.green(`模版下载成功：${root}`));
      resolve(1);
    });
  });
};

const updateProjectInfo = (root: string, answers: any) => {
  const packagePath = path.join(root, 'package.json');
  const packageContent = fs.readFileSync(packagePath).toString();
  const packageResult = handlebars.compile(packageContent)(answers);
  fs.writeFileSync(packagePath, packageResult);
};

const createApp = async (name: string) => {
  const root = path.resolve(name);
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'template',
      choices: templates,
    },
    {
      type: 'input',
      message: '请输入项目名称：',
      name: 'name',
      default: name,
    },
    {
      type: 'input',
      message: '请输入项目描述：',
      name: 'description',
    },
    {
      type: 'input',
      message: '请输入作者名称：',
      name: 'authors',
    },
  ]);
  spinner.start();
  try {
    await downloadTemplate(answers.template, name, root);
    updateProjectInfo(root, answers);
  } catch (error) {
    console.error(error);
  }
};

const printInfo = () => {
  console.log(chalk.bold('\n环境信息:'));
  console.log(`\n  当前版本 ${packageJson.name}: ${packageJson.version}`);
  console.log(`  执行路径 ${__dirname}`);
  envinfo
    .run(
      {
        System: ['OS', 'CPU'],
        Binaries: ['Node', 'npm', 'Yarn'],
        Browsers: ['Chrome', 'Edge', 'Internet Explorer', 'Firefox', 'Safari'],
        npmPackages: ['react', 'mobx', 'antd', 'typescript'],
      },
      {
        duplicates: true,
        showNotFound: true,
      },
    )
    .then(console.log);
};

program.version(packageJson.version);

program
  .command('create <app-name>')
  .description('创建一个新项目')
  .action((name: string) => {
    createApp(name);
  });

program
  .command('list')
  .description('查询可用的项目模板')
  .action(() => {
    templates.forEach(item => {
      console.log(`\n ${item.description}--${item.name}`);
    });
  });

program
  .command('info')
  .description('打印环境信息')
  .action(() => {
    printInfo();
  });

program.parse(process.argv);
