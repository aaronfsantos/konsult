'use server';

export interface JiraProject {
  name: string;
  description: string;
  lead: string;
}

/**
 * Fetches details for a Jira project.
 * 
 * TODO: Replace this mock implementation with a real Jira API call.
 * 
 * To implement this, you will need to:
 * 1. Use the `fetch` API to call the Jira Cloud API endpoint for projects:
 *    `https://YOUR_JIRA_URL.atlassian.net/rest/api/3/project/{projectKey}`
 * 2. Add an `Authorization` header with a Basic auth token created from your
 *    Jira email and API token: `Basic BASE64_ENCODED(your-email:your-api-token)`
 * 3. Make sure to handle potential errors from the API call.
 * 
 * @param projectKey The key of the project to fetch (e.g., 'PROJ').
 * @returns A promise that resolves to the project details.
 */
export async function getJiraProjectDetails(projectKey: string): Promise<JiraProject> {
  console.log(`Fetching details for Jira project: ${projectKey}`);
  
  // This is mock data. Replace this with a real API call to Jira.
  if (process.env.JIRA_API_URL && process.env.JIRA_API_TOKEN) {
    // A real implementation would look something like this:
    /*
    const url = `${process.env.JIRA_API_URL}/rest/api/3/project/${projectKey}`;
    const authToken = Buffer.from(`${process.env.JIRA_USER_EMAIL}:${process.env.JIRA_API_TOKEN}`).toString('base64');
    
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Basic ${authToken}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Jira API request failed with status ${response.status}`);
      }

      const data = await response.json();

      return {
        name: data.name,
        description: data.description,
        lead: data.lead.displayName,
      };
    } catch (error) {
      console.error('Error fetching from Jira:', error);
      // Fallback to mock data or throw an error
      return {
        name: `Project ${projectKey}`,
        description: 'Could not fetch project details from Jira.',
        lead: 'Unknown',
      }
    }
    */
  }

  // Returning mock data for now
  return Promise.resolve({
    name: `Project "${projectKey}"`,
    description: `This is a mock description for project ${projectKey}. This is a project to manage internal tasks.`,
    lead: 'Project Lead',
  });
}
