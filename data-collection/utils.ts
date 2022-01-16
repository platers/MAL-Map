export async function randomWait(minWait = 2000): Promise<void> {
    const random_wait = Math.floor(Math.random() * 3000) + minWait;
    return new Promise(resolve => {
        setTimeout(resolve, random_wait);
    });
}

/**
 * Executes a shell command and return it as a Promise.
 * @param cmd {string}
 * @return {Promise<string>}
 */
export function execShellCommand(cmd) {
    const exec = require('child_process').exec;
    return new Promise((resolve, reject) => {
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                console.warn(error);
            }
            resolve(stdout ? stdout : stderr);
        });
    });
}