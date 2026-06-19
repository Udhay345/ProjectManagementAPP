const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runSetup() {
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = parseInt(process.env.DB_PORT || '3306');
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'project_management';

  console.log(`Connecting to MySQL server at ${host}:${port} as ${user}...`);

  let connection;
  try {
    // Connect without a database first, in case the database doesn't exist yet
    connection = await mysql.createConnection({
      host,
      port,
      user,
      password
    });
    console.log('Connected to MySQL server.');

    // Create the database if it doesn't exist and select it
    console.log(`Ensuring database '${database}' exists...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\``);
    await connection.query(`USE \`${database}\``);
    console.log(`Using database '${database}'.`);

    // Read the schema.sql file
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`schema.sql not found at ${schemaPath}`);
    }
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    // Parse statements (splitting on semicolons)
    // Basic split that ignores semicolons inside comments or quotes
    const statements = schemaSql
      .split(/;(?=(?:[^'"`]*['"`][^'"`]*['"`])*[^'"`]*$)/)
      .map(stmt => stmt.trim())
      // Strip leading comment lines from each statement
      .map(stmt => stmt.replace(/^(\s*--.*\n)*/gm, '').trim())
      .filter(stmt => stmt.length > 0);

    console.log(`Executing ${statements.length} SQL statements...`);

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      // Log brief snippet of the statement
      const snippet = stmt.substring(0, 50).replace(/\n/g, ' ') + '...';
      console.log(`[${i + 1}/${statements.length}] Executing: ${snippet}`);
      await connection.query(stmt);
    }

    console.log('\nSuccess! Database and tables have been successfully initialized.');
  } catch (error) {
    console.error('\nDatabase setup failed!');
    console.error(`Error details: ${error.message}`);
    console.error('\nEnsure your MySQL service is running and credentials in backend/.env are correct.');
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runSetup();
