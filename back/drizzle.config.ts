import dotenv from 'dotenv'
import { defineConfig } from 'drizzle-kit'

// Загружаем .env файл (важно для TS-конфига в ESM)
dotenv.config()

export default defineConfig({
	schema: './src/db/schema.ts',
	out: './drizzle/migrations',
	dialect: 'postgresql',
	dbCredentials: {
		url: process.env.DATABASE_URL!
	}
})
