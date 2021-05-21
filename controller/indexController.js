const { Client } = require("pg");
require('dotenv').config();

// connection client
const client = new Client({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT,
});

// connect to the client
client.connect();

// get research areas
const getResearchAreas = async function() {
    const response = await client.query("SELECT json_build_object('type', 'FeatureCollection','features', json_agg(ST_AsGeoJSON(t.*)::json)) FROM research_area AS t;");
    console.log(response.rows);
    return response.rows;
}

const getArtefacts = async function() {
    const response = await client.query("SELECT json_build_object('type', 'FeatureCollection','features', json_agg(ST_AsGeoJSON(t.*)::json)) FROM artefacts AS t;");

    console.log(response.rows);
    return response.rows;
}

module.exports = { getResearchAreas, getArtefacts};