export async function randomWait(minWait = 2000): Promise<void> {
    const random_wait = Math.floor(Math.random() * 3000) + minWait;
    return new Promise(resolve => {
        setTimeout(resolve, random_wait);
    });
}
