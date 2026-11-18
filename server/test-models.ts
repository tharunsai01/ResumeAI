import { connectDB, disconnectDB } from './src/config/db';
import { Application } from './src/models';

async function main() {
  await connectDB();
  const existing = await Application.findOne();
  try {
    await Application.create({
      job: existing!.job,
      candidate: existing!.candidate,
      resume: existing!.resume,
    });
    console.log('FAIL: duplicate application was allowed');
  } catch (e: any) {
    console.log(e.code === 11000 ? 'PASS: duplicate blocked' : e);
  }
  await disconnectDB();
}

main();
