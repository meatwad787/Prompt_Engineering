// Import necessary modules
import fs from 'fs';
import csvParser from 'csv-parser';
import inquirer from 'inquirer';
import { execSync } from 'child_process';

// Read and parse the CSV file
const githubRepos = [];
fs.createReadStream('repos.csv')
  .pipe(csvParser())
  .on('data', (row) => {
    githubRepos.push(row.link);
  })
  .on('end', () => {
    // Use Inquirer to let the user choose GitHub repositories
    inquirer
      .prompt([
        {
          type: 'checkbox',
          message: 'Select GitHub repositories to clone:',
          name: 'selectedRepos',
          choices: githubRepos,
        },
        {
          type: 'input',
          message: 'Enter a list of coding file names (comma-separated):',
          name: 'fileNames',
        },
        {
          type: 'list',
          message: 'Choose rock, paper, or scissors:',
          name: 'userChoice',
          choices: ['rock', 'paper', 'scissors'],
        },
      ])
      .then((answers) => {

        const choice = answers.userChoice;

        // Step 5: Clone selected repos and perform actions
        answers.selectedRepos.forEach((repo) => {
          const folderName = repo.split('/').pop().replace('.git', '');
          execSync(`git clone ${repo} && cd ${folderName} && git checkout -b feat/rps`);
        
          answers.fileNames.split(',').forEach((fileName) => {
            execSync(`cd ${folderName} && echo "${choice}" >> ${fileName} && git add . && git commit -m "adding an rps" && git push origin feat/rps`);
          });

      });
    });
  });