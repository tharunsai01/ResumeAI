import { connectDB, disconnectDB } from './src/config/db';

async function main() {
	await connectDB();
	console.log('OK');
	await disconnectDB();
}

main().catch((err) => {
	console.error('Connection failed:' , err.message);
	process.exit(1)
});

