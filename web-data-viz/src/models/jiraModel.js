var axios = require("axios");

const jiraClient = axios.create({
    baseURL: process.env.JIRA_DOMAIN,
    headers: {
        'Authorization': `Basic ${Buffer.from(`${process.env.JIRA_EMAIL}:${process.env.JIRA_TOKEN}`).toString('base64')}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
    timeout: 15000
});

async function search(jql, fields = null, maxResults = 50) {
    const qp = [
        `jql=${encodeURIComponent(jql)}`,
        `maxResults=${encodeURIComponent(maxResults)}`
    ];
    if (fields) qp.push(`fields=${encodeURIComponent(fields)}`);
    const url = `/rest/api/3/search/jql?${qp.join("&")}`;
    try {
    const resp = await jiraClient.get(url);
    return resp.data;
} catch (err) {
    console.error("\n=== ERRO NO AXIOS ===");
    console.error("URL chamada:", url);
    
    if (err.response) {
        console.error("STATUS:", err.response.status);
        console.error("DATA:", err.response.data);
    } else {
        console.error("SEM RESPOSTA DO SERVIDOR:", err.message);
    }

    console.error("=====================\n");
    throw err;
}
}

async function count(jql) {
    const data = await search(jql, null, 1);
    return data.total || 0;
}

async function fetchIssues(jql, fields = null, maxResults = 500) {
    const data = await search(jql, fields, maxResults);
    return data.issues || [];
}

console.log("JIRA DOMAIN:", process.env.JIRA_DOMAIN);
console.log("EMAIL:", process.env.JIRA_EMAIL);
console.log("TOKEN (inicio):", process.env.JIRA_TOKEN?.substring(0, 4));

module.exports = {
    jiraClient,
    search,
    count,
    fetchIssues
};