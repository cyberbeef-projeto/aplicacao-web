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
    const url = '/rest/api/3/search/jql';
    
    const params = {
        jql: jql,
        maxResults: maxResults
    };
    
    if (fields) {
        params.fields = fields;
    }
    
    try {
        const resp = await jiraClient.get(url, { params });
        return resp.data;
    } catch (err) {
        console.error("Erro na busca Jira:", {
            url: url,
            jql: jql,
            status: err.response?.status,
            message: err.message
        });
        throw err;
    }
}

async function count(jql) {
    const data = await search(jql, null, 1000);
    return data.issues?.length || 0;
}

async function fetchIssues(jql, fields = null, maxResults = 500) {
    const data = await search(jql, fields, maxResults);
    return data.issues || [];
}

if (process.env.NODE_ENV !== 'production') {
    console.log("Jira API configurada:", {
        domain: process.env.JIRA_DOMAIN,
        project: process.env.JIRA_PROJECT_KEY
    });
}

module.exports = {
    jiraClient,
    search,
    count,
    fetchIssues
};