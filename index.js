// Import necessary modules
import fs from 'fs';
import csvParser from 'csv-parser';
import inquirer from 'inquirer';
import { exec } from 'child_process';

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
        // Clone selected repositories and perform other actions
        answers.selectedRepos.forEach((repo) => {
          const repoName = repo.split('/').pop().replace('.git', '');
          exec(`git clone ${repo} && cd ${repoName}`, (error, stdout, stderr) => {
            if (error) {
              console.error(`Error cloning repository ${repo}: ${error}`);
              return;
            }
            
            // Append user's selection to each file specified earlier
            const fileNames = answers.fileNames.split(',').map((fileName) => fileName.trim());
            fileNames.forEach((fileName) => {
              exec(`echo "${answers.userChoice}" >> ${fileName}`);
            });

            // Create a new branch and push changes
            exec('git checkout -b feat/rps && git add . && git commit -m "adding an rps" && git push origin feat/rps');
          });
        });
      });
  });
